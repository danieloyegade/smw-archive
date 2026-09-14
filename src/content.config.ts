import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const projects = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/projects' }),
  schema: ({ image }) =>
    z
      .object({
        /** Position in the archive. Drives the globe layout and the "01 / 20" numbering. */
        order: z.number().int().positive(),
        title: z.string().min(1),
        category: z.string().min(1),
        year: z.string().regex(/^\d{4}$/, 'Year must be a four-digit string, e.g. "2024".'),
        description: z.string().min(1),
        places: z.array(z.string().min(1)).default([]),
        keywords: z.array(z.string().min(1)).default([]),
        /**
         * Optional. A missing image is a deliberate gap that renders a generated
         * placeholder; a *wrong* path fails the build, which is the point of using
         * `image()` here rather than a bare string.
         */
        image: image().optional(),
        alt: z.string().min(1).optional(),
      })
      .refine((entry) => !entry.image || Boolean(entry.alt), {
        message: 'An entry with an image must also provide alt text.',
        path: ['alt'],
      }),
});

export const collections = { projects };
