const { z } = require("zod");

const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, "Invalid ObjectId");

const createFeeSchema = z.object({
  body: z.object({
    studentId: objectIdSchema,
    semester: z.coerce.number().int().min(1).max(12),
    amount: z.coerce.number().min(0),
    dueDate: z.coerce.date(),
    paymentStatus: z.enum(["pending", "paid", "overdue", "waived"]).default("pending")
  })
});

const studentFeesSchema = z.object({
  params: z.object({
    id: objectIdSchema
  })
});

const feeIdSchema = z.object({
  params: z.object({
    id: objectIdSchema
  })
});

module.exports = {
  createFeeSchema,
  feeIdSchema,
  studentFeesSchema
};
