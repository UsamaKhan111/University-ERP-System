const { z } = require("zod");

const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, "Invalid ObjectId");

const createTeacherSchema = z.object({
  body: z.object({
    userId: objectIdSchema,
    employeeId: z.string().trim().min(3).max(40).transform((value) => value.toUpperCase()),
    department: z.string().trim().min(2).max(80),
    specialization: z.string().trim().min(2).max(120),
    assignedCourses: z.array(objectIdSchema).default([])
  })
});

const listTeachersSchema = z.object({
  query: z.object({
    search: z.string().trim().max(80).optional(),
    department: z.string().trim().max(80).optional(),
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional()
  })
});

module.exports = {
  createTeacherSchema,
  listTeachersSchema
};
