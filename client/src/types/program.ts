import { z } from "zod";

/**
 * Base schema for program validation
 * Used in both creation and editing of programs
 */
export const programFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  startDate: z.date({
    required_error: "Start date is required",
  }),
  endDate: z.date({
    required_error: "End date is required",
  }),
  coverImage: z
    .instanceof(File)
    .optional()
    .refine(
      (file) => {
        if (!file) return true;
        return ['image/jpeg', 'image/png'].includes(file.type);
      },
      {
        message: "Only JPEG and PNG images are allowed",
      }
    ),
}).refine(data => data.endDate > data.startDate, {
  message: "End date must be after start date",
  path: ["endDate"],
});

export type ProgramFormData = z.infer<typeof programFormSchema>;