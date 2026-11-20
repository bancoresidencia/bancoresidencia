import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import {
  compressedLandingBrain,
  fetchLandingBrainAsset,
  originalLandingBrain,
  type LandingBrainDownload
} from '@/utils/landingBrainAssets';

export async function loadLandingBrainModel(signal: AbortSignal, prepared: LandingBrainDownload | null) {
  const readModel = async (url: string) => {
    signal.throwIfAborted();
    if (prepared?.url !== url) prepared?.abort();
    const data = await (prepared?.url === url ? prepared.data : fetchLandingBrainAsset(url, signal));
    signal.throwIfAborted();
    return data;
  };

  try {
    const { MeshoptDecoder } = await import('three/addons/libs/meshopt_decoder.module.js');
    if (MeshoptDecoder.supported) {
      await MeshoptDecoder.ready;
      const data = await readModel(compressedLandingBrain);
      return await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).parseAsync(data, '');
    }
  } catch (error) {
    if (signal.aborted) throw error;
    // Usa o mesmo modelo sem compactação se o navegador não puder usar o decodificador.
  }

  const data = await readModel(originalLandingBrain);
  return new GLTFLoader().parseAsync(data, '');
}
