Here’s a full API_DOC.md you can drop into your backend repo 👇

# Kanban Backend – API Documentation

Base URL (local dev):

- `http://localhost:5000`

All endpoints are prefixed with:

- `/api`

---

## Authentication

The API uses **JWT (JSON Web Token)** for authentication.

- Auth endpoints (`/auth/*`) are **public**.
- All other endpoints require:
  - Header: `Authorization: Bearer <token>`

If the token is missing or invalid, the API returns:

```json
{
  "success": false,
  "message": "Unauthorized"
}


⸻

Common Response Format

Success

{
  "success": true,
  "data": { ... }
}

Error

{
  "success": false,
  "message": "Error message"
}


⸻

1. Auth APIs

1.1 Register

URL: /api/auth/register
Method: POST
Auth: ❌ Public

Request Body:

{
  "name": "Sahil",
  "email": "sahil@example.com",
  "password": "password123"
}

Response:

{
  "success": true,
  "data": {
    "user": {
      "_id": "user_id",
      "name": "Sahil",
      "email": "sahil@example.com",
      "avatarUrl": null
    },
    "token": "jwt_token_here"
  }
}


⸻

1.2 Login

URL: /api/auth/login
Method: POST
Auth: ❌ Public

Request Body:

{
  "email": "sahil@example.com",
  "password": "password123"
}

Response:

{
  "success": true,
  "data": {
    "user": {
      "_id": "user_id",
      "name": "Sahil",
      "email": "sahil@example.com",
      "avatarUrl": null
    },
    "token": "jwt_token_here"
  }
}


⸻

2. Board APIs

A board is like a Trello board.
Only owner or members can access a board.

2.1 Get My Boards

URL: /api/boards
Method: GET
Auth: ✅ Required

Returns all boards where the user is the owner or a member.

Response:

{
  "success": true,
  "data": [
    {
      "_id": "board_id",
      "title": "Project Alpha",
      "owner": "user_id",
      "members": ["user_id_2"],
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}


⸻

2.2 Create Board

URL: /api/boards
Method: POST
Auth: ✅ Required

Request Body:

{
  "title": "New Board"
}

Response:

{
  "success": true,
  "data": {
    "_id": "board_id",
    "title": "New Board",
    "owner": "current_user_id",
    "members": [],
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
}


⸻

2.3 Get Single Board (with Columns & Tasks)

URL: /api/boards/:boardId
Method: GET
Auth: ✅ Required

Response:

{
  "success": true,
  "data": {
    "board": {
      "_id": "board_id",
      "title": "Project Alpha",
      "owner": "user_id",
      "members": ["user_id_2"],
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T00:00:00.000Z"
    },
    "columns": [
      {
        "_id": "column_id_1",
        "boardId": "board_id",
        "title": "To Do",
        "position": 0,
        "createdAt": "2025-01-01T00:00:00.000Z",
        "updatedAt": "2025-01-01T00:00:00.000Z"
      }
    ],
    "tasks": [
      {
        "_id": "task_id_1",
        "boardId": "board_id",
        "columnId": "column_id_1",
        "title": "Set up project",
        "description": "Initialize repo and configs",
        "position": 0,
        "assignee": "user_id",
        "createdAt": "2025-01-01T00:00:00.000Z",
        "updatedAt": "2025-01-01T00:00:00.000Z"
      }
    ]
  }
}


⸻

2.4 Update Board

URL: /api/boards/:boardId
Method: PATCH
Auth: ✅ Required (owner or member)

Request Body (example):

{
  "title": "Updated Board Name"
}

Response:

{
  "success": true,
  "data": {
    "_id": "board_id",
    "title": "Updated Board Name",
    "owner": "user_id",
    "members": ["user_id_2"],
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-02T00:00:00.000Z"
  }
}


⸻

2.5 Delete Board

URL: /api/boards/:boardId
Method: DELETE
Auth: ✅ Required (owner only, ideally)

Response:

{
  "success": true,
  "data": null
}

Deleting a board should also delete its columns and tasks.

⸻

3. Column APIs

A column belongs to a board (e.g., “To Do”, “In Progress”, “Done”).

3.1 Create Column

URL: /api/boards/:boardId/columns
Method: POST
Auth: ✅ Required

Request Body:

{
  "title": "To Do"
}

Response:

{
  "success": true,
  "data": {
    "_id": "column_id",
    "boardId": "board_id",
    "title": "To Do",
    "position": 0,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
}


⸻

3.2 Update Column

URL: /api/columns/:columnId
Method: PATCH
Auth: ✅ Required

Request Body (example):

{
  "title": "In Progress"
}

Response:

{
  "success": true,
  "data": {
    "_id": "column_id",
    "boardId": "board_id",
    "title": "In Progress",
    "position": 0,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-02T00:00:00.000Z"
  }
}


⸻

3.3 Delete Column

URL: /api/columns/:columnId
Method: DELETE
Auth: ✅ Required

Response:

{
  "success": true,
  "data": null
}

Deleting a column should also delete all tasks in that column.

⸻

3.4 Reorder Columns

URL: /api/boards/:boardId/columns/reorder
Method: PATCH
Auth: ✅ Required

Request Body:

{
  "orderedColumnIds": ["col_id_1", "col_id_3", "col_id_2"]
}

	•	The backend updates each column’s position based on the array order (index).

Response:

{
  "success": true,
  "data": {
    "boardId": "board_id",
    "orderedColumnIds": ["col_id_1", "col_id_3", "col_id_2"]
  }
}


⸻

4. Task APIs

A task (card) belongs to a column.

4.1 Create Task

URL: /api/boards/:boardId/tasks
Method: POST
Auth: ✅ Required

Request Body:

{
  "columnId": "column_id",
  "title": "Implement drag & drop",
  "description": "Use react-beautiful-dnd"
}

Response:

{
  "success": true,
  "data": {
    "_id": "task_id",
    "boardId": "board_id",
    "columnId": "column_id",
    "title": "Implement drag & drop",
    "description": "Use react-beautiful-dnd",
    "position": 0,
    "assignee": null,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
}


⸻

4.2 Update Task

URL: /api/tasks/:taskId
Method: PATCH
Auth: ✅ Required

Request Body (any subset):

{
  "title": "Implement DnD",
  "description": "Updated description",
  "assignee": "user_id"
}

Response:

{
  "success": true,
  "data": {
    "_id": "task_id",
    "boardId": "board_id",
    "columnId": "column_id",
    "title": "Implement DnD",
    "description": "Updated description",
    "position": 0,
    "assignee": "user_id",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-02T00:00:00.000Z"
  }
}


⸻

4.3 Delete Task

URL: /api/tasks/:taskId
Method: DELETE
Auth: ✅ Required

Response:

{
  "success": true,
  "data": null
}


⸻

4.4 Reorder Tasks (Drag & Drop)

Used when a task is moved within a column or to another column.

URL: /api/boards/:boardId/tasks/reorder
Method: PATCH
Auth: ✅ Required

Request Body:

{
  "taskId": "task_id_1",
  "source": {
    "columnId": "column_id_A",
    "position": 0
  },
  "destination": {
    "columnId": "column_id_B",
    "position": 2
  }
}

Backend should:
	•	If source.columnId === destination.columnId:
	•	Reorder within the same column.
	•	Else:
	•	Remove task from source column order.
	•	Insert task in destination column order.
	•	Update task.columnId.

Response:

{
  "success": true,
  "data": {
    "taskId": "task_id_1",
    "source": {
      "columnId": "column_id_A",
      "position": 0
    },
    "destination": {
      "columnId": "column_id_B",
      "position": 2
    }
  }
}


⸻

5. Real-Time (Socket.IO) Events (High-Level)

These are not HTTP endpoints, but events emitted over Socket.IO.

5.1 Client → Server
	•	join_board
	•	Payload:

{ "boardId": "board_id" }


	•	Joins room: board:<boardId>

(You can keep mutations via REST and just use Socket.IO for broadcasting.)

⸻

5.2 Server → Client Events

Emitted after successful DB updates in controllers.

Column Events
	•	column_created
	•	column_updated
	•	column_deleted
	•	columns_reordered

Example payload:

{
  "boardId": "board_id",
  "column": {
    "_id": "column_id",
    "title": "To Do",
    "position": 0
  }
}

Task Events
	•	task_created
	•	task_updated
	•	task_deleted
	•	tasks_reordered

Example payload:

{
  "boardId": "board_id",
  "task": {
    "_id": "task_id",
    "columnId": "column_id",
    "title": "Implement drag & drop",
    "position": 0
  }
}


⸻

6. Error Codes

Common HTTP status codes:
	•	400 Bad Request – invalid data
	•	401 Unauthorized – missing/invalid token
	•	403 Forbidden – user not owner/member of board
	•	404 Not Found – board/column/task not found
	•	500 Internal Server Error – server error

Example error response:

{
  "success": false,
  "message": "Board not found"
}


⸻

7. Notes
	•	All timestamps are in ISO 8601 format (UTC).
	•	position fields are integers used to sort columns and tasks.
	•	Ownership & membership logic can be extended later (invites, roles, etc.).