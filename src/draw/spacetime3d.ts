/**
 * El espacio-tiempo en 3D (Three.js): una malla que se hunde alrededor del Sol y
 * planetas que recorren esa curva sin que nada los sujete.
 *
 * Dos "modos" que se mezclan con `cosmic` (0..1):
 *  - 0: malla de tiza vista desde arriba (parece la pizarra del colegio).
 *  - 1: malla de luz, en perspectiva, con el Sol brillando y planetas iluminados.
 */
import * as THREE from 'three';
import { easeInOutCubic, lerp } from '../core/math';
import { hex } from '../core/palette';
import type { Stage } from '../core/stage';
import { H, W } from '../core/stage';

export interface Body {
  orbit: number;
  size: number;
  color: string;
  speed: number;
  phase: number;
  trail?: number;
}

const DEPTH = 3.4;
const SOFT = 1.55;
const HALF = 13;
const RING_N = 180;

const gridVert = /* glsl */ `
  uniform float uDepth;
  uniform float uSoft;
  uniform float uRadius;
  varying float vFade;
  varying float vDeep;
  void main() {
    vec3 p = position;
    float r = length(p.xz);
    float w = 1.0 / sqrt(1.0 + (r * r) / (uSoft * uSoft));
    p.y = -uDepth * w;
    vFade = 1.0 - smoothstep(uRadius * 0.42, uRadius, r);
    vDeep = w;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const gridFrag = /* glsl */ `
  uniform vec3 uChalk;
  uniform vec3 uCosmos;
  uniform vec3 uHot;
  uniform float uMix;
  uniform float uAlpha;
  varying float vFade;
  varying float vDeep;
  void main() {
    vec3 cosmos = mix(uCosmos, uHot, smoothstep(0.3, 1.0, vDeep) * 0.55);
    vec3 col = mix(uChalk, cosmos, uMix);
    float a = uAlpha * vFade * mix(0.5, 0.35 + 0.65 * vDeep, uMix);
    gl_FragColor = vec4(col, a);
  }
`;

const trailVert = /* glsl */ `
  attribute float aT;
  varying float vT;
  void main() {
    vT = aT;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const trailFrag = /* glsl */ `
  uniform vec3 uColor;
  uniform float uAlpha;
  varying float vT;
  void main() {
    gl_FragColor = vec4(uColor, uAlpha * pow(1.0 - vT, 1.6));
  }
`;

function glowTexture(inner: string, outer: string) {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, inner);
  g.addColorStop(0.25, outer);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

const col = (h: string) => new THREE.Color(h);

interface BodyView {
  def: Body;
  mesh: THREE.Mesh;
  mat: THREE.MeshStandardMaterial;
  glow: THREE.Sprite;
  trail?: { geo: THREE.BufferGeometry; mat: THREE.ShaderMaterial; n: number };
  ring: { geo: THREE.BufferGeometry; mat: THREE.LineBasicMaterial };
}

export class SpacetimeView {
  readonly canvas: HTMLCanvasElement;
  /** 0 = plano, 1 = pozo completo. */
  well = 0;
  /** 0 = tiza, 1 = cosmos. */
  cosmic = 0;
  /** 0 = cámara cenital, 1 = perspectiva. */
  tilt = 0;
  /** Giro lento de la cámara alrededor del Sol (radianes). */
  spin = 0;
  /** Opacidad de las órbitas dibujadas (0..1). */
  rings = 0;
  /** Opacidad global de la malla. */
  gridAlpha = 1;

  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(38, W / H, 0.1, 200);
  private gridMat: THREE.ShaderMaterial;
  private sunMat: THREE.MeshBasicMaterial;
  private sun: THREE.Mesh;
  private sunGlow: THREE.Sprite;
  private sunHalo: THREE.Sprite;
  private light = new THREE.PointLight(0xfff1d6, 3.2, 0, 0);
  private ambient = new THREE.AmbientLight(0x8090c0, 0.5);
  private bodies: BodyView[] = [];
  private disposables: { dispose(): void }[] = [];
  private off: () => void;

  constructor(
    private stage: Stage,
    parent: HTMLElement,
    defs: Body[],
  ) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    this.renderer.setClearColor(0x000000, 0);
    this.canvas = this.renderer.domElement;
    this.canvas.className = 'layer';
    parent.appendChild(this.canvas);

    // Malla
    const positions: number[] = [];
    const seg = 240;
    for (let v = -HALF; v <= HALF + 1e-6; v += 0.5) {
      for (let i = 0; i < seg; i++) {
        const a = -HALF + (2 * HALF * i) / seg;
        const b = -HALF + (2 * HALF * (i + 1)) / seg;
        positions.push(a, 0, v, b, 0, v, v, 0, a, v, 0, b);
      }
    }
    const gridGeo = new THREE.BufferGeometry();
    gridGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    this.gridMat = new THREE.ShaderMaterial({
      vertexShader: gridVert,
      fragmentShader: gridFrag,
      transparent: true,
      depthWrite: false,
      uniforms: {
        uDepth: { value: 0 },
        uSoft: { value: SOFT },
        uRadius: { value: HALF },
        uChalk: { value: col(hex.chalk) },
        uCosmos: { value: col(hex.starlight) },
        uHot: { value: col('#ffd59a') },
        uMix: { value: 0 },
        uAlpha: { value: 1 },
      },
    });
    this.scene.add(new THREE.LineSegments(gridGeo, this.gridMat));
    this.disposables.push(gridGeo, this.gridMat);

    // Sol
    const sunGeo = new THREE.SphereGeometry(0.78, 48, 32);
    this.sunMat = new THREE.MeshBasicMaterial({ color: col(hex.chalkYellow) });
    this.sun = new THREE.Mesh(sunGeo, this.sunMat);
    this.scene.add(this.sun);
    const tGlow = glowTexture('rgba(255,244,214,1)', 'rgba(255,179,71,0.55)');
    const tHalo = glowTexture('rgba(255,190,110,0.5)', 'rgba(255,140,60,0.12)');
    this.sunGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: tGlow, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
    this.sunHalo = new THREE.Sprite(new THREE.SpriteMaterial({ map: tHalo, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
    this.sunGlow.scale.setScalar(4.2);
    this.sunHalo.scale.setScalar(11);
    this.scene.add(this.sunGlow, this.sunHalo, this.light, this.ambient);
    this.disposables.push(sunGeo, this.sunMat, tGlow, tHalo, this.sunGlow.material, this.sunHalo.material);

    // Planetas
    for (const def of defs) {
      const geo = new THREE.SphereGeometry(def.size, 40, 28);
      const mat = new THREE.MeshStandardMaterial({ color: col(def.color), roughness: 0.75, metalness: 0, emissive: col(hex.chalk) });
      const mesh = new THREE.Mesh(geo, mat);
      const tex = glowTexture('rgba(255,255,255,0.9)', 'rgba(255,255,255,0.15)');
      const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, color: col(def.color), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
      glow.scale.setScalar(def.size * 6);
      this.scene.add(mesh, glow);
      this.disposables.push(geo, mat, tex, glow.material);
      const rgeo = new THREE.BufferGeometry();
      rgeo.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(RING_N * 3), 3));
      const rmat = new THREE.LineBasicMaterial({ color: col(def.color), transparent: true, opacity: 0, depthWrite: false });
      this.scene.add(new THREE.LineLoop(rgeo, rmat));
      this.disposables.push(rgeo, rmat);
      const view: BodyView = { def, mesh, mat, glow, ring: { geo: rgeo, mat: rmat } };
      if (def.trail) {
        const n = 160;
        const tgeo = new THREE.BufferGeometry();
        tgeo.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(n * 3), 3));
        tgeo.setAttribute('aT', new THREE.Float32BufferAttribute(Float32Array.from({ length: n }, (_, i) => i / (n - 1)), 1));
        const tmat = new THREE.ShaderMaterial({
          vertexShader: trailVert,
          fragmentShader: trailFrag,
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          uniforms: { uColor: { value: col(def.color) }, uAlpha: { value: 0 } },
        });
        this.scene.add(new THREE.Line(tgeo, tmat));
        this.disposables.push(tgeo, tmat);
        view.trail = { geo: tgeo, mat: tmat, n };
      }
      this.bodies.push(view);
    }

    this.off = stage.onResize(() => this.resize());
    this.resize();
  }

  private wellY(r: number) {
    return (-DEPTH * this.well) / Math.sqrt(1 + (r * r) / (SOFT * SOFT));
  }

  resize() {
    this.renderer.setPixelRatio(this.stage.pixelRatio);
    this.renderer.setSize(W, H, false);
  }

  render(t: number) {
    const c = this.cosmic;
    this.gridMat.uniforms.uDepth.value = DEPTH * this.well;
    this.gridMat.uniforms.uMix.value = c;
    this.gridMat.uniforms.uAlpha.value = this.gridAlpha;

    // Sol: disco de tiza → estrella
    const sunY = this.wellY(0) + 0.9;
    this.sun.position.set(0, sunY, 0);
    this.sunMat.color.copy(col(hex.chalkYellow)).lerp(col(hex.sunCore), c);
    this.sunGlow.position.copy(this.sun.position);
    this.sunHalo.position.copy(this.sun.position);
    (this.sunGlow.material as THREE.SpriteMaterial).opacity = c;
    (this.sunHalo.material as THREE.SpriteMaterial).opacity = c * (0.85 + 0.15 * Math.sin(t * 1.3));
    this.light.position.copy(this.sun.position);
    this.light.intensity = 0.4 + 3 * c;

    for (const b of this.bodies) {
      const a = b.def.phase + t * b.def.speed;
      const r = b.def.orbit;
      const y = this.wellY(r) + b.def.size * 0.95;
      b.mesh.position.set(Math.cos(a) * r, y, Math.sin(a) * r);
      b.mat.emissive.copy(col(hex.chalk)).lerp(col(b.def.color), c);
      b.mat.emissiveIntensity = 1 - 0.82 * c;
      b.glow.position.copy(b.mesh.position);
      (b.glow.material as THREE.SpriteMaterial).opacity = 0.55 * c;
      const rpos = b.ring.geo.getAttribute('position') as THREE.BufferAttribute;
      const ry = this.wellY(r) + 0.02;
      for (let i = 0; i < RING_N; i++) {
        const ai = (Math.PI * 2 * i) / RING_N;
        rpos.setXYZ(i, Math.cos(ai) * r, ry, Math.sin(ai) * r);
      }
      rpos.needsUpdate = true;
      b.ring.mat.opacity = 0.3 * c * this.rings;
      if (b.trail) {
        const pos = b.trail.geo.getAttribute('position') as THREE.BufferAttribute;
        const span = b.def.trail ?? 1.2;
        for (let i = 0; i < b.trail.n; i++) {
          const ai = a - (span * i) / (b.trail.n - 1);
          pos.setXYZ(i, Math.cos(ai) * r, this.wellY(r) + 0.04, Math.sin(ai) * r);
        }
        pos.needsUpdate = true;
        b.trail.mat.uniforms.uAlpha.value = 0.9 * c;
      }
    }

    // Cámara: cenital → perspectiva, con giro opcional
    const k = easeInOutCubic(this.tilt);
    const height = lerp(24, 7.6, k);
    const dist = lerp(0.01, 14.8, k);
    this.camera.position.set(Math.sin(this.spin) * dist, height, Math.cos(this.spin) * dist);
    this.camera.lookAt(0, lerp(0, -1.5, k), 0);
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.off();
    this.disposables.forEach((d) => d.dispose());
    this.renderer.dispose();
    this.renderer.forceContextLoss();
    this.canvas.remove();
  }
}
