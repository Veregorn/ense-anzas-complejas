/**
 * La nube electrónica en 3D (Three.js). Cada punto es una "foto" de dónde aparece el electrón:
 * las posiciones se muestrean de la densidad de probabilidad real del átomo de hidrógeno.
 *  - 1s:  |ψ|² ∝ e^(−2r)            → radio ~ Gamma(3, ½) · esfera
 *  - 2p:  |ψ|² ∝ r² e^(−r) cos²θ    → radio ~ Gamma(5, 1) · dos lóbulos
 * `reveal` hace aparecer los puntos uno a uno (con un destello) y `morph` los lleva de 1s a 2p.
 */
import * as THREE from 'three';
import { rng } from '../core/math';
import type { Stage } from '../core/stage';
import { H, W } from '../core/stage';

const N = 14000;

const vert = /* glsl */ `
  attribute vec3 p2;
  attribute float birth;
  attribute float sgn;
  attribute float jitter;
  uniform float uShown;
  uniform float uMorph;
  uniform float uPR;
  varying float vFlash;
  varying float vSign;
  varying float vMorph;
  void main() {
    float d = uShown - birth;
    float vis = step(0.0, d);
    vFlash = vis * exp(-d / 70.0);
    vSign = sgn;
    float m = clamp(uMorph * 1.35 - jitter * 0.35, 0.0, 1.0);
    m = m * m * (3.0 - 2.0 * m);
    vMorph = m;
    vec3 pos = mix(position, p2, m);
    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = vis * (5.5 + 18.0 * vFlash) * uPR * (26.0 / -mv.z);
  }
`;

const frag = /* glsl */ `
  uniform vec3 uCol1s;
  uniform vec3 uColPos;
  uniform vec3 uColNeg;
  uniform float uAlpha;
  varying float vFlash;
  varying float vSign;
  varying float vMorph;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float r = length(c);
    if (r > 0.5) discard;
    float soft = smoothstep(0.5, 0.0, r);
    vec3 lobe = vSign > 0.0 ? uColPos : uColNeg;
    vec3 col = mix(uCol1s, lobe, vMorph);
    col = mix(col, vec3(1.0), vFlash);
    gl_FragColor = vec4(col, soft * uAlpha * (0.7 + 0.3 * vFlash));
  }
`;

/** Gamma(k entero, θ) como suma de exponenciales. */
function gamma(r: () => number, k: number, theta: number) {
  let s = 0;
  for (let i = 0; i < k; i++) s -= Math.log(1 - r());
  return s * theta;
}

function unitVec(r: () => number): [number, number, number] {
  const z = 2 * r() - 1;
  const a = 2 * Math.PI * r();
  const q = Math.sqrt(1 - z * z);
  return [q * Math.cos(a), z, q * Math.sin(a)];
}

export class ElectronCloud {
  readonly canvas: HTMLCanvasElement;
  /** 0..1: fracción de "fotos" ya tomadas. */
  reveal = 0;
  /** 0 = orbital 1s (esfera), 1 = orbital 2p (lóbulos). */
  morph = 0;
  alpha = 1;
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(36, W / H, 0.1, 200);
  private mat: THREE.ShaderMaterial;
  private points: THREE.Points;
  private nucleus: THREE.Sprite;
  private geo: THREE.BufferGeometry;
  private off: () => void;

  constructor(
    private stage: Stage,
    parent: HTMLElement,
    private centerX = 1250,
  ) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setClearColor(0x000000, 0);
    this.canvas = this.renderer.domElement;
    this.canvas.className = 'layer';
    parent.appendChild(this.canvas);

    const r = rng(1926);
    const p1 = new Float32Array(N * 3);
    const p2 = new Float32Array(N * 3);
    const birth = new Float32Array(N);
    const sgn = new Float32Array(N);
    const jitter = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      const [ax, ay, az] = unitVec(r);
      const r1 = gamma(r, 3, 0.5) * 2.3;
      p1.set([ax * r1, ay * r1, az * r1], i * 3);
      // 2p: dirección con peso cos²θ respecto al eje vertical
      let d = unitVec(r);
      while (r() > d[1] * d[1]) d = unitVec(r);
      const r2 = gamma(r, 5, 1) * 0.66;
      p2.set([d[0] * r2, d[1] * r2, d[2] * r2], i * 3);
      sgn[i] = d[1] >= 0 ? 1 : -1;
      birth[i] = i;
      jitter[i] = r();
    }
    this.geo = new THREE.BufferGeometry();
    this.geo.setAttribute('position', new THREE.BufferAttribute(p1, 3));
    this.geo.setAttribute('p2', new THREE.BufferAttribute(p2, 3));
    this.geo.setAttribute('birth', new THREE.BufferAttribute(birth, 1));
    this.geo.setAttribute('sgn', new THREE.BufferAttribute(sgn, 1));
    this.geo.setAttribute('jitter', new THREE.BufferAttribute(jitter, 1));
    this.mat = new THREE.ShaderMaterial({
      vertexShader: vert,
      fragmentShader: frag,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uShown: { value: 0 },
        uMorph: { value: 0 },
        uPR: { value: 1 },
        uAlpha: { value: 1 },
        uCol1s: { value: new THREE.Color('#8fd0ff') },
        uColPos: { value: new THREE.Color('#ffb85c') },
        uColNeg: { value: new THREE.Color('#9fb2ff') },
      },
    });
    this.points = new THREE.Points(this.geo, this.mat);
    this.points.frustumCulled = false;
    this.scene.add(this.points);

    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const g = c.getContext('2d')!;
    const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, 'rgba(255,240,210,1)');
    grad.addColorStop(0.2, 'rgba(255,190,110,0.8)');
    grad.addColorStop(1, 'rgba(255,150,80,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, 128, 128);
    const tex = new THREE.CanvasTexture(c);
    this.nucleus = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
    this.nucleus.scale.setScalar(1.6);
    this.scene.add(this.nucleus);

    this.camera.position.set(0, 0, 26);
    this.off = stage.onResize(() => this.resize());
    this.resize();
  }

  resize() {
    const pr = this.stage.pixelRatio;
    this.renderer.setPixelRatio(pr);
    this.renderer.setSize(W, H, false);
    this.mat.uniforms.uPR.value = pr;
    this.camera.setViewOffset(W, H, -(this.centerX - W / 2), 0, W, H);
  }

  render(t: number) {
    this.mat.uniforms.uShown.value = this.reveal * N;
    this.mat.uniforms.uMorph.value = this.morph;
    this.mat.uniforms.uAlpha.value = this.alpha;
    this.points.rotation.y = t * 0.16;
    this.points.rotation.x = 0.28 + Math.sin(t * 0.21) * 0.08;
    (this.nucleus.material as THREE.SpriteMaterial).opacity = this.alpha * Math.min(1, this.reveal * 8);
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.off();
    this.geo.dispose();
    this.mat.dispose();
    (this.nucleus.material as THREE.SpriteMaterial).map?.dispose();
    this.nucleus.material.dispose();
    this.renderer.dispose();
    this.renderer.forceContextLoss();
    this.canvas.remove();
  }
}
