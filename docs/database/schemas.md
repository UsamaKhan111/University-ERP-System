# MongoDB Schema Reference

## Collection: users

```js
{
  _id: ObjectId,
  fullName: String,
  email: String,
  password: String,
  role: String, // admin, teacher, student
  isActive: Boolean,
  lastLogin: Date
}
```

Indexes:
- email (unique)

---

## Collection: students

```js
{
  _id: ObjectId,
  userId: ObjectId,
  registrationNumber: String,
  department: String,
  semester: Number,
  session: String,
  phone: String,
  address: String,
  guardianName: String
}
```

Indexes:
- registrationNumber
- department
- semester

---

## Collection: teachers

```js
{
  _id: ObjectId,
  userId: ObjectId,
  employeeId: String,
  department: String,
  specialization: String,
  assignedCourses: [ObjectId]
}
```

Indexes:
- employeeId
- department

---

## Collection: courses

```js
{
  _id: ObjectId,
  title: String,
  courseCode: String,
  creditHours: Number,
  teacherId: ObjectId,
  semester: Number
}
```

Indexes:
- courseCode
- semester

---

## Collection: enrollments

```js
{
  _id: ObjectId,
  studentId: ObjectId,
  courseId: ObjectId,
  enrolledAt: Date
}
```

Indexes:
- studentId
- courseId

---

## Collection: attendance

```js
{
  _id: ObjectId,
  studentId: ObjectId,
  courseId: ObjectId,
  teacherId: ObjectId,
  status: String, // present absent leave
  lectureDate: Date
}
```

Indexes:
- studentId
- courseId
- lectureDate

---

## Collection: exams

```js
{
  _id: ObjectId,
  courseId: ObjectId,
  examType: String,
  totalMarks: Number,
  examDate: Date
}
```

---

## Collection: results

```js
{
  _id: ObjectId,
  examId: ObjectId,
  studentId: ObjectId,
  obtainedMarks: Number,
  grade: String,
  GPA: Number
}
```

---

## Collection: fees

```js
{
  _id: ObjectId,
  studentId: ObjectId,
  semester: Number,
  amount: Number,
  dueDate: Date,
  paymentStatus: String
}
```

---

## Collection: notifications

```js
{
  _id: ObjectId,
  title: String,
  message: String,
  recipientRole: String,
  createdBy: ObjectId
}
```

Database normalization enthusiasts will stare at this while whispering “third normal form” like priests battling demons.