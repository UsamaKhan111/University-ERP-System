const { z } = require("zod");

const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, "Invalid ObjectId");

const createResultSchema = z.object({
  body: z.object({
    examId: objectIdSchema,
    studentId: objectIdSchema,
    obtainedMarks: z.coerce.number().min(0)
  })
});

const studentResultsSchema = z.object({
  params: z.object({
    id: objectIdSchema
  })
});

module.exports = {
  createResultSchema,
  studentResultsSchema
};
