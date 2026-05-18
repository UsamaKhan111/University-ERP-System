const { z } = require("zod");

const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, "Invalid ObjectId");

const studentBodySchema = z.object({
  userId: objectIdSchema,
  registrationNumber: z.string().trim().min(3).max(40).transform((value) => value.toUpperCase()),
  department: z.string().trim().min(2).max(80),
  semester: z.coerce.number().int().min(1).max(12),
  session: z.string().trim().min(4).max(30),
  guardianName: z.string().trim().min(2).max(100).optional().or(z.literal("")),
  phone: z.string().trim().min(7).max(25).optional().or(z.literal("")),
  address: z.string().trim().min(3).max(250).optional().or(z.literal(""))
});

const createStudentSchema = z.object({
  body: studentBodySchema
});

const updateStudentSchema = z.object({
  params: z.object({
    id: objectIdSchema
  }),
  body: studentBodySchema.partial().refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required"
  })
});

const studentIdSchema = z.object({
  params: z.object({
    id: objectIdSchema
  })
});

const listStudentsSchema = z.object({
  query: z.object({
    search: z.string().trim().max(80).optional(),
    department: z.string().trim().max(80).optional(),
    semester: z.coerce.number().int().min(1).max(12).optional(),
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional()
  })
});

module.exports = {
  createStudentSchema,
  listStudentsSchema,
  studentIdSchema,
  updateStudentSchema
};
