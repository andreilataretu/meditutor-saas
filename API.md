# API Documentation - MediTutor

Base URL: `http://localhost:5000/api`

## Authentication

### Register
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "John Doe"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "John Doe",
    "createdAt": "2024-01-14T10:00:00Z"
  },
  "token": "jwt_token_here"
}
```

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:** Same as register

---

## Clients

All endpoints require `Authorization: Bearer <token>` header.

### Get All Clients
```http
GET /clients
```

**Response:**
```json
[
  {
    "id": "uuid",
    "student_name": "Ion Popescu",
    "parent_name": "Maria Popescu",
    "student_phone": "0721234567",
    "parent_phone": "0721234568",
    "grade": 10,
    "subject": "Fizică",
    "rate": 100.00,
    "status": "activ",
    "created_at": "2024-01-14T10:00:00Z"
  }
]
```

### Get Client by ID
```http
GET /clients/:id
```

### Create Client
```http
POST /clients
Content-Type: application/json

{
  "studentName": "Ion Popescu",
  "parentName": "Maria Popescu",
  "studentPhone": "0721234567",
  "parentPhone": "0721234568",
  "grade": 10,
  "subject": "Fizică",
  "rate": 100.00,
  "status": "activ"
}
```

### Update Client
```http
PUT /clients/:id
Content-Type: application/json

{
  "studentName": "Ion Popescu",
  "rate": 120.00
}
```

### Delete Client
```http
DELETE /clients/:id
```

### Get Client Statistics
```http
GET /clients/:id/stats
```

**Response:**
```json
{
  "total_sessions": 10,
  "total_paid": 1000.00,
  "total_unpaid": 200.00
}
```

---

## Sessions

### Get All Sessions
```http
GET /sessions?startDate=2024-01-01&endDate=2024-12-31&clientId=uuid&paymentStatus=Plătit
```

Query Parameters:
- `startDate` (optional): Filter by start date
- `endDate` (optional): Filter by end date
- `clientId` (optional): Filter by client
- `paymentStatus` (optional): "Plătit" or "Neplătit"

### Create Session
```http
POST /sessions
Content-Type: application/json

{
  "clientId": "uuid",
  "sessionDate": "2024-01-15",
  "sessionTime": "14:00",
  "description": "Capitolul 3: Mișcarea",
  "paymentStatus": "Neplătit"
}
```

### Mark Session as Paid
```http
PATCH /sessions/:id/mark-paid
```

---

## Notes (CRM)

### Get Notes for Client
```http
GET /notes/client/:clientId
```

### Create Note
```http
POST /notes
Content-Type: application/json

{
  "clientId": "uuid",
  "noteText": "Elevul este foarte atent la ore"
}
```

---

## Grades

### Get Grades for Client
```http
GET /grades/client/:clientId
```

### Create Grade
```http
POST /grades
Content-Type: application/json

{
  "clientId": "uuid",
  "gradeType": "Test",
  "gradeValue": 9.5,
  "maxGrade": 10,
  "subject": "Fizică",
  "gradeDate": "2024-01-15",
  "notes": "Test foarte bun"
}
```

Grade Types: `Test`, `Teză`, `Simulare`, `Altele`

---

## Objectives

### Get Objectives for Client
```http
GET /objectives/client/:clientId
```

### Create Objective
```http
POST /objectives
Content-Type: application/json

{
  "clientId": "uuid",
  "objectiveText": "Să înțeleagă legile lui Newton",
  "status": "În progres",
  "targetDate": "2024-02-01"
}
```

Status options: `Finalizat`, `În progres`, `Blocat`

---

## Session Journals

### Get Journal for Session
```http
GET /journals/session/:sessionId
```

### Create/Update Journal
```http
POST /journals
Content-Type: application/json

{
  "sessionId": "uuid",
  "topicsCovered": "Legile lui Newton",
  "homeworkAssigned": "Exercițiile 1-5",
  "studentMood": "Motivat",
  "notes": "Lecție productivă"
}
```

---

## Materials

### Get All Materials
```http
GET /materials?subject=Fizică&grade=10&materialType=Document
```

### Upload Material
```http
POST /materials
Content-Type: multipart/form-data

file: [binary]
title: "Formule Fizică"
description: "Formule importante"
materialType: "Document"
subject: "Fizică"
grade: 10
```

Material Types: `Document`, `Video`, `Link`, `Imagine`

### Download Material
```http
GET /materials/:id/download
```

---

## Statistics

### Dashboard Statistics
```http
GET /stats/dashboard
```

**Response:**
```json
{
  "totalClients": 15,
  "totalSessions": 150,
  "paidSessions": 120,
  "unpaidAmount": 3000.00,
  "todaySessions": [...],
  "upcomingSessions": [...],
  "unpaidSessions": [...]
}
```

### Financial Statistics
```http
GET /stats/financial?months=6
```

**Response:**
```json
{
  "monthlyRevenue": [
    {
      "month": "2024-01",
      "paid": 5000.00,
      "unpaid": 1000.00
    }
  ],
  "totalPaid": 30000.00,
  "totalUnpaid": 5000.00,
  "clientBreakdown": [...]
}
```

### Monthly Summary
```http
GET /stats/monthly-summary?year=2024&month=1
```

---

## Error Responses

All endpoints return standard error responses:

```json
{
  "error": "Error message here"
}
```

Common HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `409` - Conflict (duplicate)
- `500` - Server Error

---

## Rate Limiting

Currently not implemented. Recommended for production.

## Pagination

Currently not implemented. All endpoints return full results.

---

For more details, see the [README.md](README.md)
