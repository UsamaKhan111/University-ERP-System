const { z } = require("zod");

const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, "Invalid ObjectId");

const markAttendanceSchema = z.object({
  body: z.object({
    studentId: objectIdSchema,
    courseId: objectIdSchema,
    teacherId: objectIdSchema,
    status: z.enum(["present", "absent", "leave"]),
    lectureDate: z.coerce.date()
  })
});

const studentAttendanceSchema = z.object({
  params: z.object({
    id: objectIdSchema
  }),
  query: z.object({
    courseId: objectIdSchema.optional(),
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional()
  })
});

const attendanceAnalyticsSchema = z.object({
  query: z.object({
    courseId: objectIdSchema.optional(),
    studentId: objectIdSchema.optional(),
    threshold: z.coerce.number().min(0).max(100).optional()
  })
});

module.exports = {
  attendanceAnalyticsSchema,
  markAttendanceSchema,
  studentAttendanceSchema
};
