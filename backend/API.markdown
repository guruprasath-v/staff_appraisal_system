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

Retrieves all tasks for the HOD's department, ordered by due date.

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
      "due_date": "string",
      "department_id": "string",
      "hod_id": "string"
    }
  ]
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
