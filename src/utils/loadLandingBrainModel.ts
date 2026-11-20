import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const compressedModel = '/models/cerebrum-papez-v7-meshopt.glb';
const originalModel = '/models/cerebrum-papez-v7.glb?v=72';

async function readModel(url: string, signal: AbortSignal) {
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error('Não foi possível carregar o modelo anatômico.');
  return response.arrayBuffer();
}

export async function loadLandingBrainModel(signal: AbortSignal) {
  try {
    const { MeshoptDecoder } = await import('three/addons/libs/meshopt_decoder.module.js');
    if (MeshoptDecoder.supported) {
      await MeshoptDecoder.ready;
      const data = await readModel(compressedModel, signal);
      return await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).parseAsync(data, '');
    }
  } catch (error) {
    if (signal.aborted) throw error;
    // Usa o mesmo modelo sem compactação se o navegador não puder usar o decodificador.
  }

  const data = await readModel(originalModel, signal);
  return new GLTFLoader().parseAsync(data, '');
}
