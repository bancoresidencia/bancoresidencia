import * as THREE from 'three';

export interface EngravingUniforms {
  [uniform: string]: THREE.IUniform<unknown>;
  uInkColor: THREE.IUniform<THREE.Color>;
  uPaperColor: THREE.IUniform<THREE.Color>;
  uAccentColor: THREE.IUniform<THREE.Color>;
  uLightDir: THREE.IUniform<THREE.Vector3>;
  uOpacity: THREE.IUniform<number>;
  uHatchScale: THREE.IUniform<number>;
  uIsHippocampus: THREE.IUniform<number>;
  uDarkMode: THREE.IUniform<number>;
  uCutaway: THREE.IUniform<number>;
  uTime: THREE.IUniform<number>;
  uGlowIntensity: THREE.IUniform<number>;
}

const VERTEX_SHADER = /* glsl */ `
  varying vec3 vLocalPos;
  varying vec3 vLocalNormal;
  varying vec3 vWorldNormal;
  varying vec3 vViewDir;
  varying vec3 vWorldPos;

  void main() {
    vLocalPos = position;
    vLocalNormal = normalize(normal);

    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPosition.xyz;
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    vViewDir = normalize(cameraPosition - worldPosition.xyz);

    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  uniform vec3 uInkColor;
  uniform vec3 uPaperColor;
  uniform vec3 uAccentColor;
  uniform vec3 uLightDir;
  uniform float uOpacity;
  uniform float uHatchScale;
  uniform float uIsHippocampus;
  uniform float uDarkMode;
  uniform float uCutaway;
  uniform float uTime;
  uniform float uGlowIntensity;

  varying vec3 vLocalPos;
  varying vec3 vLocalNormal;
  varying vec3 vWorldNormal;
  varying vec3 vViewDir;
  varying vec3 vWorldPos;

  // Hash e ruído 3D suave para imperfeição rústica de papel/xilogravura
  float hash31(vec3 p) {
    p = fract(p * 0.1031);
    p += dot(p, p.yzx + 33.33);
    return fract((p.x + p.y) * p.z);
  }

  float noise3D(vec3 x) {
    vec3 i = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);

    return mix(
      mix(
        mix(hash31(i + vec3(0, 0, 0)), hash31(i + vec3(1, 0, 0)), f.x),
        mix(hash31(i + vec3(0, 1, 0)), hash31(i + vec3(1, 1, 0)), f.x),
        f.y
      ),
      mix(
        mix(hash31(i + vec3(0, 0, 1)), hash31(i + vec3(1, 0, 1)), f.x),
        mix(hash31(i + vec3(0, 1, 1)), hash31(i + vec3(1, 1, 1)), f.x),
        f.y
      ),
      f.z
    );
  }

  // Padrão de linha gravada a bico de pena em espaço 2D com sutil orgânica de gravura clássica
  float hatchStroke(vec2 uv, float angle, float freq, float thickness, float warp) {
    float c = cos(angle);
    float s = sin(angle);
    vec2 r = vec2(uv.x * c - uv.y * s, uv.x * s + uv.y * c);
    float wave = sin(r.x * freq * 0.14 + warp * 2.2) * 0.07;
    float line = abs(sin((r.y + wave) * freq));
    float aa = clamp(fwidth(r.y * freq) * 0.75, 0.03, 0.28);
    return smoothstep(thickness - aa, thickness + aa, line);
  }

  // Projeção triplanar em coordenadas locais 3D (as hachuras giram junto com o cérebro!)
  float triplanarHatch(vec3 p, vec3 n, float angle, float freq, float thickness, float warp) {
    vec3 blend = abs(normalize(n));
    blend = pow(blend, vec3(4.0));
    blend /= (blend.x + blend.y + blend.z + 0.0001);

    float hx = hatchStroke(p.yz, angle, freq, thickness, warp);
    float hy = hatchStroke(p.xz, angle + 0.35, freq, thickness, warp);
    float hz = hatchStroke(p.xy, angle - 0.25, freq, thickness, warp);

    return hx * blend.x + hy * blend.y + hz * blend.z;
  }

  void main() {
    if (uOpacity <= 0.01) discard;

    // Janela de dissecação anatômica lateral (abre como a gravura clássica da Imagem 1)
    if (uCutaway > 0.001 && uIsHippocampus < 0.5) {
      float organicEdge = (noise3D(vLocalPos * 5.8) - 0.5) * 0.24;
      // Centro exato sobre a região opercular/temporal lateral esquerda sobrepondo o Hipocampo (0.075, -0.15, 0.40)
      vec3 windowCenter = vec3(0.12, -0.02, 0.68);
      float distWindow = length((vLocalPos - windowCenter) * vec3(0.92, 1.18, 0.85)) + organicEdge;
      float cutRadius = uCutaway * 2.15;
      if (distWindow < cutRadius) {
        discard;
      }
    }

    // Normais de face dupla (para quando vemos a face interna cortada da dissecação)
    vec3 N = normalize(vWorldNormal);
    if (!gl_FrontFacing) {
      N = -N;
    }
    vec3 V = normalize(vViewDir);
    vec3 L = normalize(uLightDir);

    // Ruído rústico de fibra/papel e variação de pressão da pena
    float grain = noise3D(vLocalPos * 20.0);
    float fineGrain = noise3D(vLocalPos * 64.0);
    float warp = (grain - 0.5) * 0.22;

    // Detecção suave de sulcos cerebrais profundos sem marcar micro-facetas
    float rawCurv = length(fwidth(N));
    float curvature = smoothstep(0.06, 0.34, rawCurv);

    // Iluminação clássica de estúdio anatômico (Key + Fill suave + Rim/Contorno)
    float ndotl = dot(N, L) * 0.5 + 0.5;
    vec3 fillDir = normalize(vec3(-L.x, 0.35, -L.z));
    float fill = max(dot(N, fillDir), 0.0) * 0.20;
    float fresnel = pow(1.0 - clamp(abs(dot(N, V)), 0.0, 1.0), 2.25);

    // Luminância combinada: sulcos e bordas recebem carga de nanquim de xilogravura
    float lum = clamp(ndotl * 0.90 + fill - curvature * 0.42 - fresnel * 0.44 + (grain - 0.5) * 0.06, 0.0, 1.0);

    // Escala das hachuras
    float freq = uHatchScale;

    // 3 camadas clássicas de hachura cruzada (bico de pena / água-forte como Gray's Anatomy)
    float h1 = triplanarHatch(vLocalPos, vLocalNormal, 0.62, freq, 0.34, warp);
    float h2 = triplanarHatch(vLocalPos, vLocalNormal, -0.54, freq * 1.06, 0.38, warp);
    float h3 = triplanarHatch(vLocalPos, vLocalNormal, 1.54, freq * 1.42, 0.44, warp);

    // Quanto menor lum, mais camadas de hachura se cruzam (1.0 = papel limpo, 0.0 = nanquim sólido)
    float shade = 1.0;
    // Camada 1: meios-tons claros (traços paralelos de pena)
    float w1 = smoothstep(0.82, 0.50, lum);
    shade = mix(shade, shade * h1, w1 * 0.86);

    // Camada 2: meios-tons médios (hachura cruzada em losango)
    float w2 = smoothstep(0.56, 0.26, lum);
    shade = mix(shade, shade * h2, w2 * 0.90);

    // Camada 3: sombras profundas e sulcos corticais
    float w3 = smoothstep(0.34, 0.08, lum);
    shade = mix(shade, shade * h3, w3 * 0.94);

    // Nanquim profundo nas fendas/sulcos e contorno externo
    float deepInk = smoothstep(0.20, 0.02, lum);
    float contourInk = smoothstep(0.50, 0.86, fresnel) * 0.82 + curvature * 0.68;
    float inkDensity = clamp((1.0 - shade) + deepInk * 0.78 + contourInk * 0.58 + (fineGrain - 0.5) * 0.08, 0.0, 1.0);

    vec3 finalColor;

    if (uIsHippocampus > 0.5) {
      // HIPOCAMPO EM DESTAQUE DINÂMICO COM GRAVURA RÚSTICA NÍTIDA (fiel à crista iluminada + bordas hachuradas da Imagem 1)
      float pulse = 0.95 + 0.05 * sin(uTime * 2.2);
      float spec = pow(max(dot(reflect(-L, N), V), 0.0), 10.0);
      float innerCore = pow(clamp(abs(dot(N, V)), 0.0, 1.0), 1.65);

      // Crista central iluminada + corpo pigmentado na cor viva do tema + nanquim rústico nas bordas e digitações
      vec3 brightCore = mix(uAccentColor, vec3(1.0), 0.62);
      vec3 richBody = uAccentColor * (0.98 + uGlowIntensity * 0.24) * pulse;
      vec3 darkEdgeInk = uDarkMode > 0.5 ? vec3(0.04, 0.04, 0.05) : vec3(0.07, 0.07, 0.09);

      vec3 hippoBase = mix(richBody, brightCore, clamp(innerCore * 0.52 + spec * 0.58, 0.0, 1.0));
      // Preserva hachuras cruzadas rústicas e contorno em bico de pena sobre o Hipocampo
      float hippoEtch = clamp(inkDensity * 0.82, 0.0, 0.92);
      finalColor = mix(hippoBase, darkEdgeInk, hippoEtch * (1.0 - innerCore * 0.38));
    } else {
      // ESTRUTURAS DO ENCÉFALO E SISTEMA LÍMBICO EM GRAVURA CLÁSSICA RÚSTICA
      if (uDarkMode > 0.5) {
        // Modo Escuro Neutro (#09090b): sulcos escuros em carvão e cristas dos giros gravadas em marfim/prata rústica
        float lightEtch = clamp((1.0 - inkDensity) * 0.92 + (1.0 - fresnel) * 0.08, 0.0, 1.0);
        // Contorno sutil prateado para silhueta 3D nítida no escuro
        float darkRim = smoothstep(0.58, 0.92, fresnel) * 0.32;
        finalColor = mix(uPaperColor, uInkColor, clamp(lightEtch * 0.82 + darkRim, 0.0, 1.0));
      } else {
        // Modo Claro: papel pergaminho/marfim neutro com traços densos em nanquim/carvão (fiel à Imagem 1)
        finalColor = mix(uPaperColor, uInkColor, inkDensity);
      }

      // Na borda do corte anatômico, desenha uma linha rústica de dissecação estilo bico de pena
      if (uCutaway > 0.001) {
        float organicEdge = (noise3D(vLocalPos * 5.8) - 0.5) * 0.24;
        vec3 windowCenter = vec3(0.12, -0.02, 0.68);
        float distWindow = length((vLocalPos - windowCenter) * vec3(0.92, 1.18, 0.85)) + organicEdge;
        float borderBand = 1.0 - smoothstep(0.0, 0.075, abs(distWindow - uCutaway * 2.15));
        finalColor = mix(finalColor, uInkColor, borderBand * 0.72);
      }
    }

    // Dissolução pontilhada (stipple) rústica quando a peça está saindo na dissecação
    float alpha = uOpacity;
    if (uOpacity < 0.96) {
      float stipple = fineGrain * 0.32 + grain * 0.28;
      alpha = smoothstep(0.0, 0.88, uOpacity + (stipple - 0.30) * (1.0 - uOpacity));
      if (alpha < 0.04) discard;
    }

    gl_FragColor = vec4(finalColor, alpha);
  }
`;

export interface CreateEngravingMaterialOptions {
  isHippocampus?: boolean;
  isDark: boolean;
  accentHex: string;
  hatchScale?: number;
}

export function resolveHighlightHex(accentHex: string, isDark: boolean): string {
  const normalized = accentHex.trim().toLowerCase();
  // No tema Monocromático/Neutral (#18181b / #52525b), garante destaque luminoso no escuro e ciano-grafite clássico ou contraste nítido no claro
  if (normalized === '#18181b' || normalized === '#27272a' || normalized === '#52525b') {
    return isDark ? '#e4e4e7' : '#0891b2';
  }
  return accentHex;
}

export function getPaletteForTheme(isDark: boolean, accentHex: string) {
  const effectiveAccent = resolveHighlightHex(accentHex, isDark);
  if (isDark) {
    // True Neutral Dark (#09090b / #121215 — zero tom azulado conforme med-student-ux)
    return {
      paper: new THREE.Color('#0c0c0f'),
      ink: new THREE.Color('#d4d4d8'),
      accent: new THREE.Color(effectiveAccent)
    };
  }
  // Modo Claro: papel gravura marfim sutil + nanquim carvão clássico (Imagem 1)
  return {
    paper: new THREE.Color('#f6f5f0'),
    ink: new THREE.Color('#141417'),
    accent: new THREE.Color(effectiveAccent)
  };
}

export function createEngravingMaterial(options: CreateEngravingMaterialOptions): THREE.ShaderMaterial {
  const { isHippocampus = false, isDark, accentHex, hatchScale = 34.0 } = options;
  const palette = getPaletteForTheme(isDark, accentHex);

  const uniforms: EngravingUniforms = {
    uInkColor: { value: palette.ink },
    uPaperColor: { value: palette.paper },
    uAccentColor: { value: palette.accent },
    uLightDir: { value: new THREE.Vector3(-0.55, 0.72, 0.68).normalize() },
    uOpacity: { value: 1.0 },
    uHatchScale: { value: hatchScale },
    uIsHippocampus: { value: isHippocampus ? 1.0 : 0.0 },
    uDarkMode: { value: isDark ? 1.0 : 0.0 },
    uCutaway: { value: 0.0 },
    uTime: { value: 0.0 },
    uGlowIntensity: { value: isHippocampus ? 0.55 : 0.0 }
  };

  return new THREE.ShaderMaterial({
    uniforms,
    vertexShader: VERTEX_SHADER,
    fragmentShader: FRAGMENT_SHADER,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: true
  });
}

export function updateEngravingMaterialTheme(
  material: THREE.ShaderMaterial,
  isDark: boolean,
  accentHex: string
): void {
  const palette = getPaletteForTheme(isDark, accentHex);
  const u = material.uniforms as EngravingUniforms;
  u.uInkColor.value.copy(palette.ink);
  u.uPaperColor.value.copy(palette.paper);
  u.uAccentColor.value.copy(palette.accent);
  u.uDarkMode.value = isDark ? 1.0 : 0.0;
}
