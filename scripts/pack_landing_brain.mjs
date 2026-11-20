import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { MeshoptEncoder } from 'meshoptimizer/encoder';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';

const sourceUrl = new URL('../public/models/cerebrum-papez-v7.glb', import.meta.url);
const outputUrl = new URL('../public/models/cerebrum-papez-v7-meshopt.glb', import.meta.url);
const extension = 'KHR_meshopt_compression';
const alignToFourBytes = (length) => Math.ceil(length / 4) * 4;

await Promise.all([MeshoptEncoder.ready, MeshoptDecoder.ready]);

const source = await readFile(sourceUrl);
assert.equal(source.readUInt32LE(0), 0x46546c67, 'Expected a binary glTF model');
assert.equal(source.readUInt32LE(4), 2, 'Expected glTF version 2');
const jsonLength = source.readUInt32LE(12);
const gltf = JSON.parse(source.toString('utf8', 20, 20 + jsonLength));
const geometry = source.subarray(28 + jsonLength);
assert.equal(gltf.buffers.length, 1);
assert.equal(gltf.images?.length ?? 0, 0);
assert.equal(gltf.extensionsUsed?.length ?? 0, 0);

const encodedViews = [];
let offset = 0;
for (const [index, view] of gltf.bufferViews.entries()) {
  const accessors = gltf.accessors.filter((accessor) => accessor.bufferView === index);
  assert.equal(accessors.length, 1, 'Expected one accessor per buffer view');
  const { count } = accessors[0];
  const byteStride = view.byteLength / count;
  const originalOffset = view.byteOffset ?? 0;
  const original = geometry.subarray(originalOffset, originalOffset + view.byteLength);
  const isIndex = view.target === 34963;
  const mode = isIndex ? 'INDICES' : 'ATTRIBUTES';

  const encoded = isIndex
    ? MeshoptEncoder.encodeIndexSequence(original, count, byteStride)
    : MeshoptEncoder.encodeVertexBufferLevel(original, count, byteStride, 3, 1);

  const decoded = Buffer.alloc(view.byteLength);
  MeshoptDecoder.decodeGltfBuffer(decoded, count, byteStride, encoded, mode);
  assert.ok(original.equals(decoded), 'Meshopt changed buffer view ' + index);

  view.buffer = 1;
  view.extensions = {
    [extension]: { buffer: 0, byteOffset: offset, byteLength: encoded.length, byteStride, count, mode }
  };
  const padded = Buffer.alloc(alignToFourBytes(encoded.length));
  padded.set(encoded);
  encodedViews.push(padded);
  offset += padded.length;
}

gltf.extensionsUsed = [extension];
gltf.extensionsRequired = [extension];
gltf.buffers = [
  { byteLength: offset },
  { byteLength: geometry.length, extensions: { [extension]: { fallback: true } } }
];

const json = Buffer.from(JSON.stringify(gltf));
const alignedJsonLength = alignToFourBytes(json.length);
const binary = Buffer.concat(encodedViews);
const output = Buffer.alloc(28 + alignedJsonLength + binary.length);
output.writeUInt32LE(0x46546c67, 0);
output.writeUInt32LE(2, 4);
output.writeUInt32LE(output.length, 8);
output.writeUInt32LE(alignedJsonLength, 12);
output.writeUInt32LE(0x4e4f534a, 16);
output.fill(0x20, 20, 20 + alignedJsonLength);
json.copy(output, 20);
output.writeUInt32LE(binary.length, 20 + alignedJsonLength);
output.writeUInt32LE(0x004e4942, 24 + alignedJsonLength);
binary.copy(output, 28 + alignedJsonLength);

await writeFile(outputUrl, output);
console.log('Verified ' + gltf.bufferViews.length + ' buffers. GLB: ' + source.length + ' → ' + output.length + ' bytes.');
