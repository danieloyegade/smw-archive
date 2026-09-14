/**
 * The three.js half of the archive globe. Loaded on demand by
 * `archive-globe.ts` so that browsers without WebGL never download it.
 */
import {
  AmbientLight,
  CanvasTexture,
  ClampToEdgeWrapping,
  Clock,
  Color,
  DirectionalLight,
  DoubleSide,
  EdgesGeometry,
  Group,
  LineBasicMaterial,
  LineSegments,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Raycaster,
  Scene,
  SRGBColorSpace,
  SphereGeometry,
  TextureLoader,
  Vector2,
  Vector3,
  WebGLRenderer,
  WireframeGeometry,
} from 'three';
import type { ClientProject } from '../lib/projects';
import { projectHref } from './paths';

export interface GlobeElements {
  shell: HTMLElement;
  canvas: HTMLCanvasElement;
  stage: HTMLElement;
  titleEl: HTMLElement;
  metaEl: HTMLElement;
  projects: ClientProject[];
  zoomInButton?: HTMLButtonElement;
  zoomOutButton?: HTMLButtonElement;
  resetButton?: HTMLButtonElement;
}

const IDLE_SPIN_RATE = 0.08;
const MIN_ZOOM = 0.82;
const MAX_ZOOM = 1.55;

export function initArchiveGlobe({
  shell,
  canvas,
  stage,
  titleEl,
  metaEl,
  projects,
  zoomInButton,
  zoomOutButton,
  resetButton,
}: GlobeElements) {
  const renderer = new WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x050505, 1);

  const scene = new Scene();
  const camera = new PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 0, 9.4);

  const globe = new Group();
  scene.add(globe);

  const ambient = new AmbientLight(0xffffff, 1.1);
  const key = new DirectionalLight(0xffffff, 1.4);
  key.position.set(4, 3, 6);
  const rim = new DirectionalLight(0xff3b3b, 1.1);
  rim.position.set(-4, -2, 5);
  scene.add(ambient, key, rim);

  const radius = 3.4;
  const panelGeometry = new PlaneGeometry(1.12, 0.78, 1, 1);
  const panelEdgeGeometry = new EdgesGeometry(panelGeometry);
  const wireframe = new LineSegments(
    new WireframeGeometry(new SphereGeometry(radius + 0.04, 28, 20)),
    new LineBasicMaterial({ color: 0xff2b2b, transparent: true, opacity: 0.24 }),
  );
  globe.add(wireframe);

  /** Procedural panel art for entries that have no photograph yet. */
  function createFallbackTexture(project: ClientProject) {
    const width = 768;
    const height = 512;
    const fallback = document.createElement('canvas');
    fallback.width = width;
    fallback.height = height;
    const ctx = fallback.getContext('2d');

    if (!ctx) throw new Error('Could not create fallback texture canvas.');

    const hue = (project.order * 37) % 360;
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, `hsl(${hue} 45% 18%)`);
    gradient.addColorStop(0.34, '#121212');
    gradient.addColorStop(1, '#0b0b0b');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    ctx.fillRect(40, 40, width - 80, height - 80);

    ctx.strokeStyle = 'rgba(255, 53, 53, 0.82)';
    ctx.lineWidth = 8;
    ctx.strokeRect(20, 20, width - 40, height - 40);

    ctx.strokeStyle = 'rgba(255,255,255,0.14)';
    ctx.lineWidth = 2;
    ctx.strokeRect(56, 56, width - 112, height - 112);

    ctx.fillStyle = 'rgba(255, 241, 236, 0.96)';
    ctx.font = '800 92px "Inter Variable", Inter, sans-serif';
    ctx.fillText(String(project.order).padStart(2, '0'), 42, 120);

    ctx.font = '700 36px "Inter Variable", Inter, sans-serif';
    ctx.fillText(project.title.toUpperCase(), 42, height - 72);
    ctx.font = '500 18px "Inter Variable", Inter, sans-serif';
    ctx.fillStyle = 'rgba(255, 241, 236, 0.75)';
    ctx.fillText(project.category.toUpperCase(), 42, height - 38);

    ctx.fillStyle = 'rgba(255, 53, 53, 0.14)';
    ctx.fillRect(0, height - 96, width, 4);

    const texture = new CanvasTexture(fallback);
    texture.colorSpace = SRGBColorSpace;
    texture.needsUpdate = true;
    return texture;
  }

  const textureLoader = new TextureLoader();
  textureLoader.crossOrigin = 'anonymous';

  function upgradeTexture(project: ClientProject, material: MeshBasicMaterial) {
    if (!project.image) return;
    textureLoader.load(
      project.image,
      (loaded) => {
        loaded.colorSpace = SRGBColorSpace;
        loaded.needsUpdate = true;
        material.map?.dispose();
        material.map = loaded;
        material.needsUpdate = true;
        requestRender();
      },
      undefined,
      () => {
        /* keep the procedural fallback already on the panel */
      },
    );
  }

  interface PanelData {
    slug: string;
    project: ClientProject;
  }

  const panels: Mesh<PlaneGeometry, MeshBasicMaterial>[] = [];
  const cols = 4;
  const rows = Math.ceil(projects.length / cols);

  projects.forEach((project, index) => {
    const row = Math.floor(index / cols);
    const col = index % cols;
    const latitude = MathUtils.lerp(-0.95, 0.95, rows > 1 ? row / (rows - 1) : 0.5);
    const longitude = (col / cols) * Math.PI * 2 + (row % 2 === 0 ? 0 : Math.PI / cols);
    const ringRadius = Math.cos(latitude);

    const texture = createFallbackTexture(project);
    texture.wrapS = ClampToEdgeWrapping;
    texture.wrapT = ClampToEdgeWrapping;

    const material = new MeshBasicMaterial({ map: texture, transparent: false, side: DoubleSide });
    const mesh = new Mesh(panelGeometry, material);
    mesh.position
      .set(Math.cos(longitude) * ringRadius, Math.sin(latitude), Math.sin(longitude) * ringRadius)
      .multiplyScalar(radius * 1.08);
    mesh.lookAt(camera.position);
    mesh.userData = { slug: project.slug, project } satisfies PanelData;

    mesh.add(
      new LineSegments(
        panelEdgeGeometry,
        new LineBasicMaterial({ color: 0xff3b3b, transparent: true, opacity: 0.85 }),
      ),
    );

    panels.push(mesh);
    globe.add(mesh);
  });

  const raycaster = new Raycaster();
  const pointer = new Vector2(99, 99);
  const activePointers = new Map<number, { x: number; y: number }>();

  // Reused every frame so hover and tint animation allocate nothing.
  const scratchScale = new Vector3();
  const scratchColor = new Color();

  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  const state = {
    dragging: false,
    hoverSlug: '',
    captionSlug: '',
    pointerDown: { x: 0, y: 0 },
    lastPointer: { x: 0, y: 0 },
    velocityX: 0,
    velocityY: 0,
    rotationX: -0.15,
    rotationY: 0.45,
    reducedMotion: reducedMotionQuery.matches,
    hoverCoolDown: 0,
    zoom: 1,
    fitDistance: 9.4,
    pinchDistance: 0,
  };

  /*
    Render-loop state. The loop only runs while the globe is on screen and the
    tab is visible, and only while something is actually moving; a still globe
    costs nothing. These must be initialised before the first resize(), which
    calls requestRender().
  */
  const clock = new Clock();
  let frameHandle = 0;
  let settleFrames = 0;

  function setCaption(project: ClientProject | null) {
    titleEl.textContent = project ? project.title : 'DRAG TO EXPLORE · SELECT TO OPEN';
    metaEl.textContent = project
      ? `${project.category} • ${project.year}${project.places.length ? ` • ${project.places[0]}` : ''}`
      : '';
  }

  setCaption(null);

  function resize() {
    const rect = stage.getBoundingClientRect();
    const width = Math.max(1, rect.width);
    const height = Math.max(1, rect.height);
    camera.aspect = width / height;
    const verticalFov = MathUtils.degToRad(camera.fov);
    const horizontalFov = 2 * Math.atan(Math.tan(verticalFov / 2) * camera.aspect);
    const limitingFov = Math.min(verticalFov, horizontalFov);
    state.fitDistance = (radius * 1.22) / (Math.sin(limitingFov / 2) * 0.78);
    camera.position.z = state.fitDistance / state.zoom;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    requestRender();
  }

  function setZoom(nextZoom: number) {
    state.zoom = MathUtils.clamp(nextZoom, MIN_ZOOM, MAX_ZOOM);
    camera.position.z = state.fitDistance / state.zoom;
    requestRender();
  }

  function resetView() {
    state.rotationX = -0.15;
    state.rotationY = 0.45;
    state.velocityX = 0;
    state.velocityY = 0;
    setZoom(1);
  }

  function updateCaptionBySlug(slug: string) {
    if (state.captionSlug === slug) return;
    state.captionSlug = slug;
    setCaption(projects.find((project) => project.slug === slug) ?? null);
  }

  function applyHoverEffects(slug: string) {
    panels.forEach((panel) => {
      const isHover = (panel.userData as PanelData).slug === slug;
      const target = isHover ? 1.1 : 1;
      panel.scale.lerp(scratchScale.set(target, target, 1), 0.15);
      const edges = panel.children[0];
      if (edges instanceof LineSegments && edges.material instanceof LineBasicMaterial) {
        edges.material.opacity = isHover ? 1 : 0.35;
      }
    });
    requestRender();
  }

  function hitTest(clientX: number, clientY: number) {
    const rect = canvas.getBoundingClientRect();
    pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -(((clientY - rect.top) / rect.height) * 2 - 1);
    raycaster.setFromCamera(pointer, camera);
    return raycaster.intersectObjects(panels, false)[0]?.object ?? null;
  }

  function slugAt(clientX: number, clientY: number) {
    const hit = hitTest(clientX, clientY);
    return hit ? (hit.userData as PanelData).slug : '';
  }

  function onPointerMove(event: PointerEvent) {
    if (activePointers.has(event.pointerId)) {
      activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    }

    if (activePointers.size === 2) {
      const [first, second] = Array.from(activePointers.values());
      const distance = Math.hypot(second.x - first.x, second.y - first.y);
      if (state.pinchDistance) setZoom(state.zoom * (distance / state.pinchDistance));
      state.pinchDistance = distance;
      state.dragging = false;
      return;
    }

    if (state.dragging) {
      const dx = event.clientX - state.lastPointer.x;
      const dy = event.clientY - state.lastPointer.y;
      state.rotationY += dx * 0.006;
      state.rotationX = MathUtils.clamp(state.rotationX + dy * 0.006, -0.95, 0.95);
      state.velocityY = dx * 0.0004;
      state.velocityX = dy * 0.0004;
      state.lastPointer = { x: event.clientX, y: event.clientY };
      canvas.style.cursor = 'grabbing';
      requestRender();
      return;
    }

    const slug = slugAt(event.clientX, event.clientY);
    state.hoverSlug = slug;
    state.hoverCoolDown = slug ? 0.3 : 0;
    updateCaptionBySlug(slug);
    applyHoverEffects(slug);
    canvas.style.cursor = slug ? 'pointer' : 'grab';
  }

  function stopDrag() {
    state.dragging = false;
    document.body.style.userSelect = '';
    canvas.style.cursor = state.hoverSlug ? 'pointer' : 'grab';
  }

  function onPointerDown(event: PointerEvent) {
    activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (activePointers.size === 2) {
      const [first, second] = Array.from(activePointers.values());
      state.pinchDistance = Math.hypot(second.x - first.x, second.y - first.y);
      state.dragging = false;
      canvas.setPointerCapture(event.pointerId);
      event.preventDefault();
      return;
    }

    state.dragging = true;
    state.pointerDown = { x: event.clientX, y: event.clientY };
    state.lastPointer = { x: event.clientX, y: event.clientY };
    state.velocityX = 0;
    state.velocityY = 0;
    document.body.style.userSelect = 'none';
    canvas.style.cursor = 'grabbing';
    canvas.setPointerCapture(event.pointerId);
    event.preventDefault();
    requestRender();
  }

  function onPointerUp(event: PointerEvent) {
    const wasDragging = state.dragging;
    const moved = Math.max(
      Math.abs(event.clientX - state.pointerDown.x),
      Math.abs(event.clientY - state.pointerDown.y),
    );
    const wasPinching = state.pinchDistance > 0;

    activePointers.delete(event.pointerId);
    if (activePointers.size < 2) state.pinchDistance = 0;
    stopDrag();

    if (!wasDragging || wasPinching || moved >= 8) return;
    const slug = slugAt(event.clientX, event.clientY);
    if (slug) window.location.href = projectHref(slug);
  }

  function onPointerCancel(event: PointerEvent) {
    activePointers.delete(event.pointerId);
    if (activePointers.size < 2) state.pinchDistance = 0;
    stopDrag();
  }

  function onPointerLeave() {
    state.hoverSlug = '';
    applyHoverEffects('');
    if (!state.dragging) {
      updateCaptionBySlug('');
      canvas.style.cursor = 'grab';
    }
  }

  function onWheel(event: WheelEvent) {
    event.preventDefault();
    setZoom(state.zoom * Math.exp(-event.deltaY * 0.001));
  }

  function onKeyDown(event: KeyboardEvent) {
    if (shell.dataset.view !== 'globe') return;
    const target = event.target;
    if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) return;

    const step = event.shiftKey ? 0.35 : 0.16;
    if (event.key === 'ArrowLeft') state.rotationY -= step;
    else if (event.key === 'ArrowRight') state.rotationY += step;
    else if (event.key === 'ArrowUp') state.rotationX = Math.max(-1.05, state.rotationX - step);
    else if (event.key === 'ArrowDown') state.rotationX = Math.min(1.05, state.rotationX + step);
    else if (event.key === '+' || event.key === '=') setZoom(state.zoom * 1.12);
    else if (event.key === '-' || event.key === '_') setZoom(state.zoom / 1.12);
    else if (event.key === '0') resetView();
    else return;

    event.preventDefault();
    requestRender();
  }

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(stage);

  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointercancel', onPointerCancel);
  canvas.addEventListener('pointerleave', onPointerLeave);
  canvas.addEventListener('wheel', onWheel, { passive: false });
  window.addEventListener('keydown', onKeyDown);
  zoomInButton?.addEventListener('click', () => setZoom(state.zoom * 1.15));
  zoomOutButton?.addEventListener('click', () => setZoom(state.zoom / 1.15));
  resetButton?.addEventListener('click', resetView);
  reducedMotionQuery.addEventListener('change', (event) => {
    state.reducedMotion = event.matches;
    requestRender();
  });

  resize();
  canvas.style.cursor = 'grab';

  function isLive() {
    return shell.dataset.view === 'globe' && !document.hidden;
  }

  function requestRender() {
    settleFrames = 12;
    if (!frameHandle && isLive()) {
      clock.getDelta();
      frameHandle = requestAnimationFrame(frame);
    }
  }

  function frame() {
    frameHandle = 0;
    if (!isLive()) return;

    const dt = Math.min(clock.getDelta(), 0.05);
    const hovering = Boolean(state.hoverSlug);
    const spinning = !state.reducedMotion && !state.dragging && !hovering && state.hoverCoolDown <= 0;

    if (state.hoverCoolDown > 0) state.hoverCoolDown = Math.max(0, state.hoverCoolDown - dt);
    if (spinning) state.rotationY += IDLE_SPIN_RATE * dt;

    if (!state.reducedMotion && !state.dragging) {
      state.velocityY *= 0.94;
      state.velocityX *= 0.94;
      state.rotationY += state.velocityY;
      state.rotationX += state.velocityX;
    } else {
      state.velocityY = 0;
      state.velocityX = 0;
    }

    state.rotationX = MathUtils.clamp(state.rotationX, -1.05, 1.05);
    globe.rotation.x = state.rotationX;
    globe.rotation.y = state.rotationY;

    panels.forEach((panel) => {
      const isHover = (panel.userData as PanelData).slug === state.hoverSlug;
      const tint = isHover ? 1 : state.hoverSlug ? 0.9 : 0.98;
      panel.material.color.lerp(scratchColor.setRGB(tint, tint, tint), 0.08);
    });

    renderer.render(scene, camera);

    const moving = spinning || state.dragging || Math.abs(state.velocityY) > 1e-5;
    if (moving) settleFrames = 2;
    else settleFrames -= 1;

    if (settleFrames > 0) frameHandle = requestAnimationFrame(frame);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (frameHandle) cancelAnimationFrame(frameHandle);
      frameHandle = 0;
    } else {
      requestRender();
    }
  });

  requestRender();

  // Photographs arrive after the globe is interactive, so first paint isn't blocked.
  requestAnimationFrame(() => {
    panels.forEach((panel) => upgradeTexture((panel.userData as PanelData).project, panel.material));
  });

  return { requestRender };
}
