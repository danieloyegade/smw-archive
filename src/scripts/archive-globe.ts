import * as THREE from 'three';
import type { ArchiveProject } from '../data/projects';

const canvas = document.querySelector<HTMLCanvasElement>('#globe-canvas');
const dataEl = document.querySelector<HTMLScriptElement>('#archive-project-data');
const titleEl = document.querySelector<HTMLElement>('[data-caption-title]');
const kickerEl = document.querySelector<HTMLElement>('[data-caption-kicker]');
const metaEl = document.querySelector<HTMLElement>('[data-caption-meta]');
const searchInput = document.querySelector<HTMLInputElement>('[data-search-input]');
const immersiveSearch = document.querySelector<HTMLInputElement>('[data-immersive-search]');
const resultCount = document.querySelector<HTMLElement>('[data-result-count]');
const emptyResult = document.querySelector<HTMLElement>('[data-empty-result]');
const gridEmpty = document.querySelector<HTMLElement>('[data-grid-empty]');
const yearButtons = [...document.querySelectorAll<HTMLButtonElement>('[data-year-button]')];
const immersiveYearButtons = [...document.querySelectorAll<HTMLButtonElement>('[data-immersive-year]')];
const resultLinks = [...document.querySelectorAll<HTMLAnchorElement>('[data-result-link]')];
const projectCards = [...document.querySelectorAll<HTMLAnchorElement>('[data-project-card]')];
const immersiveStories = [...document.querySelectorAll<HTMLButtonElement>('[data-immersive-story]')];
const immersiveEmpty = document.querySelector<HTMLElement>('[data-immersive-empty]');
const globeSide = document.querySelector<HTMLElement>('.globe-side');
const previewCard = document.querySelector<HTMLElement>('[data-story-preview]');
const previewImage = document.querySelector<HTMLImageElement>('[data-preview-image]');
const previewKicker = document.querySelector<HTMLElement>('[data-preview-kicker]');
const previewTitle = document.querySelector<HTMLElement>('[data-preview-title]');
const previewDescription = document.querySelector<HTMLElement>('[data-preview-description]');
const previewMeta = document.querySelector<HTMLElement>('[data-preview-meta]');
const previewLink = document.querySelector<HTMLAnchorElement>('[data-preview-link]');
const enterImmersiveButton = document.querySelector<HTMLButtonElement>('[data-enter-immersive]');
const closeImmersiveButton = document.querySelector<HTMLButtonElement>('[data-close-immersive]');
const toggleRailButton = document.querySelector<HTMLButtonElement>('[data-toggle-rail]');
const storyTransition = document.querySelector<HTMLElement>('[data-story-transition]');
const transitionImage = document.querySelector<HTMLImageElement>('[data-transition-image]');
const transitionTitle = document.querySelector<HTMLElement>('[data-transition-title]');

if (canvas && dataEl && titleEl && kickerEl && metaEl) {
  const projects = JSON.parse(dataEl.textContent || '[]') as ArchiveProject[];
  const basePath = (document.body.dataset.base ?? '/').replace(/\/?$/, '/');
  let selectedYear = 'all';
  let query = '';
  let updateGlobeFilter: ((slugs: Set<string>) => void) | undefined;
  let navigating = false;

  function navigateToStory(project: ArchiveProject) {
    if (navigating) return;
    navigating = true;
    const destination = basePath + 'archive/' + project.slug + '/';
    if (!storyTransition || !transitionImage || !transitionTitle || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      window.location.assign(destination);
      return;
    }
    transitionImage.src = project.image;
    transitionTitle.textContent = project.title;
    storyTransition.hidden = false;
    requestAnimationFrame(() => storyTransition.classList.add('is-active'));
    window.setTimeout(() => window.location.assign(destination), 640);
  }

  function interceptStoryLink(link: HTMLAnchorElement, slug: string) {
    link.addEventListener('click', (event) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const project = projects.find((item) => item.slug === slug);
      if (!project) return;
      event.preventDefault();
      navigateToStory(project);
    });
  }
  for (const link of resultLinks) interceptStoryLink(link, link.dataset.resultLink ?? '');
  for (const card of projectCards) interceptStoryLink(card, card.dataset.slug ?? '');
  previewLink?.addEventListener('click', (event) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const project = projects.find((item) => item.slug === previewLink.dataset.slug);
    if (!project) return;
    event.preventDefault();
    navigateToStory(project);
  });

  const matches = (project: ArchiveProject) => {
    if (selectedYear !== 'all' && project.year !== selectedYear) return false;
    if (!query) return true;
    const haystack = [
      project.title, project.category, project.year, project.date, project.venue,
      project.description, ...project.places, ...(project.keywords ?? []),
    ].join(' ').toLocaleLowerCase();
    return query.split(/\s+/).every((term) => haystack.includes(term));
  };

  function updateFilters() {
    const visible = projects.filter(matches);
    const slugs = new Set(visible.map((project) => project.slug));
    for (const link of resultLinks) link.hidden = !slugs.has(link.dataset.resultLink ?? '');
    for (const card of projectCards) card.hidden = !slugs.has(card.dataset.slug ?? '');
    for (const story of immersiveStories) story.hidden = !slugs.has(story.dataset.immersiveStory ?? '');
    if (resultCount) resultCount.textContent = visible.length + (visible.length === 1 ? ' story' : ' stories');
    if (emptyResult) emptyResult.hidden = visible.length > 0;
    if (gridEmpty) gridEmpty.hidden = visible.length > 0;
    if (immersiveEmpty) immersiveEmpty.hidden = visible.length > 0;
    updateGlobeFilter?.(slugs);
  }

  function setQuery(value: string) {
    query = value.trim().toLocaleLowerCase();
    if (searchInput && searchInput.value !== value) searchInput.value = value;
    if (immersiveSearch && immersiveSearch.value !== value) immersiveSearch.value = value;
    updateFilters();
  }

  function setYear(year: string) {
    selectedYear = year;
    for (const candidate of yearButtons) {
      const active = candidate.dataset.yearButton === year;
      candidate.classList.toggle('is-active', active);
      candidate.setAttribute('aria-pressed', String(active));
    }
    for (const candidate of immersiveYearButtons) {
      const active = candidate.dataset.immersiveYear === year;
      candidate.classList.toggle('is-active', active);
      candidate.setAttribute('aria-pressed', String(active));
    }
    updateFilters();
  }

  searchInput?.addEventListener('input', () => setQuery(searchInput.value));
  immersiveSearch?.addEventListener('input', () => setQuery(immersiveSearch.value));
  searchInput?.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      setQuery('');
      searchInput.blur();
    }
  });
  window.addEventListener('keydown', (event) => {
    if (event.key === '/' && !(event.target instanceof HTMLInputElement)) {
      event.preventDefault();
      (globeSide?.classList.contains('is-immersive') ? immersiveSearch : searchInput)?.focus();
    }
  });
  for (const button of yearButtons) {
    button.addEventListener('click', () => setYear(button.dataset.yearButton ?? 'all'));
  }
  for (const button of immersiveYearButtons) {
    button.addEventListener('click', () => setYear(button.dataset.immersiveYear ?? 'all'));
  }

  try {
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.7));
    renderer.setClearColor(0x050505, 0);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(39, 1, 0.1, 100);
    const globe = new THREE.Group();
    scene.add(globe);

    const radius = 2.9;
    const wireframe = new THREE.LineSegments(
      new THREE.WireframeGeometry(new THREE.SphereGeometry(radius, 32, 20)),
      new THREE.LineBasicMaterial({ color: 0xbe3833, transparent: true, opacity: 0.3 }),
    );
    globe.add(wireframe);
    const innerGlow = new THREE.Mesh(
      new THREE.SphereGeometry(radius * 0.98, 32, 24),
      new THREE.MeshBasicMaterial({ color: 0x230b0a, transparent: true, opacity: 0.29, side: THREE.BackSide }),
    );
    globe.add(innerGlow);

    const geometry = new THREE.PlaneGeometry(1.46, 1.02);
    const panels: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>[] = [];
    const meshBySlug = new Map<string, THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>>();
    const loader = new THREE.TextureLoader();
    const rows = [-0.63, 0.63];
    projects.forEach((project, index) => {
      const row = Math.floor(index / 4);
      const col = index % 4;
      const latitude = rows[row] ?? 0;
      const longitude = (col / 4) * Math.PI * 2 + (row ? Math.PI / 4 : 0) + Math.PI / 4;
      const horizontal = Math.sqrt(1 - (latitude / radius) ** 2);
      const position = new THREE.Vector3(
        Math.sin(longitude) * horizontal * radius,
        latitude,
        Math.cos(longitude) * horizontal * radius,
      ).multiplyScalar(1.09);
      const material = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.copy(position);
      mesh.lookAt(position.clone().multiplyScalar(2));
      mesh.userData.slug = project.slug;
      mesh.userData.project = project;
      const border = new THREE.LineSegments(
        new THREE.EdgesGeometry(geometry),
        new THREE.LineBasicMaterial({ color: 0xef4b43, transparent: true, opacity: 0.9 }),
      );
      mesh.add(border);
      globe.add(mesh);
      panels.push(mesh);
      meshBySlug.set(project.slug, mesh);
      loader.load(project.image, (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 4);
        material.map = texture;
        material.needsUpdate = true;
      });
    });

    const state = {
      rotationX: -0.12, rotationY: 0.1, velocityX: 0, velocityY: 0,
      zoom: 1, fitDistance: 10, dragging: false, hoverSlug: '',
      selectedSlug: '', focusRotationY: null as number | null,
      pointerX: 0, pointerY: 0, downX: 0, downY: 0,
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    };
    const pointer = new THREE.Vector2();
    const raycaster = new THREE.Raycaster();

    function resize() {
      const rect = canvas!.getBoundingClientRect();
      const width = Math.max(rect.width, 1);
      const height = Math.max(rect.height, 1);
      camera.aspect = width / height;
      const verticalFov = THREE.MathUtils.degToRad(camera.fov);
      const horizontalFov = 2 * Math.atan(Math.tan(verticalFov / 2) * camera.aspect);
      const limitingFov = Math.min(verticalFov, horizontalFov);
      state.fitDistance = radius * 1.22 / (Math.sin(limitingFov / 2) * 0.88);
      camera.position.z = state.fitDistance / state.zoom;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    }

    function setZoom(next: number) {
      state.zoom = THREE.MathUtils.clamp(next, 0.75, 1.8);
      camera.position.z = state.fitDistance / state.zoom;
    }

    function resetView() {
      state.rotationX = -0.12;
      state.rotationY = 0.1;
      state.velocityX = 0;
      state.velocityY = 0;
      setZoom(1);
    }

    function hitTest(x: number, y: number) {
      const rect = canvas!.getBoundingClientRect();
      pointer.set(((x - rect.left) / rect.width) * 2 - 1, -(((y - rect.top) / rect.height) * 2 - 1));
      raycaster.setFromCamera(pointer, camera);
      return raycaster.intersectObjects(panels.filter((panel) => panel.visible), false)[0]?.object as THREE.Mesh | undefined;
    }

    function setCaption(project: ArchiveProject | null) {
      kickerEl!.textContent = project ? project.category + ' / ' + project.year : 'EXPLORE THE ARCHIVE';
      titleEl!.textContent = project ? project.title : 'Every image holds a story.';
      metaEl!.textContent = project ? project.venue + ' · Select to open' : 'Drag the globe or choose an event from the list.';
    }

    function hidePreview() {
      if (previewCard) previewCard.hidden = true;
      globeSide?.classList.remove('has-preview');
      state.selectedSlug = '';
      setCaption(null);
    }

    function showPreview(project: ArchiveProject) {
      if (!previewCard || !previewImage || !previewKicker || !previewTitle || !previewDescription || !previewMeta || !previewLink) return;
      previewImage.src = project.image;
      previewImage.alt = project.alt;
      previewKicker.textContent = project.category + ' / ' + project.year;
      previewTitle.textContent = project.title;
      previewDescription.textContent = project.description;
      previewMeta.textContent = project.date + ' · ' + project.venue;
      previewLink.href = basePath + 'archive/' + project.slug + '/';
      previewLink.dataset.slug = project.slug;
      previewCard.hidden = false;
      globeSide?.classList.add('has-preview');
      state.selectedSlug = project.slug;
      setCaption(project);
    }

    function focusProject(project: ArchiveProject) {
      const mesh = meshBySlug.get(project.slug);
      if (!mesh) return;
      const desired = -Math.atan2(mesh.position.x, mesh.position.z);
      const difference = Math.atan2(Math.sin(desired - state.rotationY), Math.cos(desired - state.rotationY));
      state.focusRotationY = state.rotationY + difference;
      state.rotationX = 0;
      state.velocityX = state.velocityY = 0;
      setZoom(Math.max(state.zoom, 1.1));
      showPreview(project);
    }

    function setRail(open: boolean) {
      globeSide?.classList.toggle('rail-open', open);
      toggleRailButton?.setAttribute('aria-expanded', String(open));
    }

    const background = [...document.querySelectorAll<HTMLElement>('.site-header, .intro, .discover-panel, .browse-section, .site-footer')];
    const previousOverflow = document.body.style.overflow;
    async function enterImmersive() {
      if (!globeSide) return;
      globeSide.classList.add('is-immersive');
      globeSide.setAttribute('role', 'dialog');
      globeSide.setAttribute('aria-modal', 'true');
      globeSide.setAttribute('aria-label', 'Full screen archive globe');
      document.body.style.overflow = 'hidden';
      background.forEach((element) => { element.inert = true; });
      hidePreview();
      try { await globeSide.requestFullscreen?.(); } catch { /* CSS still fills the viewport. */ }
      setRail(window.innerWidth > 760);
      requestAnimationFrame(resize);
      closeImmersiveButton?.focus();
    }

    function closeImmersive() {
      if (!globeSide?.classList.contains('is-immersive')) return;
      globeSide.classList.remove('is-immersive');
      globeSide.removeAttribute('role');
      globeSide.removeAttribute('aria-modal');
      globeSide.removeAttribute('aria-label');
      document.body.style.overflow = previousOverflow;
      background.forEach((element) => { element.inert = false; });
      setRail(false);
      hidePreview();
      if (document.fullscreenElement === globeSide) document.exitFullscreen().catch(() => {});
      requestAnimationFrame(resize);
      enterImmersiveButton?.focus();
    }

    enterImmersiveButton?.addEventListener('click', enterImmersive);
    closeImmersiveButton?.addEventListener('click', closeImmersive);
    toggleRailButton?.addEventListener('click', () => setRail(!globeSide?.classList.contains('rail-open')));
    document.querySelector('[data-hide-rail]')?.addEventListener('click', () => setRail(false));
    document.querySelector('[data-close-preview]')?.addEventListener('click', hidePreview);
    document.addEventListener('fullscreenchange', () => {
      if (!document.fullscreenElement && globeSide?.classList.contains('is-immersive')) closeImmersive();
      requestAnimationFrame(resize);
    });
    window.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape' || !globeSide?.classList.contains('is-immersive')) return;
      if (immersiveSearch && document.activeElement === immersiveSearch && immersiveSearch.value) {
        setQuery('');
        immersiveSearch.blur();
      } else if (!previewCard?.hidden) {
        hidePreview();
      } else {
        closeImmersive();
      }
      event.preventDefault();
    });
    for (const button of immersiveStories) {
      button.addEventListener('click', () => {
        const project = projects.find((item) => item.slug === button.dataset.immersiveStory);
        if (!project) return;
        focusProject(project);
        if (window.innerWidth <= 760) setRail(false);
      });
    }

    updateGlobeFilter = (slugs) => {
      for (const panel of panels) panel.visible = slugs.has(panel.userData.slug);
      if (state.selectedSlug && !slugs.has(state.selectedSlug)) hidePreview();
      if (state.hoverSlug && !slugs.has(state.hoverSlug)) {
        state.hoverSlug = '';
        setCaption(null);
      }
    };
    updateFilters();

    canvas.tabIndex = 0;
    canvas.addEventListener('pointerdown', (event) => {
      state.dragging = true;
      state.focusRotationY = null;
      state.pointerX = state.downX = event.clientX;
      state.pointerY = state.downY = event.clientY;
      state.velocityX = state.velocityY = 0;
      canvas.setPointerCapture(event.pointerId);
      canvas.style.cursor = 'grabbing';
    });
    canvas.addEventListener('pointermove', (event) => {
      if (state.dragging) {
        const dx = event.clientX - state.pointerX;
        const dy = event.clientY - state.pointerY;
        state.rotationY += dx * 0.006;
        state.rotationX = THREE.MathUtils.clamp(state.rotationX + dy * 0.006, -0.9, 0.9);
        state.velocityY = dx * 0.00035;
        state.velocityX = dy * 0.00035;
        state.pointerX = event.clientX;
        state.pointerY = event.clientY;
        return;
      }
      const hit = hitTest(event.clientX, event.clientY);
      const slug = hit?.userData.slug ?? '';
      if (slug !== state.hoverSlug) {
        state.hoverSlug = slug;
        const captionSlug = slug || state.selectedSlug;
        setCaption(projects.find((project) => project.slug === captionSlug) ?? null);
      }
      canvas.style.cursor = slug ? 'pointer' : 'grab';
    });
    canvas.addEventListener('pointerup', (event) => {
      const moved = Math.hypot(event.clientX - state.downX, event.clientY - state.downY);
      state.dragging = false;
      canvas.style.cursor = 'grab';
      if (moved < 8) {
        const slug = hitTest(event.clientX, event.clientY)?.userData.slug;
        if (slug) {
          const project = projects.find((item) => item.slug === slug);
          if (globeSide?.classList.contains('is-immersive') && project) showPreview(project);
          else if (project) navigateToStory(project);
        }
      }
    });
    canvas.addEventListener('pointercancel', () => { state.dragging = false; canvas.style.cursor = 'grab'; });
    canvas.addEventListener('pointerleave', () => {
      if (!state.dragging) {
        state.hoverSlug = '';
        setCaption(projects.find((project) => project.slug === state.selectedSlug) ?? null);
      }
    });
    canvas.addEventListener('wheel', (event) => {
      event.preventDefault();
      setZoom(state.zoom * Math.exp(-event.deltaY * 0.001));
    }, { passive: false });
    canvas.addEventListener('keydown', (event) => {
      const step = event.shiftKey ? 0.32 : 0.16;
      if (event.key === 'ArrowLeft') state.rotationY -= step;
      else if (event.key === 'ArrowRight') state.rotationY += step;
      else if (event.key === 'ArrowUp') state.rotationX -= step;
      else if (event.key === 'ArrowDown') state.rotationX += step;
      else if (event.key === '+' || event.key === '=') setZoom(state.zoom * 1.12);
      else if (event.key === '-') setZoom(state.zoom / 1.12);
      else if (event.key === '0') resetView();
      else return;
      event.preventDefault();
    });
    document.querySelector('[data-zoom-in]')?.addEventListener('click', () => setZoom(state.zoom * 1.15));
    document.querySelector('[data-zoom-out]')?.addEventListener('click', () => setZoom(state.zoom / 1.15));
    document.querySelector('[data-reset-view]')?.addEventListener('click', resetView);
    window.addEventListener('resize', resize);
    if (canvas.parentElement && 'ResizeObserver' in window) new ResizeObserver(resize).observe(canvas.parentElement);
    resize();

    const clock = new THREE.Clock();
    function render() {
      const dt = Math.min(clock.getDelta(), 0.05);
      if (!state.dragging) {
        if (state.focusRotationY !== null) {
          const difference = state.focusRotationY - state.rotationY;
          state.rotationY += difference * Math.min(1, dt * 7);
          if (Math.abs(difference) < 0.002) state.focusRotationY = null;
        } else if (!state.reducedMotion && !state.hoverSlug && !state.selectedSlug) state.rotationY += 0.08 * dt;
        state.rotationY += state.velocityY;
        state.rotationX += state.velocityX;
        state.velocityX *= 0.93;
        state.velocityY *= 0.93;
      }
      state.rotationX = THREE.MathUtils.clamp(state.rotationX, -0.9, 0.9);
      globe.rotation.set(state.rotationX, state.rotationY, 0);
      for (const panel of panels) {
        const hover = panel.userData.slug === (state.hoverSlug || state.selectedSlug);
        const target = hover ? 1.1 : 1;
        panel.scale.lerp(new THREE.Vector3(target, target, 1), 0.12);
      }
      renderer.render(scene, camera);
      requestAnimationFrame(render);
    }
    render();
  } catch (error) {
    console.warn('Interactive globe unavailable; archive links remain accessible.', error);
    canvas.hidden = true;
    const label = document.querySelector<HTMLElement>('.globe-center-label');
    if (label) label.textContent = 'Explore the stories alongside the globe';
  }
}
