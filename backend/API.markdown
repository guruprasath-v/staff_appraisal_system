# Staff Appraisal System API Documentation

## Authentication Endpoints

### Login

```http
POST /api/auth/login
```

Authenticates a user and returns a JWT token.

#### Request Body

```json
{
  "email": "string",
  "password": "string"
}
```

#### Response

```json
{
  "success": true,
  "token": "string",
  "user": {
    "id": "string",
    "name": "string",
    "email": "string",
    "role": "string"
  }
}
```

#### Error Response

```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

### Logout

```http
POST /api/auth/logout
```

## Staff Endpoints

### Get Staff Rankings (Admin Only)

```http
GET /api/staff/rankings
```

Retrieves all staff members ordered by their overall efficiency score. Only accessible by admin users.

#### Headers

- Authorization: Bearer {token}

#### Query Parameters

- page (optional): Page number (default: 1)
- limit (optional): Items per page (default: 10)

#### Response

```json
{
  "success": true,
  "data": {
    "staff": [
      {
        "id": "string",
        "name": "string",
        "email": "string",
        "department_id": "string",
        "department_name": "string",
        "overall_efficiency": "number",
        "completed_tasks": "number"
      }
    ],
    "pagination": {
      "total": "number",
      "page": "number",
      "limit": "number",
      "totalPages": "number"
    }
  }
}
```

### Get Assigned Subtasks (Staff Only)

```http
GET /api/staff/stask
```

Retrieves all subtasks assigned to the authenticated staff member.

#### Response

```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "priority": "string",
      "status": "string",
      "due_date": "string",
      "created_at": "string",
      "task_name": "string"
    }
  ]
}
```

### Update Subtask Status (Staff Only)

```http
PUT /api/staff/stask/:stid
```

Updates the status of a specific subtask to 'review'.

#### Parameters

- `stid`: Subtask ID (string, required)

#### Headers

- Authorization: Bearer {token}

#### Response

```json
{
  "success": true,
  "message": "Subtask status updated to review"
}
```

Logs out the current user by clearing the JWT token cookie.

#### Headers

- Authorization: Bearer {token}

#### Response

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

## Staff Management Endpoints

### Register Staff (Admin Only)

```http
POST /api/staff/register
```

Registers a new staff member. Only accessible by admin users.

#### Headers

- Authorization: Bearer {token}

#### Request Body

```json
{
  "name": "string",
  "email": "string",
  "password": "string",
  "department_id": "string"
}
```

#### Response

```json
{
  "success": true,
  "message": "Staff registered successfully",
  "data": {
    "id": "string",
    "name": "string",
    "email": "string",
    "role": "staff",
    "department_id": "string"
  }
}
```

#### Error Response

```json
{
  "success": false,
  "message": "Access denied. Admin privileges required."
}
```

## Department Management Endpoints

### Create Task (HOD Only)

```http
POST /api/dpt/tasks
```

Creates a new task for the department. Only accessible by HOD users.

#### Headers

- Authorization: Bearer {token}

#### Request Body

```json
{
  "name": "string",
  "description": "string",
  "due_date": "string (YYYY-MM-DD)",
  "department_id": "string"
}
```

#### Response

```json
{
  "success": true,
  "message": "Task created successfully",
  "data": {
    "id": "string",
    "name": "string",
    "description": "string",
    "due_date": "string",
    "department_id": "string",
    "hod_id": "string"
  }
}
```

### Get Department Tasks (HOD Only)

```http
GET /api/dpt/tasks
```

Retrieves all tasks for the HOD's department, ordered by due date. Supports pagination.

#### Headers

- Authorization: Bearer {token}

#### Query Parameters

- page (optional): Page number (default: 1)
- limit (optional): Items per page (default: 10, max: 50)

#### Response

```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "due_date": "string",
      "department_id": "string",
      "hod_id": "string"
    }
  ]
}
```

### Create Subtask (HOD Only)

```http
POST /api/dpt/stask/:pid
```

Creates a new subtask for a specific task. Only accessible by HOD users.

#### Headers

- Authorization: Bearer {token}

#### Request Body

```json
{
  "name": "string",
  "description": "string",
  "priority": "string",
  "assigned_employee": "string",
  "due_date": "string (YYYY-MM-DD)"
}
```

#### Response

```json
{
  "success": true,
  "message": "Subtask created successfully",
  "data": {
    "id": "string",
    "name": "string",
    "description": "string",
    "priority": "string",
    "parent_task_id": "string",
    "assigned_employee": "string",
    "due_date": "string",
    "max_due_date": "string",
    "department_id": "string"
  }
}
```

### Get Department Subtasks (HOD Only)

```http
GET /api/dpt/stask
```

Retrieves all subtasks for the HOD's department with pagination support.

### Get Subtasks by Parent Task ID (HOD Only)

```http
GET /api/dpt/stask/:ptid
```

Retrieves all subtasks associated with a specific parent task ID.

#### Parameters

- `ptid`: Parent Task ID (string, required)

#### Headers

- Authorization: Bearer {token}

#### Response

```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "priority": "string",
      "status": "string",
      "assigned_employee": "string",
      "employee_name": "string",
      "employee_email": "string",
      "due_date": "string",
      "created_at": "string"
    }
  ]
}
```

### Get Department Review Subtasks (HOD Only)

```http
GET /api/dpt/dpt/stask
```

Retrieves subtasks with 'review' status for the HOD's department, ordered by updated_at in ascending order.

#### Authentication

Requires a valid JWT token and HOD role.

#### Response

```json
{
  "success": true,
  "data": [
    {
      "_id": "string",
      "title": "string",
      "description": "string",
      "status": "review",
      "assignedTo": "string",
      "parentTask": "string",
      "createdAt": "string",
      "updatedAt": "string"
    }
  ]
}
```

#### Error Responses

- 401: Unauthorized - Invalid or missing token
- 403: Forbidden - User is not an HOD
- 500: Internal Server Error

### Update Subtask Status (HOD Only)

```http
PUT /api/dpt/stask/:stid
```

Updates the status of a specific subtask. HODs can mark subtasks as 'rework' or 'completed'.

#### Parameters

- `stid`: Subtask ID (string, required)

#### Request Body

```json
{
  "status": "string", // Allowed values: "rework", "completed"
  "quality_of_work": "string" // if status is completed then quality is required
}
```

#### Response

```json
{
  "success": true,
  "message": "Subtask status updated successfully"
}
```

#### Headers

- Authorization: Bearer {token}

#### Query Parameters

- page (optional): Page number (default: 1)
- limit (optional): Items per page (default: 10)

#### Response

```json
{
  "success": true,
  "message": "Subtasks retrieved successfully",
  "data": {
    "subtasks": [
      {
        "id": "string",
        "name": "string",
        "description": "string",
        "priority": "string",
        "status": "string",
        "parent_task_id": "string",
        "assigned_employee": "string",
        "rework count": "string",
        "task_name": "string",
        "task_name": "string",
        "assigned_employee": "string",
        "employee_name": "string",
        "employee_email": "string",
        "due_date": "string",
        "max_due_date": "string",
        "department_id": "string",
        "created_at": "string"
      }
    ],
    "pagination": {
      "total": "number",
      "page": "number",
      "limit": "number",
      "totalPages": "number"
    }
  }
}
```

## Error Codes

- 400: Bad Request - Invalid input data
- 401: Unauthorized - Invalid or missing authentication token
- 403: Forbidden - Insufficient permissions
- 500: Internal Server Error - Server-side error

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer {token}
```

The token is obtained through the login endpoint and should be included in all subsequent requests to protected endpoints.
