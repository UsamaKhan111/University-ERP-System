const { z } = require("zod");

const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, "Invalid ObjectId");

const createExamSchema = z.object({
  body: z.object({
    courseId: objectIdSchema,
    examType: z.enum(["quiz", "midterm", "final", "assignment", "lab"]),
    totalMarks: z.coerce.number().min(1).max(1000),
    examDate: z.coerce.date()
  })
});

const listExamsSchema = z.object({
  query: z.object({
    courseId: objectIdSchema.optional(),
    examType: z.enum(["quiz", "midterm", "final", "assignment", "lab"]).optional(),
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional()
  })
});

module.exports = {
  createExamSchema,
  listExamsSchema
};
