import { getCollection, type CollectionEntry } from 'astro:content';
import { getImage } from 'astro:assets';

export type ProjectEntry = CollectionEntry<'projects'>;

/** Longest edge of the textures the globe uploads to the GPU. */
const GLOBE_TEXTURE_WIDTH = 1024;

/** Width of the hero image on an archive detail page, at 1x. */
export const DETAIL_IMAGE_WIDTH = 1200;

/** The shape handed to the browser as JSON for the globe and the search index. */
export interface ClientProject {
  order: number;
  title: string;
  slug: string;
  category: string;
  year: string;
  description: string;
  places: string[];
  keywords: string[];
  /** Optimised texture URL, or null when this entry has no photograph yet. */
  image: string | null;
}

/** Every archive entry, in archive order. */
export async function getProjects(): Promise<ProjectEntry[]> {
  const entries = await getCollection('projects');
  return entries.sort((a, b) => a.data.order - b.data.order);
}

/**
 * Build the client payload. Images are resized to texture dimensions here rather
 * than shipping the originals: the source photographs are up to 17MB each, and a
 * globe panel is a few hundred pixels wide at most.
 */
export async function toClientProjects(entries: ProjectEntry[]): Promise<ClientProject[]> {
  return Promise.all(
    entries.map(async (entry) => {
      const { image, ...data } = entry.data;
      const texture = image
        ? await getImage({
            src: image,
            width: Math.min(GLOBE_TEXTURE_WIDTH, image.width),
            format: 'webp',
          })
        : null;

      return {
        ...data,
        slug: entry.id,
        image: texture?.src ?? null,
      };
    }),
  );
}

/** Previous and next entries in archive order, wrapping at both ends. */
export function getNeighbours(entries: ProjectEntry[], slug: string) {
  const index = entries.findIndex((entry) => entry.id === slug);
  if (index === -1) return { previous: undefined, next: undefined };
  return {
    previous: entries[(index - 1 + entries.length) % entries.length],
    next: entries[(index + 1) % entries.length],
  };
}

/**
 * Other entries sharing a place or a keyword, closest match first.
 *
 * Terms are weighted by how rare they are across the archive. Almost every entry
 * is in Manchester, so sharing "Manchester" says nothing; sharing "Lagos" or
 * "supper club" says a lot.
 */
export function getRelated(entries: ProjectEntry[], current: ProjectEntry, limit = 3) {
  const frequency = new Map<string, number>();
  for (const entry of entries) {
    for (const term of [...entry.data.places, ...entry.data.keywords]) {
      frequency.set(term, (frequency.get(term) ?? 0) + 1);
    }
  }

  const weight = (term: string) => 1 / (frequency.get(term) ?? 1);
  const terms = new Set([...current.data.places, ...current.data.keywords]);

  return entries
    .filter((entry) => entry.id !== current.id)
    .map((entry) => {
      const shared = [...entry.data.places, ...entry.data.keywords]
        .filter((term) => terms.has(term))
        .reduce((total, term) => total + weight(term), 0);
      const sameCategory = entry.data.category === current.data.category ? 0.5 : 0;
      return { entry, score: shared + sameCategory };
    })
    // A term shared by most of the archive is not a relationship worth showing.
    .filter((candidate) => candidate.score > 0.2)
    .sort((a, b) => b.score - a.score || a.entry.data.order - b.entry.data.order)
    .slice(0, limit)
    .map((candidate) => candidate.entry);
}
