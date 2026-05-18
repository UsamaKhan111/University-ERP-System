const { z } = require("zod");

const roleEnum = z.enum(["admin", "teacher", "student"]);

const registerSchema = z.object({
  body: z.object({
    fullName: z.string().trim().min(2, "Full name must be at least 2 characters").max(100),
    email: z.string().trim().email("Email must be valid").toLowerCase(),
    password: z.string().min(8, "Password must be at least 8 characters"),
    role: roleEnum.default("student")
  })
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().trim().email("Email must be valid").toLowerCase(),
    password: z.string().min(1, "Password is required")
  })
});

module.exports = {
  loginSchema,
  registerSchema,
  roleEnum
};
