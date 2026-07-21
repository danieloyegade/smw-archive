import * as THREE from 'three';
import type { ArchiveProject } from '../data/projects';

type InitArchiveGlobeOptions = {
  canvas: HTMLCanvasElement;
  titleEl: HTMLElement;
  metaEl: HTMLElement;
  projects: ArchiveProject[];
};

export function initArchiveGlobe({ canvas, titleEl, metaEl, projects }: InitArchiveGlobeOptions) {
  const basePath = document.body.dataset.base ?? '/';
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x050505, 1);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 0, 6.8);

  const globe = new THREE.Group();
  scene.add(globe);

  const ambient = new THREE.AmbientLight(0xffffff, 1.1);
  const key = new THREE.DirectionalLight(0xffffff, 1.4);
  key.position.set(4, 3, 6);
  const rim = new THREE.DirectionalLight(0xff3b3b, 1.1);
  rim.position.set(-4, -2, 5);
  scene.add(ambient, key, rim);

  const radius = 3.4;
  const panelWidth = 1.12;
  const panelHeight = 0.78;
  const panelGeometry = new THREE.PlaneGeometry(panelWidth, panelHeight, 1, 1);
  const wireGeometry = new THREE.SphereGeometry(radius + 0.04, 28, 20);
  const wireframe = new THREE.LineSegments(
    new THREE.WireframeGeometry(wireGeometry),
    new THREE.LineBasicMaterial({
      color: 0xff2b2b,
      transparent: true,
      opacity: 0.24,
    }),
  );
  globe.add(wireframe);

  function createFallbackTexture(project: ArchiveProject) {
    const width = 768;
    const height = 512;
    const fallback = document.createElement('canvas');
    fallback.width = width;
    fallback.height = height;
    const ctx = fallback.getContext('2d');

    if (!ctx) {
      throw new Error('Could not create fallback texture canvas.');
    }

    const hue = (project.id * 37) % 360;
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
    ctx.font = '800 92px Inter, sans-serif';
    ctx.fillText(String(project.id).padStart(2, '0'), 42, 120);

    ctx.font = '700 36px Inter, sans-serif';
    ctx.fillText(project.title.toUpperCase(), 42, height - 72);
    ctx.font = '500 18px Inter, sans-serif';
    ctx.fillStyle = 'rgba(255, 241, 236, 0.75)';
    ctx.fillText(project.category.toUpperCase(), 42, height - 38);

    ctx.fillStyle = 'rgba(255, 53, 53, 0.14)';
    ctx.fillRect(0, height - 96, width, 4);

    const texture = new THREE.CanvasTexture(fallback);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    return texture;
  }

  function upgradeTexture(project: ArchiveProject, material: THREE.MeshBasicMaterial) {
    if (!project.imageAvailable) return;

    const loader = new THREE.TextureLoader();
    loader.crossOrigin = 'anonymous';
    loader.load(
      project.image,
      (loadedTexture) => {
        loadedTexture.colorSpace = THREE.SRGBColorSpace;
        loadedTexture.needsUpdate = true;
        material.map?.dispose();
        material.map = loadedTexture;
        material.needsUpdate = true;
      },
      undefined,
      () => {
        const fallback = createFallbackTexture(project);
        material.map?.dispose();
        material.map = fallback;
        material.needsUpdate = true;
      },
    );
  }

  const meshMap = new Map<string, THREE.Mesh>();
  const panels: THREE.Mesh[] = [];

  const rows = 5;
  const cols = 4;
  projects.forEach((project, index) => {
    const row = Math.floor(index / cols);
    const col = index % cols;
    const latitude = THREE.MathUtils.lerp(-0.95, 0.95, row / (rows - 1));
    const longitude = (col / cols) * Math.PI * 2 + (row % 2 === 0 ? 0 : Math.PI / cols);
    const ringRadius = Math.cos(latitude);
    const position = new THREE.Vector3(
      Math.cos(longitude) * ringRadius,
      Math.sin(latitude),
      Math.sin(longitude) * ringRadius,
    ).multiplyScalar(radius);

    const texture = createFallbackTexture(project);
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;

    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: false,
      side: THREE.DoubleSide,
    });

    const mesh = new THREE.Mesh(panelGeometry, material);
    mesh.position.copy(position).multiplyScalar(1.08);
    mesh.lookAt(camera.position);
    mesh.userData = {
      slug: project.slug,
      project,
      baseScale: 1,
    };

    const edge = new THREE.LineSegments(
      new THREE.EdgesGeometry(panelGeometry),
      new THREE.LineBasicMaterial({
        color: 0xff3b3b,
        transparent: true,
        opacity: 0.85,
      }),
    );
    mesh.add(edge);

    meshMap.set(project.slug, mesh);
    panels.push(mesh);
    globe.add(mesh);

    upgradeTexture(project, material);
  });

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2(99, 99);
  const container = canvas.parentElement ?? canvas;
  const state = {
    dragging: false,
    hoverSlug: '',
    activeSlug: '',
    pointerDown: { x: 0, y: 0, time: 0 },
    lastPointer: { x: 0, y: 0 },
    velocityX: 0,
    velocityY: 0,
    rotationX: -0.15,
    rotationY: 0.45,
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    hoverCoolDown: 0,
  };

  const activeCaption = (project: ArchiveProject | null) => {
    titleEl.textContent = project ? project.title : 'DRAG TO EXPLORE THE ARCHIVE';
    metaEl.textContent = project ? `${project.category} • ${project.year}` : '';
  };

  activeCaption(null);

  function setCursor(value: string) {
    container.style.cursor = value;
  }

  function resize() {
    const rect = container.getBoundingClientRect();
    const width = Math.max(1, rect.width);
    const height = Math.max(1, rect.height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  }

  function updateCaptionBySlug(slug: string) {
    if (!slug) {
      if (state.activeSlug !== '') {
        state.activeSlug = '';
        activeCaption(null);
      }
      return;
    }

    if (state.activeSlug === slug) return;
    const project = projects.find((item) => item.slug === slug);
    if (project) {
      state.activeSlug = slug;
      activeCaption(project);
    }
  }

  function applyHoverEffects(slug: string) {
    panels.forEach((panel) => {
      const isHover = panel.userData.slug === slug;
      const isDimmed = slug && !isHover;
      panel.scale.lerp(new THREE.Vector3(isHover ? 1.1 : 1, isHover ? 1.1 : 1, 1), 0.15);
      const material = panel.material;
      if (material instanceof THREE.MeshBasicMaterial) {
        material.opacity = 1;
        material.transparent = false;
        material.color.setScalar(isDimmed ? 0.96 : 1);
      }
      const edges = panel.children[0];
      if (edges instanceof THREE.LineSegments && edges.material instanceof THREE.LineBasicMaterial) {
        edges.material.opacity = isHover ? 1 : 0.35;
      }
    });
  }

  function hitTest(clientX: number, clientY: number) {
    const rect = canvas.getBoundingClientRect();
    pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -(((clientY - rect.top) / rect.height) * 2 - 1);
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(panels, false);
    return hits[0]?.object ?? null;
  }

  function onPointerMove(event: PointerEvent) {
    if (state.dragging) {
      const dx = event.clientX - state.lastPointer.x;
      const dy = event.clientY - state.lastPointer.y;
      state.rotationY += dx * 0.006;
      state.rotationX += dy * 0.006;
      state.rotationX = THREE.MathUtils.clamp(state.rotationX, -0.95, 0.95);
      state.velocityY = dx * 0.0004;
      state.velocityX = dy * 0.0004;
      state.lastPointer.x = event.clientX;
      state.lastPointer.y = event.clientY;
      canvas.style.touchAction = 'none';
      document.body.style.userSelect = 'none';
      document.body.style.overflow = 'hidden';
      setCursor('grabbing');
      return;
    }

    const hit = hitTest(event.clientX, event.clientY);
    const slug = hit?.userData?.slug ?? '';
    state.hoverSlug = slug;
    state.hoverCoolDown = slug ? 0.3 : 0;
    updateCaptionBySlug(slug);
    applyHoverEffects(slug);
    setCursor(slug ? 'pointer' : 'grab');
  }

  function stopDrag() {
    state.dragging = false;
    document.body.style.userSelect = '';
    document.body.style.overflow = '';
    canvas.style.touchAction = 'none';
    setCursor(state.hoverSlug ? 'pointer' : 'grab');
  }

  function onPointerDown(event: PointerEvent) {
    const hit = hitTest(event.clientX, event.clientY);
    state.dragging = true;
    state.pointerDown = { x: event.clientX, y: event.clientY, time: performance.now() };
    state.lastPointer = { x: event.clientX, y: event.clientY };
    state.velocityX = 0;
    state.velocityY = 0;
    state.activeSlug = hit?.userData?.slug ?? '';
    setCursor('grabbing');
    canvas.setPointerCapture(event.pointerId);
    event.preventDefault();
  }

  function onPointerUp(event: PointerEvent) {
    const wasDragging = state.dragging;
    const movedX = Math.abs(event.clientX - state.pointerDown.x);
    const movedY = Math.abs(event.clientY - state.pointerDown.y);
    const moved = Math.max(movedX, movedY);
    stopDrag();

    if (!wasDragging) return;
    if (moved < 8) {
      const hit = hitTest(event.clientX, event.clientY);
      const slug = hit?.userData?.slug ?? '';
      if (slug) {
        window.location.href = `${basePath}archive/${slug}/`;
      }
    }
  }

  function onPointerLeave() {
    state.hoverSlug = '';
    state.activeSlug = '';
    applyHoverEffects('');
    if (!state.dragging) {
      activeCaption(null);
      setCursor('grab');
    }
  }

  window.addEventListener('resize', resize);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointercancel', stopDrag);
  canvas.addEventListener('pointerleave', onPointerLeave);

  resize();
  setCursor('grab');

  const clock = new THREE.Clock();
  (window as Window & { __archiveGlobe?: unknown }).__archiveGlobe = {
    panelCount: panels.length,
    samplePanel: panels[0] ? panels[0].position.clone().toArray() : null,
    rotationX: state.rotationX,
    rotationY: state.rotationY,
  };

  function render() {
    const dt = Math.min(clock.getDelta(), 0.05);
    const hovering = Boolean(state.hoverSlug);
    const canIdle = !state.dragging && !hovering && state.hoverCoolDown <= 0;

    if (state.hoverCoolDown > 0) {
      state.hoverCoolDown = Math.max(0, state.hoverCoolDown - dt);
    }

    if (state.dragging) {
      state.rotationY += state.velocityY;
      state.rotationX += state.velocityX;
    } else if (!state.reducedMotion && canIdle) {
      state.rotationY += 0.08 * dt;
    }

    if (!state.reducedMotion && !state.dragging) {
      state.velocityY *= 0.94;
      state.velocityX *= 0.94;
      state.rotationY += state.velocityY;
      state.rotationX += state.velocityX;
    } else {
      state.velocityY = 0;
      state.velocityX = 0;
    }

    state.rotationX = THREE.MathUtils.clamp(state.rotationX, -1.05, 1.05);
    globe.rotation.x = state.rotationX;
    globe.rotation.y = state.rotationY;

    panels.forEach((panel) => {
      const material = panel.material;
      const isHover = panel.userData.slug === state.hoverSlug;
      if (material instanceof THREE.MeshBasicMaterial) {
        const target = isHover ? 1 : state.hoverSlug ? 0.9 : 0.98;
        material.color.lerp(new THREE.Color(target, target, target), 0.08);
        material.opacity = 1;
      }
    });

    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }

  render();
}

const canvas = document.querySelector('#globe-canvas');
const titleEl = document.querySelector('[data-caption-title]');
const metaEl = document.querySelector('[data-caption-meta]');
const dataEl = document.querySelector('#archive-project-data');

if (
  canvas instanceof HTMLCanvasElement &&
  titleEl instanceof HTMLElement &&
  metaEl instanceof HTMLElement &&
  dataEl instanceof HTMLScriptElement
) {
  initArchiveGlobe({
    canvas,
    titleEl,
    metaEl,
    projects: JSON.parse(dataEl.textContent || '[]'),
  });
}
