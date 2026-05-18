const Attendance = require("../../models/Attendance");
const Fee = require("../../models/Fee");
const Result = require("../../models/Result");
const Student = require("../../models/Student");

const getDepartmentWiseStudentCount = async () => {
  return Student.aggregate([
    {
      $group: {
        _id: "$department",
        totalStudents: { $sum: 1 }
      }
    },
    {
      $project: {
        _id: 0,
        department: "$_id",
        totalStudents: 1
      }
    },
    { $sort: { totalStudents: -1, department: 1 } }
  ]);
};

const getStudentGrowth = async () => {
  return Student.aggregate([
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" }
        },
        totalStudents: { $sum: 1 }
      }
    },
    {
      $project: {
        _id: 0,
        year: "$_id.year",
        month: "$_id.month",
        totalStudents: 1
      }
    },
    { $sort: { year: 1, month: 1 } }
  ]);
};

const getAttendanceTrends = async () => {
  return Attendance.aggregate([
    {
      $group: {
        _id: {
          year: { $year: "$lectureDate" },
          month: { $month: "$lectureDate" },
          status: "$status"
        },
        total: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: {
          year: "$_id.year",
          month: "$_id.month"
        },
        statuses: {
          $push: {
            status: "$_id.status",
            total: "$total"
          }
        },
        totalMarked: { $sum: "$total" }
      }
    },
    {
      $project: {
        _id: 0,
        year: "$_id.year",
        month: "$_id.month",
        statuses: 1,
        totalMarked: 1
      }
    },
    { $sort: { year: 1, month: 1 } }
  ]);
};

const getRevenueAnalytics = async () => {
  return Fee.aggregate([
    {
      $group: {
        _id: "$paymentStatus",
        totalAmount: { $sum: "$amount" },
        totalRecords: { $sum: 1 }
      }
    },
    {
      $project: {
        _id: 0,
        paymentStatus: "$_id",
        totalAmount: 1,
        totalRecords: 1
      }
    },
    { $sort: { totalAmount: -1 } }
  ]);
};

const getGpaAnalytics = async () => {
  return Result.aggregate([
    {
      $group: {
        _id: "$grade",
        averageGPA: { $avg: "$GPA" },
        totalResults: { $sum: 1 }
      }
    },
    {
      $project: {
        _id: 0,
        grade: "$_id",
        averageGPA: { $round: ["$averageGPA", 2] },
        totalResults: 1
      }
    },
    { $sort: { averageGPA: -1, grade: 1 } }
  ]);
};

const getDashboardAnalytics = async () => {
  const [departments, studentGrowth, attendanceTrends, revenue, gpa] = await Promise.all([
    getDepartmentWiseStudentCount(),
    getStudentGrowth(),
    getAttendanceTrends(),
    getRevenueAnalytics(),
    getGpaAnalytics()
  ]);

  return {
    attendanceTrends,
    departments,
    gpa,
    revenue,
    studentGrowth
  };
};

module.exports = {
  getAttendanceTrends,
  getDashboardAnalytics,
  getDepartmentWiseStudentCount,
  getGpaAnalytics,
  getRevenueAnalytics,
  getStudentGrowth
};
