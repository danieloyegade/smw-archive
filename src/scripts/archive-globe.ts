import type { ClientProject } from '../lib/projects';
import type { initArchiveGlobe } from './globe-scene';
import { escapeHtml, projectHref } from './paths';

/**
 * Cheap WebGL probe. Creating and discarding a context is far cheaper than
 * downloading three.js to discover the browser cannot use it.
 */
function supportsWebGL() {
  try {
    const probe = document.createElement('canvas');
    const context = probe.getContext('webgl2') ?? probe.getContext('webgl');
    context?.getExtension('WEBGL_lose_context')?.loseContext();
    return Boolean(context);
  } catch {
    return false;
  }
}

/** Search runs in both views, so it is wired up independently of WebGL. */
function mountSearch(projects: ClientProject[]) {
  const input = document.querySelector<HTMLInputElement>('[data-search-input]');
  const results = document.querySelector<HTMLElement>('[data-search-results]');
  const count = document.querySelector<HTMLElement>('[data-result-count]');
  const list = document.querySelector<HTMLElement>('[data-result-list]');
  if (!input || !results || !count || !list) return;

  const haystacks = new Map(
    projects.map((project) => [
      project.slug,
      [
        project.title,
        project.category,
        project.year,
        project.description,
        ...project.places,
        ...project.keywords,
      ]
        .join(' ')
        .toLocaleLowerCase(),
    ]),
  );

  function search() {
    const query = input!.value.trim().toLocaleLowerCase();
    results!.hidden = query.length === 0;

    if (!query) {
      list!.replaceChildren();
      count!.textContent = '';
      return;
    }

    const terms = query.split(/\s+/).filter(Boolean);
    const matches = projects.filter((project) =>
      terms.every((term) => haystacks.get(project.slug)?.includes(term)),
    );

    count!.textContent = `${matches.length} ${matches.length === 1 ? 'result' : 'results'}`;

    if (matches.length === 0) {
      list!.innerHTML = '<p class="empty-result">No matching archive entries yet.</p>';
      return;
    }

    list!.innerHTML = matches
      .map(
        (project) => `
      <a href="${escapeHtml(projectHref(project.slug))}">
        <span class="result-number">${String(project.order).padStart(2, '0')}</span>
        <span>
          <strong>${escapeHtml(project.title)}</strong>
          <small>${escapeHtml(project.category)} · ${escapeHtml(project.year)}${
            project.places.length ? ` · ${escapeHtml(project.places.join(', '))}` : ''
          }</small>
        </span>
      </a>`,
      )
      .join('');
  }

  input.addEventListener('input', search);
  input.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    input.value = '';
    search();
    input.blur();
  });

  window.addEventListener('keydown', (event) => {
    const target = event.target;
    if (event.key !== '/' || target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
      return;
    }
    event.preventDefault();
    input.focus();
  });
}

export async function mountArchiveGlobe() {
  const shell = document.querySelector<HTMLElement>('[data-archive-shell]');
  const dataEl = document.querySelector<HTMLScriptElement>('[data-archive-projects]');
  if (!shell || !dataEl) return;

  let projects: ClientProject[] = [];
  try {
    projects = JSON.parse(dataEl.textContent || '[]') as ClientProject[];
  } catch {
    return;
  }

  mountSearch(projects);

  const canvas = document.querySelector<HTMLCanvasElement>('[data-globe-canvas]');
  const stage = document.querySelector<HTMLElement>('[data-stage]');
  const titleEl = document.querySelector<HTMLElement>('[data-caption-title]');
  const metaEl = document.querySelector<HTMLElement>('[data-caption-meta]');
  const fallbackNote = document.querySelector<HTMLElement>('[data-globe-fallback]');
  const toggle = document.querySelector<HTMLButtonElement>('[data-view-toggle]');
  const toggleLabel = document.querySelector<HTMLElement>('[data-view-toggle-label]');

  if (!canvas || !stage || !titleEl || !metaEl || projects.length === 0) return;

  // An arrow function, not a declaration: hoisting would lose the null narrowing above.
  const standDown = (reason: string, error?: unknown) => {
    console.warn(`Archive globe unavailable (${reason}), using the list view.`, error ?? '');
    delete shell.dataset.view;
    if (fallbackNote) fallbackNote.hidden = false;
  };

  if (!supportsWebGL()) {
    standDown('no WebGL');
    return;
  }

  let initScene: typeof initArchiveGlobe;
  try {
    ({ initArchiveGlobe: initScene } = await import('./globe-scene'));
  } catch (error) {
    standDown('scene failed to load', error);
    return;
  }

  // The stage must be laid out before the renderer measures it.
  shell.dataset.view = 'globe';

  let globe: ReturnType<typeof initArchiveGlobe> | undefined;
  try {
    globe = initScene({
      shell,
      canvas,
      stage,
      titleEl,
      metaEl,
      projects,
      zoomInButton: document.querySelector<HTMLButtonElement>('[data-zoom-in]') ?? undefined,
      zoomOutButton: document.querySelector<HTMLButtonElement>('[data-zoom-out]') ?? undefined,
      resetButton: document.querySelector<HTMLButtonElement>('[data-reset-view]') ?? undefined,
    });
  } catch (error) {
    // A context that probed fine but could not actually be created.
    standDown('renderer failed to start', error);
    return;
  }

  toggle?.addEventListener('click', () => {
    const showList = shell.dataset.view === 'globe';
    shell.dataset.view = showList ? 'list' : 'globe';
    toggle.setAttribute('aria-pressed', String(showList));
    if (toggleLabel) toggleLabel.textContent = showList ? 'Globe view' : 'List view';
    if (!showList) globe?.requestRender();
  });
}
