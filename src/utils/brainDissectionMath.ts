import * as THREE from 'three';
import type { AnatomyRole } from './softAnatomyShaders';
import { smootherstep } from './smootherstep';

export interface DissectionLayerConfig {
  role: AnatomyRole;
  renderOrder: number;
  fadeRange?: [number, number];
  driftVector?: [number, number, number];
  driftRotation?: [number, number, number];
}

export interface CalloutDef {
  id: string;
  meshName: string;
  label: string;
  targetHint: THREE.Vector3;
  offsetPx: [number, number];
  fadeInRange: [number, number];
  fadeOutRange?: [number, number];
  isPrimary?: boolean;
}

export const PAPEZ_ENSEMBLE_CENTER = new THREE.Vector3(-0.18, -0.11, 0.10);
export const HIPPOCAMPUS_ISOLATED_CENTER = new THREE.Vector3(0.08, -0.46, 0.40);

export const LAYER_CONFIGS: Record<string, DissectionLayerConfig> = {
  // 1. No Card 1 (0.16 -> 0.35), o córtex permanece 100% INTEIRO para leitura calma.
  //    A dissecação sólida ocorre suavemente na transição do Card 1 para o Card 2 (0.35 -> 0.58):
  cortex_left_temporal: {
    role: 'shell',
    renderOrder: 16,
    fadeRange: [0.35, 0.49],
    driftVector: [0.25, -0.65, 1.45],
    driftRotation: [0.08, 0.15, -0.05]
  },
  cortex_left_frontal: {
    role: 'shell',
    renderOrder: 15,
    fadeRange: [0.37, 0.51],
    driftVector: [-0.95, 0.65, 1.35],
    driftRotation: [-0.10, 0.14, 0.08]
  },
  cortex_left_parietal: {
    role: 'shell',
    renderOrder: 14,
    fadeRange: [0.40, 0.54],
    driftVector: [0.95, 0.65, 1.35],
    driftRotation: [-0.08, -0.14, -0.06]
  },

  // 2. Dissecação do outro lado do córtex completando a revelação sólida para o Card 2 (Circuito de Papez)
  cortex_right_temporal: {
    role: 'shell',
    renderOrder: 13,
    fadeRange: [0.42, 0.56],
    driftVector: [0.25, -0.65, -1.45],
    driftRotation: [-0.08, -0.15, -0.05]
  },
  cortex_right_frontal: {
    role: 'shell',
    renderOrder: 12,
    fadeRange: [0.44, 0.58],
    driftVector: [-0.95, 0.65, -1.35],
    driftRotation: [0.10, -0.14, 0.08]
  },
  cortex_right_parietal: {
    role: 'shell',
    renderOrder: 11,
    fadeRange: [0.46, 0.59],
    driftVector: [0.95, 0.65, -1.35],
    driftRotation: [0.08, 0.14, -0.06]
  },

  // 3. Estrutura Central (Corpo Caloso permanece na malha central, sem etiqueta nominal)
  papez_cingulate: {
    role: 'cingulate',
    renderOrder: 7
  },
  papez_callosum: {
    role: 'callosum',
    renderOrder: 6
  },
  papez_parahippocampal: {
    role: 'parahippocampal',
    renderOrder: 5
  },
  papez_thalamus: {
    role: 'thalamus',
    renderOrder: 4
  },
  papez_mammillary: {
    role: 'mammillary',
    renderOrder: 3
  },
  papez_fornix: {
    role: 'fornix',
    renderOrder: 2
  }
};

// Etiquetas do Circuito de Papez e Córtex Pré-Frontal
export const PAPEZ_CALLOUTS: CalloutDef[] = [
  {
    id: 'pfc',
    meshName: 'cortex_left_frontal',
    label: 'Córtex Pré-Frontal (PFC)',
    targetHint: new THREE.Vector3(-1.15, 0.45, 0.75),
    offsetPx: [-85, -68],
    fadeInRange: [0.13, 0.20],
    fadeOutRange: [0.39, 0.46],
    isPrimary: false
  },
  {
    id: 'cingulate',
    meshName: 'papez_cingulate',
    label: 'Giro do Cíngulo',
    targetHint: new THREE.Vector3(-0.32, 0.44, 0.14),
    offsetPx: [-106, -28],
    fadeInRange: [0.44, 0.50],
    fadeOutRange: [0.68, 0.75]
  },
  {
    id: 'fornix',
    meshName: 'papez_fornix',
    label: 'Fórnix',
    targetHint: new THREE.Vector3(0.26, -0.08, 0.28),
    offsetPx: [114, -18],
    fadeInRange: [0.45, 0.51],
    fadeOutRange: [0.68, 0.75]
  },
  {
    id: 'thalamus',
    meshName: 'papez_thalamus',
    label: 'Tálamo',
    targetHint: new THREE.Vector3(-0.02, -0.15, 0.34),
    offsetPx: [-118, -4],
    fadeInRange: [0.44, 0.50],
    fadeOutRange: [0.68, 0.75]
  },
  {
    id: 'mammillary',
    meshName: 'papez_mammillary',
    label: 'Corpos Mamilares',
    targetHint: new THREE.Vector3(-0.22, -0.40, 0.10),
    offsetPx: [-114, 34],
    fadeInRange: [0.46, 0.52],
    fadeOutRange: [0.68, 0.75]
  },
  {
    id: 'parahippocampal',
    meshName: 'papez_parahippocampal',
    label: 'Giro Parahipocampal',
    targetHint: new THREE.Vector3(-0.02, -0.68, 0.44),
    offsetPx: [88, 54],
    fadeInRange: [0.46, 0.52],
    fadeOutRange: [0.68, 0.75]
  },
  {
    id: 'hippocampus',
    meshName: 'hippocampus',
    label: 'Hipocampo',
    targetHint: new THREE.Vector3(0.12, -0.46, 0.54),
    offsetPx: [116, 18],
    fadeInRange: [0.45, 0.52],
    isPrimary: true
  }
];

export function snapAnchorToMeshSurface(
  geometry: THREE.BufferGeometry,
  hint: THREE.Vector3
): THREE.Vector3 {
  const pos = geometry.getAttribute('position');
  if (!pos || pos.count === 0) return hint.clone();

  let bestIdx = 0;
  let bestDistSq = Infinity;
  for (let i = 0; i < pos.count; i++) {
    const dx = pos.getX(i) - hint.x;
    const dy = pos.getY(i) - hint.y;
    const dz = pos.getZ(i) - hint.z;
    const d2 = dx * dx + dy * dy + dz * dz;
    if (d2 < bestDistSq) {
      bestDistSq = d2;
      bestIdx = i;
    }
  }
  return new THREE.Vector3(pos.getX(bestIdx), pos.getY(bestIdx), pos.getZ(bestIdx));
}

export interface DissectionPose {
  floatY: number;
  posX: number;
  posY: number;
  rotX: number;
  rotY: number;
  rotZ: number;
  papezFocusT: number;
  isolateHippoT: number;
  card1FrontalT: number;
  scaleZoom: number;
  shadowScale: number;
  shadowOpacity: number;
}

export function computeDissectionPose(
  p: number,
  elapsed: number,
  pointerX: number,
  pointerY: number,
  prefersReducedMotion: boolean
): DissectionPose {
  const motionScale = prefersReducedMotion ? 0.15 : 1.0;

  const floatY =
    (Math.sin(elapsed * 0.48) * 0.025 + Math.cos(elapsed * 0.24) * 0.008) * motionScale;

  const pendulumY = Math.sin(elapsed * 0.26) * 0.050 * motionScale;
  const gentleRollZ = Math.cos(elapsed * 0.22) * 0.006 * motionScale;

  // Movimento de apresentação frontal do Córtex Pré-Frontal no Card 1 (0.14 -> 0.38)
  // Suavemente gira e apresenta o pólo frontal em direção ao estudante e retorna ao alinhamento sagital antes da dissecação de Papez
  const card1FrontalT = smootherstep(0.12, 0.22, p) * (1.0 - smootherstep(0.38, 0.48, p));

  // Foco 1: enquadra o Circuito de Papez para o Card 2
  const papezFocusT = smootherstep(0.38, 0.54, p);
  // Foco 2: isola e destaca exclusivamente o Hipocampo apenas no último Card (Card 3: 0.68 -> 0.80, retido até 1.00)
  const isolateHippoT = smootherstep(0.68, 0.80, p);

  // Rotações orquestradas:
  // No Card 1, frontalYaw (+0.62 rad / ~35°) gira o lobo frontal para a frente da câmera, e frontalPitch (+0.08) expõe a face superior/dorsolateral
  const frontalYaw = card1FrontalT * 0.62 * motionScale;
  const frontalPitch = card1FrontalT * 0.08 * motionScale;

  const dissectYaw = papezFocusT * 0.065 + isolateHippoT * 0.085;
  const dissectPitch = 0.05 + papezFocusT * 0.03 + isolateHippoT * 0.04;

  const posX = -0.01 * (1.0 - papezFocusT);
  const posY = 0.015 * (1.0 - papezFocusT) + floatY;

  // Zoom progressivo: 1.0x (Córtex) -> 1.06x (Card 1 PFC) -> 1.30x (Circuito de Papez) -> 2.05x (Hipocampo Isolado)
  const scaleZoom = 1.0 + card1FrontalT * 0.06 + papezFocusT * 0.30 + isolateHippoT * 0.75;
  const shadowScale = 1.0 - floatY * 0.85 - papezFocusT * 0.14 - isolateHippoT * 0.26;
  const shadowOpacity = Math.max(0.10, Math.min(0.32, 0.24 - floatY * 0.45));

  return {
    floatY,
    posX,
    posY,
    rotX: dissectPitch + frontalPitch + pointerY * 0.010,
    rotY: pendulumY + dissectYaw + frontalYaw + pointerX * 0.015,
    rotZ: gentleRollZ,
    papezFocusT,
    isolateHippoT,
    card1FrontalT,
    scaleZoom,
    shadowScale,
    shadowOpacity
  };
}
