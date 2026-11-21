import * as THREE from 'three';
import { AccentConfig } from '@/context/ThemeContext';

export type AnatomyRole =
  | 'shell'
  | 'callosum'
  | 'cingulate'
  | 'parahippocampal'
  | 'thalamus'
  | 'mammillary'
  | 'fornix'
  | 'hippocampus';

export interface SoftAnatomyUniforms {
  [uniform: string]: THREE.IUniform<unknown>;
  uBaseColor: THREE.IUniform<THREE.Color>;
  uSulcusColor: THREE.IUniform<THREE.Color>;
  uWaveColor: THREE.IUniform<THREE.Color>;
  uSecondaryWave: THREE.IUniform<THREE.Color>;
  uCrestWave: THREE.IUniform<THREE.Color>;
  uHighlightBase: THREE.IUniform<THREE.Color>;
  uHighlightShadow: THREE.IUniform<THREE.Color>;
  uHighlightInk: THREE.IUniform<THREE.Color>;
  uRimColor: THREE.IUniform<THREE.Color>;
  uLightDir: THREE.IUniform<THREE.Vector3>;
  uOpacity: THREE.IUniform<number>;
  uHatchStrength: THREE.IUniform<number>;
  uHatchFreq: THREE.IUniform<number>;
  uHighlightMix: THREE.IUniform<number>;
  uIsFrontalCortex: THREE.IUniform<number>;
  uBrightness: THREE.IUniform<number>;
  uIsLight: THREE.IUniform<number>;
  uWaveMode: THREE.IUniform<number>;
  uTime: THREE.IUniform<number>;
}

const VERTEX_SHADER = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vViewPos;
  varying vec3 vLocalPos;
  varying vec3 vLocalNormal;
  varying float vSulcus;

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vLocalPos = position;
    vLocalNormal = normalize(normal);
    vSulcus = uv.x;

    vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
    vViewPos = -mvPos.xyz;
    gl_Position = projectionMatrix * mvPos;
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  uniform vec3 uBaseColor;
  uniform vec3 uSulcusColor;
  uniform vec3 uWaveColor;
  uniform vec3 uSecondaryWave;
  uniform vec3 uCrestWave;
  uniform vec3 uHighlightBase;
  uniform vec3 uHighlightShadow;
  uniform vec3 uHighlightInk;
  uniform vec3 uRimColor;
  uniform vec3 uLightDir;
  uniform float uOpacity;
  uniform float uHatchStrength;
  uniform float uHatchFreq;
  uniform float uHighlightMix;
  uniform float uIsFrontalCortex;
  uniform float uBrightness;
  uniform float uIsLight;
  uniform float uWaveMode;
  uniform float uTime;

  varying vec3 vNormal;
  varying vec3 vViewPos;
  varying vec3 vLocalPos;
  varying vec3 vLocalNormal;
  varying float vSulcus;

  void main() {
    if (uOpacity <= 0.004) discard;

    vec3 norm = normalize(vNormal);
    if (!gl_FrontFacing) norm = -norm;
    vec3 viewDir = normalize(vViewPos);
    vec3 keyDir = normalize(vec3(0.5, 0.9, 0.7));
    float key = max(dot(norm, keyDir), 0.0);
    float fill = max(dot(norm, normalize(vec3(-0.8, -0.2, 0.5))), 0.0) * 0.45;
    float hemi = norm.y * 0.5 + 0.5;

    // Iluminação difusa mineral equilibrada (zero washout no claro, rica profundidade no escuro)
    float baseFloor = (uIsLight > 0.5) ? 0.44 : (0.58 * uBrightness);
    float keyTerm = key * ((uIsLight > 0.5) ? 0.38 : 0.48);
    float fillTerm = fill * ((uIsLight > 0.5) ? 0.32 : 0.45);
    float hemiTerm = hemi * ((uIsLight > 0.5) ? 0.25 : 0.32);
    vec3 surface = uBaseColor * (keyTerm + fillTerm + hemiTerm + baseFloor);

    // Sulcos profundos e fendas anatômicas
    float sulcus = smoothstep(0.38, 0.90, vSulcus);
    surface = mix(surface, uSulcusColor * (uIsLight > 0.5 ? 1.0 : uBrightness * 0.9), sulcus * 0.48);

    // Silhueta com sombreamento de contato no modo claro
    float rimFactor = pow(1.0 - clamp(dot(viewDir, norm), 0.0, 1.0), 2.4);
    if (uIsLight > 0.5) surface *= (1.0 - rimFactor * 0.18);

    // Eixo anatômico biológico Antero-Posterior: Polo Frontal (Anterior, X ~ -1.56) -> Polo Occipital (Posterior, X ~ +1.56)
    float axisAP = clamp((vLocalPos.x + 1.56) / 3.12, 0.0, 1.0);
    float curvedAP = clamp(axisAP + vLocalPos.y * 0.08, 0.0, 1.0);

    vec3 activeWave = vec3(0.0);

    if (uWaveMode < 0.5) {
      // Degradê Ondulante Suave (Palavras) — 3 tons harmônicos contínuos e lentos (~12s)
      float und1 = sin(curvedAP * 3.6 - uTime * 0.52) * 0.5 + 0.5;
      float und2 = sin(axisAP * 7.2 - uTime * 0.78) * 0.5 + 0.5;
      float smoothWave = smoothstep(0.12, 0.88, mix(und1, und2, 0.22));

      vec3 waveHarmonic;
      if (smoothWave < 0.5) {
        waveHarmonic = mix(uWaveColor, uSecondaryWave, smoothstep(0.0, 0.5, smoothWave));
      } else {
        waveHarmonic = mix(uSecondaryWave, uCrestWave, smoothstep(0.5, 1.0, smoothWave));
      }

      float sulcalPresence = sulcus * 0.65 + 0.35;
      activeWave = waveHarmonic * smoothWave * sulcalPresence * ((uIsLight > 0.5) ? 0.38 : 0.32);
    } else {
      // Varredura Focal
      float cycleT = mod(uTime, 12.0) / 12.0;
      float wavePhase = 0.5 - 0.5 * cos(cycleT * 6.2831853);
      float targetPos = mix(-0.15, 1.15, wavePhase);
      float dist = abs(curvedAP - targetPos);

      float waveBeam = 1.0 - smoothstep(0.0, 0.25, dist);
      float waveCore = 1.0 - smoothstep(0.0, 0.06, dist);

      vec3 sweepHarmonic = mix(uWaveColor, uSecondaryWave, waveBeam);
      sweepHarmonic = mix(sweepHarmonic, uCrestWave, waveCore);

      float sulcalIgnition = waveBeam * (sulcus * 1.2 + 0.3);
      activeWave = sweepHarmonic * (sulcalIgnition * 0.65 + waveCore * 0.35) * ((uIsLight > 0.5) ? 0.42 : 0.35);
    }

    vec3 finalColor = surface + activeWave;
    finalColor += uRimColor * rimFactor * ((uIsLight > 0.5) ? 0.35 : 0.55);

    // Destaque luminoso do Córtex Pré-Frontal (Card 1) ou Hipocampo isolado (Card 3)
    if (uHighlightMix > 0.001) {
      float effHighlight = uHighlightMix;
      if (uIsFrontalCortex > 0.5) {
        // Delimitação anatômica exata do Córtex Pré-Frontal (PFC) conforme literatura médica e Imagem 3:
        // Polo frontal anterior (X de -1.56 até ~ -0.70). A transição suave até -0.45 respeita a demarcação pré-motora.
        float pfcZone = 1.0 - smoothstep(-0.80, -0.45, vLocalPos.x);
        effHighlight *= pfcZone * 1.25;
      }
      if (effHighlight > 0.001) {
        float hFactor = clamp(effHighlight, 0.0, 1.0);
        vec3 hippoLit = mix(uHighlightShadow, uHighlightBase, key * 0.5 + hemi * 0.3 + 0.35);
        hippoLit += uRimColor * rimFactor * 0.75;
        finalColor = mix(finalColor, hippoLit, hFactor);
        float pulse = 0.985 + 0.015 * sin(uTime * 1.4);
        finalColor *= mix(1.0, pulse * 1.06, hFactor);
      }
    }

    gl_FragColor = vec4(finalColor, uOpacity);
  }
`;

export function resolveHighlightHex(accentConfig: AccentConfig, isDark: boolean): string {
  if (accentConfig.id === 'neutral') {
    return isDark ? '#f4f4f5' : '#27272a';
  }
  return accentConfig.primaryHex;
}

const THEME_WAVE_PALETTES: Record<
  string,
  {
    waveDark: number;
    secWaveDark: number;
    crestWaveDark: number;
    rimDark: number;
    waveLight: number;
    secWaveLight: number;
    crestWaveLight: number;
    rimLight: number;
  }
> = {
  cyan: {
    waveDark: 0x0284c7,
    secWaveDark: 0x38bdf8,
    crestWaveDark: 0xccfbf1,
    rimDark: 0x38bdf8,
    waveLight: 0x0369a1,
    secWaveLight: 0x0284c7,
    crestWaveLight: 0x0c4a6e,
    rimLight: 0x0369a1
  },
  blue: {
    waveDark: 0x1d4ed8,
    secWaveDark: 0x38bdf8,
    crestWaveDark: 0xe0f2fe,
    rimDark: 0x60a5fa,
    waveLight: 0x1e40af,
    secWaveLight: 0x2563eb,
    crestWaveLight: 0x172554,
    rimLight: 0x1e40af
  },
  green: {
    waveDark: 0x047857,
    secWaveDark: 0x10b981,
    crestWaveDark: 0xd1fae5,
    rimDark: 0x34d399,
    waveLight: 0x065f46,
    secWaveLight: 0x047857,
    crestWaveLight: 0x022c22,
    rimLight: 0x065f46
  },
  purple: {
    waveDark: 0x5b21b6,
    secWaveDark: 0xa855f7,
    crestWaveDark: 0xf3e8ff,
    rimDark: 0xc084fc,
    waveLight: 0x5b21b6,
    secWaveLight: 0x6d28d9,
    crestWaveLight: 0x3b0764,
    rimLight: 0x5b21b6
  },
  red: {
    waveDark: 0x7f1d1d,
    secWaveDark: 0xb91c1c,
    crestWaveDark: 0xfef3c7,
    rimDark: 0x991b1b,
    waveLight: 0x7f1d1d,
    secWaveLight: 0x991b1b,
    crestWaveLight: 0x450a0a,
    rimLight: 0x7f1d1d
  },
  rose: {
    waveDark: 0x7f1d1d,
    secWaveDark: 0xb91c1c,
    crestWaveDark: 0xfef3c7,
    rimDark: 0x991b1b,
    waveLight: 0x7f1d1d,
    secWaveLight: 0x991b1b,
    crestWaveLight: 0x450a0a,
    rimLight: 0x7f1d1d
  },
  orange: {
    waveDark: 0xea580c,
    secWaveDark: 0xfacc15,
    crestWaveDark: 0xfef9c3,
    rimDark: 0xfdba74,
    waveLight: 0xc2410c,
    secWaveLight: 0xea580c,
    crestWaveLight: 0x7c2d12,
    rimLight: 0xc2410c
  },
  neutral: {
    waveDark: 0x3f3f46,
    secWaveDark: 0xa1a1aa,
    crestWaveDark: 0xf8fafc,
    rimDark: 0xe4e4e7,
    waveLight: 0x27272a,
    secWaveLight: 0x3f3f46,
    crestWaveLight: 0x09090b,
    rimLight: 0x27272a
  }
};

interface RoleColors {
  base: THREE.Color;
  sulcus: THREE.Color;
  wave: THREE.Color;
  secWave: THREE.Color;
  crestWave: THREE.Color;
  highlightBase: THREE.Color;
  highlightShadow: THREE.Color;
  highlightInk: THREE.Color;
  rim: THREE.Color;
  hatchStrength: number;
  hatchFreq: number;
  brightness: number;
}

function computeRoleColors(
  role: AnatomyRole,
  isDark: boolean,
  accentConfig: AccentConfig
): RoleColors {
  const isMono = accentConfig.id === 'neutral';
  const pal = THEME_WAVE_PALETTES[accentConfig.id] || THEME_WAVE_PALETTES.cyan;

  const waveColor = new THREE.Color(isDark ? pal.waveDark : pal.waveLight);
  const secWaveColor = new THREE.Color(isDark ? pal.secWaveDark : pal.secWaveLight);
  const crestWaveColor = new THREE.Color(isDark ? pal.crestWaveDark : pal.crestWaveLight);
  const rimColor = new THREE.Color(isDark ? pal.rimDark : pal.rimLight);

  // Modo Escuro: Titânio/Gunmetal acetinado elegante (alta luminância difusa para total visibilidade contra preto)
  // Modo Claro: Cerâmica mineral alabastro pura (zero washout, sulcos cinza-escuros profundos)
  const brainBase = new THREE.Color(isDark ? 0x6b7c93 : 0xf1f3f5);
  const papezBase = new THREE.Color(isDark ? 0x8294ab : 0xf8f9fa);
  const brainSulcus = new THREE.Color(isDark ? 0x1e2633 : 0x27272a);

  // Paleta de destaque luminosa do Hipocampo no Card 3
  const primary = new THREE.Color(
    isMono ? (isDark ? '#f4f4f5' : '#27272a') : accentConfig.primaryHex
  );
  const hippoNeutral = new THREE.Color(isDark ? '#888a9a' : '#e2e8f0');
  const richHippo = primary.clone().lerp(hippoNeutral, isMono ? 0.0 : 0.12);
  const highlightBase = richHippo.clone().lerp(new THREE.Color('#ffffff'), isDark ? 0.20 : 0.12);
  const highlightShadow = richHippo.clone().multiplyScalar(isDark ? 0.52 : 0.62);
  const highlightInk = richHippo.clone().multiplyScalar(0.12);

  if (role === 'shell') {
    return {
      base: brainBase,
      sulcus: brainSulcus,
      wave: waveColor,
      secWave: secWaveColor,
      crestWave: crestWaveColor,
      highlightBase,
      highlightShadow,
      highlightInk,
      rim: rimColor,
      hatchStrength: 0.0,
      hatchFreq: 70.0,
      brightness: isDark ? 0.68 : 0.76
    };
  }

  // Estruturas centrais do Circuito de Papez
  const isHippo = role === 'hippocampus';
  return {
    base: papezBase,
    sulcus: brainSulcus,
    wave: waveColor,
    secWave: secWaveColor,
    crestWave: crestWaveColor,
    highlightBase,
    highlightShadow,
    highlightInk,
    rim: isHippo ? richHippo.clone().lerp(new THREE.Color('#ffffff'), 0.40) : rimColor,
    hatchStrength: 0.0,
    hatchFreq: isHippo ? 82.0 : 76.0,
    brightness: isDark ? 0.72 : 0.78
  };
}

export function createSoftAnatomyMaterial(
  role: AnatomyRole,
  isDark: boolean,
  accentConfig: AccentConfig
): THREE.ShaderMaterial {
  const c = computeRoleColors(role, isDark, accentConfig);

  const uniforms: SoftAnatomyUniforms = {
    uBaseColor: { value: c.base },
    uSulcusColor: { value: c.sulcus },
    uWaveColor: { value: c.wave },
    uSecondaryWave: { value: c.secWave },
    uCrestWave: { value: c.crestWave },
    uHighlightBase: { value: c.highlightBase },
    uHighlightShadow: { value: c.highlightShadow },
    uHighlightInk: { value: c.highlightInk },
    uRimColor: { value: c.rim },
    uLightDir: { value: new THREE.Vector3(-0.44, 0.72, 0.66).normalize() },
    uOpacity: { value: 1.0 },
    uHatchStrength: { value: 0.0 },
    uHatchFreq: { value: c.hatchFreq },
    uHighlightMix: { value: 0.0 },
    uIsFrontalCortex: { value: 0.0 },
    uBrightness: { value: c.brightness },
    uIsLight: { value: isDark ? 0.0 : 1.0 },
    uWaveMode: { value: 0.0 },
    uTime: { value: 0.0 }
  };

  return new THREE.ShaderMaterial({
    uniforms,
    vertexShader: VERTEX_SHADER,
    fragmentShader: FRAGMENT_SHADER,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: true,
    depthTest: true
  });
}

export function updateSoftAnatomyMaterialTheme(
  material: THREE.ShaderMaterial,
  role: AnatomyRole,
  isDark: boolean,
  accentConfig: AccentConfig
): void {
  const c = computeRoleColors(role, isDark, accentConfig);
  const u = material.uniforms as SoftAnatomyUniforms;
  if (!u) return;

  u.uBaseColor.value.copy(c.base);
  u.uSulcusColor.value.copy(c.sulcus);
  u.uWaveColor.value.copy(c.wave);
  u.uSecondaryWave.value.copy(c.secWave);
  u.uCrestWave.value.copy(c.crestWave);
  u.uHighlightBase.value.copy(c.highlightBase);
  u.uHighlightShadow.value.copy(c.highlightShadow);
  u.uHighlightInk.value.copy(c.highlightInk);
  u.uRimColor.value.copy(c.rim);
  u.uHatchStrength.value = c.hatchStrength;
  u.uHatchFreq.value = c.hatchFreq;
  u.uBrightness.value = c.brightness;
  u.uIsLight.value = isDark ? 0.0 : 1.0;
}
