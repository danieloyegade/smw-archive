/** Base path of the deployed site, published by BaseLayout as `body[data-base]`. */
export function basePath() {
  return (document.body.dataset.base ?? '/').replace(/\/?$/, '/');
}

export function projectHref(slug: string) {
  return `${basePath()}archive/${encodeURIComponent(slug)}/`;
}

export function escapeHtml(value: string) {
  return value.replace(
    /[&<>'"]/g,
    (character) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character] ??
      character,
  );
}
