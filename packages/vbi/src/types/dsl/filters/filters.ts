import { z } from 'zod'

export const zVBIFilter = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  field: z.string(),
  operator: z.string(),
  value: z.any(),
  enabled: z.boolean().optional().default(true),
})

export type VBIFilter = z.infer<typeof zVBIFilter>
