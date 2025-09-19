import { z, defineCollection } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    date: z.union([z.string(), z.date()]).transform((v) => new Date(v)),
    draft: z.boolean().optional(),
  }),
});

export const collections = { blog };
