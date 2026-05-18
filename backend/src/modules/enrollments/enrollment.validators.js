const { z } = require("zod");

const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, "Invalid ObjectId");

const createEnrollmentSchema = z.object({
  body: z.object({
    studentId: objectIdSchema,
    courseId: objectIdSchema,
    enrolledAt: z.coerce.date().optional()
  })
});

module.exports = {
  createEnrollmentSchema
};
