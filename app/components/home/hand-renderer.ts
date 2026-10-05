import {
  Mesh,
  NoColorSpace,
  NoToneMapping,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  VideoTexture,
  WebGLRenderer,
} from 'three';

// Compositor for the hands clip from github.com/vikod3/handstouch. The clip
// packs decontaminated RGB in its top half and a linear alpha matte in its
// bottom half; the shader combines both onto a transparent canvas. This module
// only draws: playback and seeking belong to the caller (HandsJourney drives
// the clip from the scroll position), so the canvas is repainted when the
// video reports a new frame (loadeddata / seeked) or the canvas resizes.

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform sampler2D uHands;
  varying vec2 vUv;

  void main() {
    // Both halves share one decoder, so the silhouette never drifts from the hands.
    vec2 colorUv = vec2(vUv.x, 0.5 + vUv.y * 0.5);
    vec2 matteUv = vec2(vUv.x, vUv.y * 0.5);
    vec3 color = texture2D(uHands, colorUv).rgb;
    float alpha = texture2D(uHands, matteUv).r;
    alpha = smoothstep(0.02, 0.98, alpha);
    gl_FragColor = vec4(color, alpha);
  }
`;

export type HandRenderer = {
  draw: () => void;
  dispose: () => void;
};

export function createHandRenderer(
  canvas: HTMLCanvasElement,
  video: HTMLVideoElement,
  onReady: (ready: boolean) => void,
): HandRenderer {
  const renderer = new WebGLRenderer({
    canvas,
    alpha: true,
    antialias: false,
    powerPreference: 'low-power',
    premultipliedAlpha: true,
  });
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = NoToneMapping;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Keep both halves as data to preserve the source colors and the white robot highlights.
  const texture = new VideoTexture(video);
  texture.colorSpace = NoColorSpace;
  const geometry = new PlaneGeometry(2, 2);
  const material = new ShaderMaterial({
    uniforms: { uHands: { value: texture } },
    vertexShader,
    fragmentShader,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    toneMapped: false,
  });
  const scene = new Scene();
  const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
  scene.add(new Mesh(geometry, material));

  let disposed = false;
  let contextLost = false;
  let hasFrame = false;

  const draw = () => {
    if (disposed || contextLost || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return;
    texture.needsUpdate = true;
    renderer.render(scene, camera);
    if (!hasFrame) {
      hasFrame = true;
      onReady(true);
    }
  };
  const resize = () => {
    const { width, height } = canvas.getBoundingClientRect();
    renderer.setSize(Math.max(1, width), Math.max(1, height), false);
    draw();
  };
  const onContextLost = (event: Event) => {
    event.preventDefault();
    contextLost = true;
    hasFrame = false;
    onReady(false);
  };
  const onContextRestored = () => {
    contextLost = false;
    resize();
  };
  const onError = () => onReady(false);

  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  canvas.addEventListener('webglcontextlost', onContextLost);
  canvas.addEventListener('webglcontextrestored', onContextRestored);
  video.addEventListener('loadeddata', draw);
  video.addEventListener('seeked', draw);
  video.addEventListener('error', onError);
  resize();

  return {
    draw,
    dispose: () => {
      disposed = true;
      observer.disconnect();
      canvas.removeEventListener('webglcontextlost', onContextLost);
      canvas.removeEventListener('webglcontextrestored', onContextRestored);
      video.removeEventListener('loadeddata', draw);
      video.removeEventListener('seeked', draw);
      video.removeEventListener('error', onError);
      texture.dispose();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    },
  };
}
