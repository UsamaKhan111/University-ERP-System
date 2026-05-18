const { z } = require("zod");

const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, "Invalid ObjectId");

const teacherBodySchema = z.object({
  userId: objectIdSchema,
  employeeId: z.string().trim().min(3).max(40).transform((value) => value.toUpperCase()),
  department: z.string().trim().min(2).max(80),
  specialization: z.string().trim().min(2).max(120),
  assignedCourses: z.array(objectIdSchema).default([])
});

const createTeacherSchema = z.object({
  body: teacherBodySchema
});

const updateTeacherSchema = z.object({
  params: z.object({
    id: objectIdSchema
  }),
  body: teacherBodySchema
    .partial()
    .extend({
      fullName: z.string().trim().min(2).max(100).optional(),
      password: z.string().min(8, "Password must be at least 8 characters").optional()
    })
    .refine((value) => Object.keys(value).length > 0, {
      message: "At least one field is required"
    })
});

const teacherIdSchema = z.object({
  params: z.object({
    id: objectIdSchema
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
  listTeachersSchema,
  teacherIdSchema,
  updateTeacherSchema
};
