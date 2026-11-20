export const compressedLandingBrain = '/models/cerebrum-papez-v7-meshopt.glb';
export const originalLandingBrain = '/models/cerebrum-papez-v7.glb?v=72';

export async function fetchLandingBrainAsset(url: string, signal: AbortSignal) {
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error('Não foi possível carregar o modelo anatômico.');
  return response.arrayBuffer();
}

export function prepareLandingBrainDownload() {
  const controller = new AbortController();
  const url = typeof WebAssembly === 'object' ? compressedLandingBrain : originalLandingBrain;
  const data = fetchLandingBrainAsset(url, controller.signal);
  // The scene consumes this promise later, including when the request fails.
  void data.catch(() => {});
  return { url, data, abort: () => controller.abort() };
}

export type LandingBrainDownload = ReturnType<typeof prepareLandingBrainDownload>;
