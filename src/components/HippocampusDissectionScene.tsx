'use client';

import React, { useEffect, useRef, useState, type RefObject } from 'react';
import * as THREE from 'three';
import { AccentConfig } from '@/context/ThemeContext';
import {
  AnatomyRole,
  createSoftAnatomyMaterial,
  resolveHighlightHex,
  SoftAnatomyUniforms,
  updateSoftAnatomyMaterialTheme
} from '@/utils/softAnatomyShaders';
import {
  computeDissectionPose,
  HIPPOCAMPUS_ISOLATED_CENTER,
  LAYER_CONFIGS,
  PAPEZ_CALLOUTS,
  PAPEZ_ENSEMBLE_CENTER,
  snapAnchorToMeshSurface
} from '@/utils/brainDissectionMath';
import { smootherstep } from '@/utils/smootherstep';
import { loadLandingBrainModel } from '@/utils/loadLandingBrainModel';
import type { LandingBrainDownload } from '@/utils/landingBrainAssets';

export interface HippocampusDissectionSceneProps {
  scrollProgressRef: RefObject<number>;
  isDark: boolean;
  accentConfig: AccentConfig;
  getPreparedModel: () => LandingBrainDownload | null;
  onLoaded?: () => void;
  onUnavailable?: () => void;
}

interface ManagedMaterialEntry {
  material: THREE.ShaderMaterial;
  role: AnatomyRole;
}

const layerConfigurations = Object.entries(LAYER_CONFIGS);
const scrollFrameIntervalMs = 1000 / 30;
const scrollActivityMs = 150;

export const HippocampusDissectionScene: React.FC<HippocampusDissectionSceneProps> = React.memo(
  function HippocampusDissectionScene({
    scrollProgressRef,
    isDark,
    accentConfig,
    getPreparedModel,
    onLoaded,
    onUnavailable
  }) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const backdropShadowRef = useRef<HTMLDivElement | null>(null);
  const floorShadowRef = useRef<HTMLDivElement | null>(null);
  const calloutGroupRefs = useRef<Record<string, SVGGElement | null>>({});
  const calloutLineRefs = useRef<Record<string, SVGLineElement | null>>({});
  const calloutDotRefs = useRef<Record<string, SVGCircleElement | null>>({});
  const calloutBadgeRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const hippoPillDotRef = useRef<HTMLSpanElement | null>(null);
  const pfcPillDotRef = useRef<HTMLSpanElement | null>(null);

  const isDarkRef = useRef<boolean>(isDark);
  const accentConfigRef = useRef(accentConfig);
  const highlightHexRef = useRef<string>(resolveHighlightHex(accentConfig, isDark));
  const materialsRef = useRef<ManagedMaterialEntry[]>([]);
  const pointerTargetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const [modelReady, setModelReady] = useState(false);
  const [webglSupported, setWebglSupported] = useState(true);

  useEffect(() => {
    isDarkRef.current = isDark;
    accentConfigRef.current = accentConfig;
    highlightHexRef.current = resolveHighlightHex(accentConfig, isDark);
    for (const entry of materialsRef.current) {
      updateSoftAnatomyMaterialTheme(entry.material, entry.role, isDark, accentConfig);
    }
  }, [isDark, accentConfig]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance'
      });
    } catch {
      queueMicrotask(() => {
        setWebglSupported(false);
        onUnavailable?.();
      });
      return;
    }

    // Otimização de GPU: 1.25x é visualmente idêntico a 1.75x em telas Retina/4K, reduzindo 40% da carga de fragment shader
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25));
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.LinearToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(31, 1, 0.1, 50);
    camera.position.set(0, 0.0, 5.95);
    camera.lookAt(0, 0, 0);

    const floatGroup = new THREE.Group();
    const focusGroup = new THREE.Group();
    const brainRoot = new THREE.Group();
    floatGroup.add(focusGroup);
    focusGroup.add(brainRoot);
    scene.add(floatGroup);

    const meshMap: Record<string, THREE.Mesh> = {};
    const snappedAnchors: Record<string, THREE.Vector3> = {};
    const createdMaterials: ManagedMaterialEntry[] = [];
    const modelGeometries = new Set<THREE.BufferGeometry>();

    let canvasWidth = 0;
    let canvasHeight = 0;
    const handleResize = () => {
      const w = Math.max(container.clientWidth, 1);
      const h = Math.max(container.clientHeight, 1);
      if (w === canvasWidth && h === canvasHeight) return;
      canvasWidth = w;
      canvasHeight = h;
      renderer.setSize(w, h, true);
      camera.aspect = w / h;
      camera.position.z = w < 520 ? 6.85 : w < 768 ? 6.25 : 5.80;
      camera.updateProjectionMatrix();
    };
    handleResize();

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    const handlePointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      const rawX = Math.max(-1, Math.min(1, ((e.clientX - rect.left) / rect.width - 0.5) * 2));
      const rawY = Math.max(-1, Math.min(1, ((e.clientY - rect.top) / rect.height - 0.5) * 2));
      const soften = (v: number) =>
        Math.abs(v) < 0.08 ? 0 : Math.sign(v) * Math.pow(Math.abs(v), 1.45);
      pointerTargetRef.current = { x: soften(rawX), y: soften(rawY) };
      wakeUp();
    };
    const handlePointerLeave = () => {
      pointerTargetRef.current = { x: 0, y: 0 };
      wakeUp();
    };
    container.addEventListener('pointermove', handlePointerMove, { passive: true });
    container.addEventListener('pointerleave', handlePointerLeave, { passive: true });

    const controller = new AbortController();
    let readyToRender = false;
    loadLandingBrainModel(controller.signal, getPreparedModel())
      .then((gltf) => {
        const defaultMaterials = new Set<THREE.Material>();
        gltf.scene.traverse((object) => {
          const mesh = object as THREE.Mesh;
          if (!mesh.isMesh) return;
          modelGeometries.add(mesh.geometry);
          for (const material of [mesh.material].flat()) defaultMaterials.add(material);
        });
        for (const material of defaultMaterials) material.dispose();
        if (controller.signal.aborted) {
          for (const geometry of modelGeometries) geometry.dispose();
          return;
        }

        gltf.scene.traverse((obj) => {
          if ((obj as THREE.Mesh).isMesh) {
            const mesh = obj as THREE.Mesh;
            const name = mesh.name || obj.parent?.name || '';
            const isHippo = name === 'hippocampus';
            const cfg = LAYER_CONFIGS[name];
            const role: AnatomyRole = isHippo ? 'hippocampus' : cfg?.role ?? 'shell';

            const mat = createSoftAnatomyMaterial(role, isDarkRef.current, accentConfigRef.current);
            if (name === 'cortex_left_frontal' || name === 'cortex_right_frontal') {
              (mat.uniforms as SoftAnatomyUniforms).uIsFrontalCortex.value = 1.0;
            }
            createdMaterials.push({ material: mat, role });

            const cleanMesh = new THREE.Mesh(mesh.geometry, mat);
            cleanMesh.name = name;
            cleanMesh.renderOrder = isHippo ? 1 : cfg?.renderOrder ?? 10;

            brainRoot.add(cleanMesh);
            meshMap[name] = cleanMesh;
          }
        });

        for (const callout of PAPEZ_CALLOUTS) {
          const targetMesh = meshMap[callout.meshName];
          if (targetMesh) {
            snappedAnchors[callout.id] = snapAnchorToMeshSurface(
              targetMesh.geometry,
              callout.targetHint
            );
          } else {
            snappedAnchors[callout.id] = callout.targetHint.clone();
          }
        }

        materialsRef.current = createdMaterials;
        readyToRender = true;
        syncAnimation();
        setModelReady(true);
        onLoaded?.();
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setWebglSupported(false);
          onUnavailable?.();
        }
      });

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    let smoothScroll = scrollProgressRef.current;
    let lastScrollTarget = smoothScroll;
    let lastScrollChangeMs = -Infinity;
    const smoothPointer = { x: 0, y: 0 };
    const projectedVec = new THREE.Vector3();
    const worldAnchor = new THREE.Vector3();
    const tempFocusCenter = new THREE.Vector3();
    const startTimeMs = performance.now();
    let lastTimeMs = startTimeMs;
    let rafId: number | null = null;
    let isVisible = typeof IntersectionObserver === 'undefined';
    let settledFrames = 0;

    const wakeUp = () => {
      settledFrames = 0;
      if (readyToRender && isVisible && !document.hidden && rafId === null) {
        lastTimeMs = performance.now();
        rafId = requestAnimationFrame(animate);
      }
    };

    const animate = () => {
      const nowMs = performance.now();
      const scrollTarget = scrollProgressRef.current;
      if (scrollTarget !== lastScrollTarget) {
        lastScrollTarget = scrollTarget;
        lastScrollChangeMs = nowMs;
      }
      // Zero-Render em repouso: 60/120 FPS fluido durante interação; pausa total do loop após convergir
      const isDynamic = Math.abs(scrollTarget - smoothScroll) > 0.0002 ||
                        Math.abs(pointerTargetRef.current.x - smoothPointer.x) > 0.0005 ||
                        (nowMs - lastScrollChangeMs < 280);

      if (!isDynamic) {
        settledFrames++;
        if (settledFrames > 6) {
          rafId = null;
          return; // Pausa 100% o loop WebGL. GPU = 0.0% em leitura estática!
        }
      } else {
        settledFrames = 0;
      }

      rafId = requestAnimationFrame(animate);

      const elapsed = (nowMs - startTimeMs) * 0.001;
      const dt = Math.min((nowMs - lastTimeMs) * 0.001, 0.1);
      lastTimeMs = nowMs;

      // Interpolação suave e estável independente da taxa de quadros (60Hz / 120Hz / throttled)
      const scrollDecay = 1.0 - Math.exp(-8.5 * dt);
      const pointerDecay = 1.0 - Math.exp(-3.2 * dt);
      smoothScroll += (scrollTarget - smoothScroll) * scrollDecay;
      smoothPointer.x += (pointerTargetRef.current.x - smoothPointer.x) * pointerDecay;
      smoothPointer.y += (pointerTargetRef.current.y - smoothPointer.y) * pointerDecay;

      const p = Math.max(0, Math.min(1, smoothScroll));
      const pose = computeDissectionPose(
        p,
        elapsed,
        smoothPointer.x,
        smoothPointer.y,
        prefersReducedMotion
      );

      floatGroup.position.set(pose.posX, pose.posY, 0);
      floatGroup.rotation.set(pose.rotX, pose.rotY, pose.rotZ);

      // Centro de foco: Cérebro Inteiro -> Circuito de Papez (Card 2) -> Hipocampo Isolado (Card 3)
      tempFocusCenter
        .set(0, 0, 0)
        .lerp(PAPEZ_ENSEMBLE_CENTER, pose.papezFocusT)
        .lerp(HIPPOCAMPUS_ISOLATED_CENTER, pose.isolateHippoT);

      focusGroup.scale.setScalar(pose.scaleZoom);
      focusGroup.position.set(
        -tempFocusCenter.x * pose.scaleZoom,
        -tempFocusCenter.y * pose.scaleZoom,
        -tempFocusCenter.z * pose.scaleZoom
      );

      // Dissolução suave das demais estruturas centrais APENAS na transição para o Card 3 (isolando o Hipocampo)
      const papezDissolveT = smootherstep(0.68, 0.80, p);
      const papezSupportOpacity = 1.0 - papezDissolveT;

      for (const [layerName, cfg] of layerConfigurations) {
        const mesh = meshMap[layerName];
        if (!mesh) continue;

        const mat = mesh.material as THREE.ShaderMaterial;
        const u = mat.uniforms as SoftAnatomyUniforms;
        u.uTime.value = elapsed;
        const isPfcMesh = layerName === 'cortex_left_frontal' || layerName === 'cortex_right_frontal';
        u.uHighlightMix.value = isPfcMesh ? pose.card1FrontalT * 0.70 : 0.0;

        if (cfg.fadeRange) {
          const layerT = smootherstep(cfg.fadeRange[0], cfg.fadeRange[1], p);
          // No Card 1 (p < 0.35): Córtex 100% sólido (uOpacity = 1.0)
          // Na transição para o Card 2 (Papez): os lobos se fragmentam, se afastam e dissolvem completamente para ZERO
          // garantindo que no Circuito de Papez APENAS as estruturas de Papez fiquem visíveis (sem peças soltas no fundo)
          u.uOpacity.value = Math.max(0.0, 1.0 - layerT);
          mesh.visible = u.uOpacity.value > 0.008;

          // Posição anatômica fixa e unificada (zero separação mecânica ou buracos):
          if (cfg.driftVector) {
            mesh.position.set(
              cfg.driftVector[0] * layerT,
              cfg.driftVector[1] * layerT,
              cfg.driftVector[2] * layerT
            );
          } else {
            mesh.position.set(0, 0, 0);
          }
          if (cfg.driftRotation) {
            mesh.rotation.set(
              cfg.driftRotation[0] * layerT,
              cfg.driftRotation[1] * layerT,
              cfg.driftRotation[2] * layerT
            );
          } else {
            mesh.rotation.set(0, 0, 0);
          }
        } else {
          u.uOpacity.value = papezSupportOpacity;
          mesh.visible = papezSupportOpacity > 0.006;
        }
      }

      // Hipocampo: neutro/consoante em todo o Card 2 (uHighlightMix = 0), destacado e isolado só no Card 3!
      const hippoMesh = meshMap.hippocampus;
      if (hippoMesh) {
        const hu = (hippoMesh.material as THREE.ShaderMaterial).uniforms as SoftAnatomyUniforms;
        hu.uTime.value = elapsed;
        hu.uOpacity.value = 1.0;
        hu.uHighlightMix.value = pose.isolateHippoT;
        hippoMesh.visible = true;
      }

      renderer.render(scene, camera);

      const cw = canvasWidth;
      const ch = canvasHeight;
      if (cw > 0 && ch > 0 && createdMaterials.length > 0) {
        floatGroup.updateMatrixWorld();
        const curHighlightHex = highlightHexRef.current;
        const curDark = isDarkRef.current;
        const hippoHighlighted = pose.isolateHippoT > 0.42;

        for (const callout of PAPEZ_CALLOUTS) {
          const fadeIn = smootherstep(callout.fadeInRange[0], callout.fadeInRange[1], p);
          const fadeOut = callout.fadeOutRange
            ? 1.0 - smootherstep(callout.fadeOutRange[0], callout.fadeOutRange[1], p)
            : 1.0;
          const mobileFactor = cw < 560 && !callout.isPrimary ? 0.0 : 1.0;
          const alpha = fadeIn * fadeOut * mobileFactor;

          const gEl = calloutGroupRefs.current[callout.id];
          const badgeEl = calloutBadgeRefs.current[callout.id];
          if (!gEl || !badgeEl) continue;

          if (alpha <= 0.015) {
            gEl.style.opacity = '0';
            badgeEl.style.opacity = '0';
            continue;
          }

          const anchor = snappedAnchors[callout.id] || callout.targetHint;
          const targetMesh = meshMap[callout.meshName];
          worldAnchor.copy(anchor);
          if (targetMesh) {
            targetMesh.localToWorld(worldAnchor);
          } else {
            brainRoot.localToWorld(worldAnchor);
          }
          projectedVec.copy(worldAnchor).project(camera);

          const sx = (projectedVec.x * 0.5 + 0.5) * cw;
          const sy = (-projectedVec.y * 0.5 + 0.5) * ch;

          const lx = Math.max(82, Math.min(cw - 82, sx + callout.offsetPx[0]));
          const ly = Math.max(38, Math.min(ch - 32, sy + callout.offsetPx[1]));

          gEl.style.opacity = alpha.toFixed(3);
          badgeEl.style.opacity = alpha.toFixed(3);
          badgeEl.style.transform = `translate3d(${lx.toFixed(1)}px, ${ly.toFixed(1)}px, 0) translate(-50%, -50%) scale(${
            callout.isPrimary ? (1 + pose.isolateHippoT * 0.08).toFixed(3) : '1'
          })`;

          const lineEl = calloutLineRefs.current[callout.id];
          const dotEl = calloutDotRefs.current[callout.id];
          const isPfcCallout = callout.id === 'pfc';
          const pfcHighlighted = isPfcCallout && pose.card1FrontalT > 0.35;
          const activeAccent = (callout.isPrimary && hippoHighlighted) || pfcHighlighted;

          if (lineEl) {
            lineEl.setAttribute('x1', sx.toFixed(1));
            lineEl.setAttribute('y1', sy.toFixed(1));
            lineEl.setAttribute('x2', lx.toFixed(1));
            lineEl.setAttribute('y2', ly.toFixed(1));
            lineEl.setAttribute(
              'stroke',
              activeAccent ? curHighlightHex : curDark ? '#a1a1aa' : '#52525b'
            );
            lineEl.setAttribute('stroke-width', activeAccent ? '1.6' : '1');
            lineEl.setAttribute('stroke-opacity', activeAccent ? '0.92' : '0.45');
          }
          if (dotEl) {
            dotEl.setAttribute('cx', sx.toFixed(1));
            dotEl.setAttribute('cy', sy.toFixed(1));
            dotEl.setAttribute('r', activeAccent ? '3.8' : '2.6');
            dotEl.setAttribute(
              'fill',
              activeAccent ? curHighlightHex : curDark ? '#e4e4e7' : '#3f3f46'
            );
          }

          if (callout.isPrimary) {
            badgeEl.style.borderColor = activeAccent ? `${curHighlightHex}77` : '';
            badgeEl.style.boxShadow = activeAccent ? `0 0 14px -2px ${curHighlightHex}33` : '';
            if (hippoPillDotRef.current) {
              hippoPillDotRef.current.style.display = activeAccent ? 'inline-block' : 'none';
              hippoPillDotRef.current.style.backgroundColor = curHighlightHex;
            }
          } else if (isPfcCallout) {
            badgeEl.style.borderColor = pfcHighlighted ? `${curHighlightHex}77` : '';
            badgeEl.style.boxShadow = pfcHighlighted ? `0 0 14px -2px ${curHighlightHex}33` : '';
            if (pfcPillDotRef.current) {
              pfcPillDotRef.current.style.display = pfcHighlighted ? 'inline-block' : 'none';
              pfcPillDotRef.current.style.backgroundColor = curHighlightHex;
            }
          }
        }
      }
    };

    const syncAnimation = () => {
      if (readyToRender && isVisible && !document.hidden) {
        wakeUp();
      } else if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    };
    const visibilityObserver = typeof IntersectionObserver !== 'undefined'
      ? new IntersectionObserver(([entry]) => {
          isVisible = entry.isIntersecting;
          syncAnimation();
        }, { rootMargin: '120px 0px' })
      : null;
    visibilityObserver?.observe(container);
    document.addEventListener('visibilitychange', syncAnimation);
    window.addEventListener('scroll', wakeUp, { passive: true });

    return () => {
      controller.abort();
      if (rafId !== null) cancelAnimationFrame(rafId);
      visibilityObserver?.disconnect();
      document.removeEventListener('visibilitychange', syncAnimation);
      window.removeEventListener('scroll', wakeUp);
      container.removeEventListener('pointermove', handlePointerMove);
      container.removeEventListener('pointerleave', handlePointerLeave);
      resizeObserver.disconnect();
      for (const geometry of modelGeometries) geometry.dispose();
      for (const entry of createdMaterials) entry.material.dispose();
      renderer.dispose();
      materialsRef.current = [];
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getPreparedModel, onLoaded, onUnavailable, scrollProgressRef]);

  const effectiveHighlight = resolveHighlightHex(accentConfig, isDark);

  if (!webglSupported) {
    return (
      <div className="w-full h-full flex items-center justify-center p-6">
        <div
          className="w-40 h-40 rounded-full opacity-25 blur-3xl"
          style={{ backgroundColor: effectiveHighlight }}
        />
      </div>
    );
  }

  return (
    <div className="relative w-full h-full select-none">
      <div
        ref={mountRef}
        className={`relative z-[2] w-full h-full transition-opacity duration-1000 ease-out ${
          modelReady ? 'opacity-100' : 'opacity-0'
        }`}
      />

      <svg
        className="pointer-events-none absolute inset-0 w-full h-full overflow-visible z-10"
        aria-hidden="true"
      >
        {PAPEZ_CALLOUTS.map((c) => (
          <g
            key={c.id}
            ref={(el) => {
              calloutGroupRefs.current[c.id] = el;
            }}
            style={{ opacity: 0 }}
          >
            <line
              ref={(el) => {
                calloutLineRefs.current[c.id] = el;
              }}
              stroke={isDark ? '#a1a1aa' : '#52525b'}
              strokeWidth={1}
              strokeOpacity={0.45}
            />
            <circle
              ref={(el) => {
                calloutDotRefs.current[c.id] = el;
              }}
              r={2.6}
              fill={isDark ? '#e4e4e7' : '#3f3f46'}
            />
          </g>
        ))}
      </svg>

      <div className="pointer-events-none absolute inset-0 overflow-visible z-20" aria-hidden="true">
        {PAPEZ_CALLOUTS.map((c) => (
          <div
            key={c.id}
            ref={(el) => {
              calloutBadgeRefs.current[c.id] = el;
            }}
            style={{ opacity: 0 }}
            className="absolute top-0 left-0 px-2.5 py-1 rounded-full border bg-white/95 dark:bg-zinc-900/95 border-zinc-200/90 dark:border-zinc-800/90 text-zinc-800 dark:text-zinc-200 text-[10px] sm:text-[11px] font-semibold transition-colors duration-200 whitespace-nowrap shadow-sm will-change-transform"
          >
            {c.isPrimary && (
              <span
                ref={hippoPillDotRef}
                style={{ display: 'none' }}
                className="w-1.5 h-1.5 rounded-full mr-1.5 align-middle"
              />
            )}
            {c.id === 'pfc' && (
              <span
                ref={pfcPillDotRef}
                style={{ display: 'none' }}
                className="w-1.5 h-1.5 rounded-full mr-1.5 align-middle"
              />
            )}
            {c.label}
          </div>
        ))}
      </div>
    </div>
  );
});

export default HippocampusDissectionScene;
