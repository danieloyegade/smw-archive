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
  let selectedFormat = 'all';
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
    transitionImage.style.objectPosition = `50% ${project.imageFocusY ?? 50}%`;
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
    const format = project.media?.some((item) => item.kind === 'audio') ? 'listen' : project.media?.some((item) => item.kind === 'video') ? 'watch' : 'look';
    if (selectedFormat !== 'all' && selectedFormat !== format) return false;
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
    const surprise = document.querySelector<HTMLButtonElement>('[data-surprise]');
    if (surprise) surprise.disabled = visible.length === 0;
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
  for (const button of document.querySelectorAll<HTMLButtonElement>('[data-format-button]')) {
    button.addEventListener('click', () => {
      selectedFormat = button.dataset.formatButton ?? 'all';
      document.querySelectorAll<HTMLButtonElement>('[data-format-button]').forEach((item) => {
        const active = item.dataset.formatButton === selectedFormat;
        item.classList.toggle('is-active', active);
        item.setAttribute('aria-pressed', String(active));
      });
      updateFilters();
    });
  }
  document.querySelector('[data-surprise]')?.addEventListener('click', () => {
    const candidates = projects.filter(matches);
    if (!candidates.length) { setYear('all'); setQuery(''); return; }
    navigateToStory(candidates[Math.floor(Math.random() * candidates.length)]);
  });

  try {
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.7));
    renderer.setClearColor(0x050505, 0);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(39, 1, 0.1, 100);
    const globe = new THREE.Group();
    scene.add(globe);

    const radius = 3.1;
    const atmosphere = new THREE.Group();
    scene.add(atmosphere);
    const core = new THREE.Mesh(
      new THREE.SphereGeometry(radius * .96, 48, 32),
      new THREE.MeshBasicMaterial({ color: 0x150304, transparent: true, opacity: .72, side: THREE.BackSide }),
    );
    const wireframe = new THREE.LineSegments(
      new THREE.WireframeGeometry(new THREE.SphereGeometry(radius, 38, 28)),
      new THREE.LineBasicMaterial({ color: 0xea433a, transparent: true, opacity: .28 }),
    );
    const latitude = new THREE.LineSegments(
      new THREE.WireframeGeometry(new THREE.SphereGeometry(radius * 1.015, 17, 10)),
      new THREE.LineBasicMaterial({ color: 0xb8322b, transparent: true, opacity: .24 }),
    );
    globe.add(core, wireframe, latitude);

    const glowShell = new THREE.Mesh(
      new THREE.SphereGeometry(radius * 1.11, 32, 24),
      new THREE.MeshBasicMaterial({ color: 0x7b1716, transparent: true, opacity: .06, side: THREE.BackSide }),
    );
    atmosphere.add(glowShell);

    const dustGeometry = new THREE.BufferGeometry();
    const dustPositions: number[] = [];
    for (let index = 0; index < 680; index += 1) {
      const spread = 6 + Math.random() * 8;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      dustPositions.push(
        Math.sin(phi) * Math.cos(theta) * spread,
        Math.cos(phi) * spread * .66,
        Math.sin(phi) * Math.sin(theta) * spread,
      );
    }
    dustGeometry.setAttribute('position', new THREE.Float32BufferAttribute(dustPositions, 3));
    const dust = new THREE.Points(dustGeometry, new THREE.PointsMaterial({ color: 0xff5b50, size: .032, transparent: true, opacity: .76, depthWrite: false }));
    scene.add(dust);

    const orbitGroup = new THREE.Group();
    for (let index = 0; index < 4; index += 1) {
      const points: THREE.Vector3[] = [];
      const tilt = (index - 1.5) * .3;
      for (let step = 0; step <= 90; step += 1) {
        const angle = (step / 90) * Math.PI * 2;
        points.push(new THREE.Vector3(Math.cos(angle) * (radius + .5 + index * .12), Math.sin(angle) * (radius * .18 + index * .08), 0));
      }
      const orbit = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), new THREE.LineBasicMaterial({ color: index === 1 ? 0xef4b43 : 0x79211f, transparent: true, opacity: index === 1 ? .48 : .25 }));
      orbit.rotation.set(tilt, .45 + index * .72, .16 * index);
      orbitGroup.add(orbit);
    }
    scene.add(orbitGroup);

    const networkPositions: number[] = [];
    const networkNodePositions: THREE.Vector3[] = [];
    for (let index = 0; index < 56; index += 1) {
      const phi = Math.acos(1 - 2 * (index + .5) / 56);
      const theta = Math.PI * (1 + Math.sqrt(5)) * index;
      networkNodePositions.push(new THREE.Vector3(
        radius * 1.025 * Math.cos(theta) * Math.sin(phi),
        radius * 1.025 * Math.sin(theta) * Math.sin(phi),
        radius * 1.025 * Math.cos(phi),
      ));
    }
    networkNodePositions.forEach((node, index) => {
      const next = networkNodePositions[(index + 1) % networkNodePositions.length];
      const jump = networkNodePositions[(index + 9) % networkNodePositions.length];
      networkPositions.push(node.x, node.y, node.z, next.x, next.y, next.z, node.x, node.y, node.z, jump.x, jump.y, jump.z);
    });
    const networkGeometry = new THREE.BufferGeometry();
    networkGeometry.setAttribute('position', new THREE.Float32BufferAttribute(networkPositions, 3));
    globe.add(new THREE.LineSegments(networkGeometry, new THREE.LineBasicMaterial({ color: 0xef4b43, transparent: true, opacity: .23 })));
    const nodesGeometry = new THREE.BufferGeometry().setFromPoints(networkNodePositions);
    globe.add(new THREE.Points(nodesGeometry, new THREE.PointsMaterial({ color: 0xff665b, size: .046, transparent: true, opacity: .88, depthWrite: false })));

    // Keep the archive legible as a constellation. The previous card size meant
    // that a front-facing card could sit directly on top of the feature story.
    const geometry = new THREE.PlaneGeometry(1.4, .94, 1, 1);
    const panels: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>[] = [];
    const meshBySlug = new Map<string, THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>>();
    const loader = new THREE.TextureLoader();
    projects.forEach((project, index) => {
      const phi = index === 0 ? Math.PI / 2 : Math.acos(1 - 2 * (index + .5) / projects.length);
      const longitude = index === 0 ? 0 : Math.PI * (1 + Math.sqrt(5)) * index + .42;
      const horizontal = Math.sin(phi);
      const position = new THREE.Vector3(
        Math.sin(longitude) * horizontal * radius,
        Math.cos(phi) * radius,
        Math.cos(longitude) * horizontal * radius,
      ).multiplyScalar(1.15);
      const material = new THREE.MeshBasicMaterial({ color: 0xebe2d7, side: THREE.DoubleSide, transparent: true, opacity: .96 });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.copy(position);
      mesh.lookAt(position.clone().multiplyScalar(2));
      mesh.userData.slug = project.slug;
      mesh.userData.project = project;
      mesh.userData.layoutIndex = index;
      mesh.userData.matchesFilter = true;
      mesh.userData.baseScale = index === 0 ? 1.1 : .68 + (index % 3) * .045;
      mesh.scale.setScalar(mesh.userData.baseScale);
      const halo = new THREE.Mesh(new THREE.PlaneGeometry(1.55, 1.09), new THREE.MeshBasicMaterial({ color: 0xaa2a25, transparent: true, opacity: .13, side: THREE.DoubleSide, depthWrite: false }));
      halo.position.z = -.015;
      mesh.add(halo);
      const border = new THREE.LineSegments(
        new THREE.EdgesGeometry(geometry),
        new THREE.LineBasicMaterial({ color: 0xef4b43, transparent: true, opacity: .76 }),
      );
      mesh.add(border);
      globe.add(mesh);
      panels.push(mesh);
      meshBySlug.set(project.slug, mesh);
      loader.load(project.image, (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 4);
        const image = texture.image as { width: number; height: number };
        const imageAspect = image.width / image.height;
        const panelAspect = 1.46 / 1.02;
        if (imageAspect > panelAspect) {
          texture.repeat.x = panelAspect / imageAspect;
          texture.offset.x = (1 - texture.repeat.x) / 2;
        } else {
          texture.repeat.y = imageAspect / panelAspect;
          texture.offset.y = (1 - texture.repeat.y) * (1 - (project.imageFocusY ?? 50) / 100);
        }
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
      state.fitDistance = radius * 1.12 / (Math.sin(limitingFov / 2) * 0.88);
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
      previewImage.style.objectPosition = `50% ${project.imageFocusY ?? 50}%`;
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

    const background = [...document.querySelectorAll<HTMLElement>('.site-header, .intro, .start-section, .discover-panel, .browse-section, .site-footer')];
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
      for (const panel of panels) {
        panel.userData.matchesFilter = slugs.has(panel.userData.slug);
        panel.material.opacity = panel.userData.matchesFilter ? .96 : 0;
      }
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
    const panelWorldPosition = new THREE.Vector3();
    const panelScreenPosition = new THREE.Vector3();
    const cameraDirection = new THREE.Vector3();
    type PanelBounds = { x: number; y: number; width: number; height: number };
    const visiblePanelBounds: PanelBounds[] = [];

    function updatePanelLayout() {
      globe.updateMatrixWorld(true);
      cameraDirection.copy(camera.position).normalize();
      visiblePanelBounds.length = 0;
      const ordered = [...panels]
        .filter((panel) => panel.userData.matchesFilter)
        .sort((a, b) => a.userData.layoutIndex - b.userData.layoutIndex);

      for (const panel of ordered) {
        panel.getWorldPosition(panelWorldPosition);
        const frontness = panelWorldPosition.normalize().dot(cameraDirection);
        panelScreenPosition.copy(panel.position).applyMatrix4(globe.matrixWorld).project(camera);
        const feature = panel.userData.layoutIndex === 0;
        const bounds: PanelBounds = {
          x: panelScreenPosition.x,
          y: panelScreenPosition.y,
          width: feature ? .46 : .19,
          height: feature ? .32 : .135,
        };
        const overlaps = visiblePanelBounds.some((placed) =>
          Math.abs(bounds.x - placed.x) < (bounds.width + placed.width) / 2 + .025 &&
          Math.abs(bounds.y - placed.y) < (bounds.height + placed.height) / 2 + .025,
        );
        // Cards on the far side of the globe add visual noise without being
        // selectable. Hide those, plus any projected collision, until rotation
        // brings them into a clear position.
        panel.visible = frontness > .08 && !overlaps;
        if (panel.visible) visiblePanelBounds.push(bounds);
      }
    }
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
      orbitGroup.rotation.y += state.reducedMotion ? 0 : dt * .035;
      orbitGroup.rotation.z = Math.sin(clock.elapsedTime * .12) * .035;
      atmosphere.rotation.y -= state.reducedMotion ? 0 : dt * .02;
      dust.rotation.y -= state.reducedMotion ? 0 : dt * .012;
      wireframe.rotation.y -= state.reducedMotion ? 0 : dt * .024;
      latitude.rotation.y += state.reducedMotion ? 0 : dt * .014;
      glowShell.material.opacity = .045 + Math.sin(clock.elapsedTime * 1.1) * .018;
      for (const panel of panels) {
        const hover = panel.userData.slug === (state.hoverSlug || state.selectedSlug);
        const target = panel.userData.baseScale * (hover ? 1.28 : 1);
        panel.scale.lerp(new THREE.Vector3(target, target, 1), .12);
        const border = panel.children.find((child) => child instanceof THREE.LineSegments) as THREE.LineSegments | undefined;
        if (border) (border.material as THREE.LineBasicMaterial).opacity = hover ? 1 : .76;
      }
      updatePanelLayout();
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
