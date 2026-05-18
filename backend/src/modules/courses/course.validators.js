const { z } = require("zod");

const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, "Invalid ObjectId");

const createCourseSchema = z.object({
  body: z.object({
    title: z.string().trim().min(2).max(120),
    courseCode: z.string().trim().min(2).max(30).transform((value) => value.toUpperCase()),
    semester: z.coerce.number().int().min(1).max(12),
    creditHours: z.coerce.number().int().min(1).max(6),
    teacherId: objectIdSchema
  })
});

const listCoursesSchema = z.object({
  query: z.object({
    search: z.string().trim().max(80).optional(),
    semester: z.coerce.number().int().min(1).max(12).optional(),
    teacherId: objectIdSchema.optional(),
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional()
  })
});

module.exports = {
  createCourseSchema,
  listCoursesSchema
};
