Nice, let’s lock in the frontend plan so you don’t have to “figure it out as you code” 😄
Here’s a complete FRONTEND_DOC.md you can drop in your repo.

⸻


# Kanban Frontend – Documentation

## 1. Overview

**Goal:**  
Build a Trello-like, real-time Kanban frontend using:

- **Framework:** Next.js (App Router, TypeScript)
- **Styling:** Tailwind CSS
- **Real-time:** Socket.IO client
- **Drag & Drop:** `react-beautiful-dnd`
- **Data Fetching / Caching:** TanStack Query (React Query)
- **Backend:** Consumes the APIs defined in `API_DOC.md`

---

## 2. Installation & Setup

### 2.1 Prerequisites

- **Node.js**: v18+ recommended
- **Package manager**: `npm` or `pnpm` or `yarn`
- Backend running locally at e.g. `http://localhost:5000`

### 2.2 Create Next.js App

From your project root:

```bash
npx create-next-app@latest client \
  --typescript \
  --tailwind \
  --eslint \
  --app

(or adjust the name if you want something else instead of client.)

This will create:

/kanban-app
  /client   <-- frontend
  /server   <-- backend (separate)

2.3 Install Dependencies

From /client:

cd client

# Drag & drop
npm install react-beautiful-dnd

# React Query
npm install @tanstack/react-query

# Socket.IO client
npm install socket.io-client

# Optional: Axios (for HTTP)
npm install axios

(Tweak if you prefer fetch instead of axios.)

⸻

3. Environment Variables

Create .env.local in /client:

NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000

NEXT_PUBLIC_* is required so Next.js exposes them to the browser.

⸻

4. Folder Structure

Recommended src structure:

/client
  /src
    /app
      layout.tsx         # Root layout
      page.tsx           # (Optional) home/landing or redirect

      /login
        page.tsx         # Login page

      /register
        page.tsx         # Register page

      /boards
        page.tsx         # Boards list page (user's boards)

        /[boardId]
          page.tsx       # Single board: columns + tasks (Kanban)

    /components
      /auth
        AuthForm.tsx

      /board
        BoardPage.tsx        # Composed UI for board page
        BoardHeader.tsx
        ColumnList.tsx
        Column.tsx
        TaskCard.tsx
        NewColumnForm.tsx
        NewTaskForm.tsx
        EmptyState.tsx

      /common
        Navbar.tsx
        ProtectedRoute.tsx (optional if you do client-side guard)
        Spinner.tsx
        ErrorMessage.tsx

    /hooks
      useAuth.ts
      useBoardSocket.ts
      useDragAndDrop.ts   (optional – or keep logic in BoardPage)

    /lib
      api.ts             # axios/fetch wrapper
      queryClient.ts     # React Query client
      socket.ts          # Socket.IO client setup
      auth.ts            # token helpers (get/set/remove JWT)
      types.ts           # shared TS types (Board, Column, Task, User)

    /styles
      globals.css
      (tailwind base config files)

You can adjust names, but the idea is:
	•	app/ – routing & page entry points.
	•	components/ – reusable UI building blocks.
	•	lib/ – API & utility logic.
	•	hooks/ – reusable logic (auth, sockets, etc).

⸻

5. Pages & UX Flow

5.1 /login – Login Page

Purpose:
	•	Allow existing users to log in.
	•	On success, store JWT and redirect to /boards.

UI:
	•	Simple form:
	•	Email
	•	Password
	•	Submit → POST /api/auth/login

Logic:
	1.	User submits form.
	2.	Call POST /auth/login.
	3.	If success:
	•	Save token:
	•	localStorage.setItem("token", token) (simple)
or
	•	HttpOnly cookies (more secure, more setup).
	•	Save user in React state (or React Query / context).
	•	router.push("/boards").

⸻

5.2 /register – Register Page

Purpose:
	•	Allow new users to sign up and get logged in immediately.

UI:
	•	Form:
	•	Name
	•	Email
	•	Password

Logic:
	1.	Call POST /auth/register.
	2.	On success, same as login:
	•	Store token.
	•	Redirect to /boards.

⸻

5.3 /boards – My Boards

Purpose:
	•	List all boards for current user.
	•	Allow creating a new board.
	•	Clicking a board opens /boards/[boardId].

Data:
	•	GET /api/boards

UI:
	•	Navbar (shows user name + logout button).
	•	List of board cards:
	•	Board title
	•	Small metadata (created date maybe).
	•	“Create board” button → inline input or modal:
	•	Calls POST /api/boards with { title }.

State Management (React Query):
	•	Query key: ["boards"]
	•	useQuery for fetching.
	•	useMutation for creating.
	•	On success: queryClient.invalidateQueries(["boards"]).

⸻

5.4 /boards/[boardId] – Board (Kanban View)

Purpose:
	•	Core Kanban experience:
	•	Show columns & tasks.
	•	Allow creating, editing, deleting tasks/columns.
	•	Drag & drop tasks within & across columns.
	•	Real-time updates via Socket.IO.

Data Loading:
	•	GET /api/boards/:boardId
Response contains:
	•	board
	•	columns
	•	tasks

State Structure (Frontend):

In React state (or derived from query):

type BoardState = {
  board: Board;
  columns: Column[];      // sorted by position
  tasksByColumnId: {
    [columnId: string]: Task[]; // each sorted by position
  };
};

You can derive tasksByColumnId from tasks array once on load.

Components:
	•	BoardPage.tsx
	•	Fetches data + sets up React Query + Socket.IO.
	•	Contains <DragDropContext onDragEnd={handleDragEnd}>.
	•	Renders <ColumnList />.
	•	ColumnList.tsx
	•	<Droppable droppableId="columns" direction="horizontal" type="COLUMN">
	•	Maps over columns and renders Column as Draggable.
	•	Column.tsx
	•	Shows column title.
	•	Edit/delete column actions.
	•	Contains inner <Droppable> for tasks.
	•	Renders TaskCard as Draggable.
	•	Includes NewTaskForm.
	•	TaskCard.tsx
	•	Shows task title + maybe assignee.
	•	Click could open a modal later for more details.
	•	NewColumnForm.tsx
	•	NewTaskForm.tsx

Drag & Drop (react-beautiful-dnd):

Setup:

import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";

<DragDropContext onDragEnd={handleDragEnd}>
  {/* Columns Droppable */}
  <Droppable droppableId="columns" direction="horizontal" type="COLUMN">
    {/* render columns as Draggable */}
  </Droppable>
</DragDropContext>

handleDragEnd logic:
	•	Structure of result:

type DropResult = {
  source: { droppableId: string; index: number };
  destination: { droppableId: string; index: number } | null;
  draggableId: string;
  type: "COLUMN" | "TASK";
};

	•	If !destination → user dropped outside; ignore.
	•	If type === "COLUMN":
	•	Reorder columns array locally.
	•	Call PATCH /api/boards/:boardId/columns/reorder with orderedColumnIds.
	•	If type === "TASK":
	•	Interpret source.droppableId & destination.droppableId as columnId.
	•	Do optimistic local reorder in tasksByColumnId.
	•	Call PATCH /api/boards/:boardId/tasks/reorder with:
	•	taskId, source, destination.

⸻

6. State Management & Data Layer

6.1 React Query Setup

Create src/lib/queryClient.ts:

import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient();

Wrap your app in layout.tsx:

// src/app/layout.tsx
"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "../lib/queryClient";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-50">
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </body>
    </html>
  );
}

(You might also use Hydrate if you later add server-side rendering + React Query.)

6.2 API Helper

src/lib/api.ts:

import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default api;

Use it in hooks/pages:

const { data } = useQuery({
  queryKey: ["boards"],
  queryFn: async () => {
    const res = await api.get("/boards");
    return res.data.data;
  },
});


⸻

7. Auth Handling & Protection

7.1 Token Storage

Simplest: localStorage
	•	On login/register success, do:

localStorage.setItem("token", token);

	•	On logout:

localStorage.removeItem("token");
router.push("/login");

7.2 Protected Routes

You have two approaches:

A) Client-side guard (simpler)
Create ProtectedRoute component:

// src/components/common/ProtectedRoute.tsx
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      router.replace("/login");
    } else {
      setChecked(true);
    }
  }, [router]);

  if (!checked) return null; // Or a spinner

  return <>{children}</>;
}

Use it in pages like /boards/page.tsx:

export default function BoardsPage() {
  return (
    <ProtectedRoute>
      {/* Actual boards UI */}
    </ProtectedRoute>
  );
}

B) Middleware (more advanced, optional)
You can later add Next.js middleware.ts to redirect unauthenticated users based on cookies or headers.

⸻

8. Real-Time with Socket.IO

8.1 Socket Client Setup

src/lib/socket.ts:

import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket() {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
      auth: (cb) => {
        if (typeof window !== "undefined") {
          const token = localStorage.getItem("token");
          cb({ token });
        } else {
          cb({});
        }
      },
    });
  }
  return socket;
}

8.2 useBoardSocket Hook

src/hooks/useBoardSocket.ts:

"use client";

import { useEffect } from "react";
import { getSocket } from "../lib/socket";

interface UseBoardSocketProps {
  boardId: string;
  onTaskCreated?: (task: any) => void;
  onTaskUpdated?: (task: any) => void;
  onTaskDeleted?: (payload: any) => void;
  onTasksReordered?: (payload: any) => void;
  onColumnCreated?: (column: any) => void;
  // ... etc
}

export function useBoardSocket({
  boardId,
  onTaskCreated,
  onTaskUpdated,
  onTaskDeleted,
  onTasksReordered,
  onColumnCreated,
}: UseBoardSocketProps) {
  useEffect(() => {
    const socket = getSocket();

    socket.emit("join_board", { boardId });

    if (onTaskCreated) {
      socket.on("task_created", ({ task }) => onTaskCreated(task));
    }

    if (onTaskUpdated) {
      socket.on("task_updated", ({ task }) => onTaskUpdated(task));
    }

    if (onTaskDeleted) {
      socket.on("task_deleted", onTaskDeleted);
    }

    if (onTasksReordered) {
      socket.on("tasks_reordered", onTasksReordered);
    }

    if (onColumnCreated) {
      socket.on("column_created", ({ column }) => onColumnCreated(column));
    }

    return () => {
      socket.off("task_created");
      socket.off("task_updated");
      socket.off("task_deleted");
      socket.off("tasks_reordered");
      socket.off("column_created");
      // (you can also emit leave if you implement it server-side)
    };
  }, [boardId, onTaskCreated, onTaskUpdated, onTaskDeleted, onTasksReordered, onColumnCreated]);
}

Use in /boards/[boardId]/page.tsx:
	•	When receiving events, update:
	•	Local state (e.g., setBoardState) or
	•	React Query cache (queryClient.setQueryData(["board", boardId], ...))

⸻

9. Types

Create shared types in src/lib/types.ts matching backend models:

export interface User {
  _id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface Board {
  _id: string;
  title: string;
  owner: string;
  members: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Column {
  _id: string;
  boardId: string;
  title: string;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  _id: string;
  boardId: string;
  columnId: string;
  title: string;
  description?: string;
  position: number;
  assignee?: string;
  createdAt: string;
  updatedAt: string;
}


⸻

10. Tailwind Styling Guidelines
	•	Use a simple layout:
	•	Navbar at top.
	•	Board page with horizontal scroll for columns.
	•	Cards with minimal shadows and rounded corners.

Example class patterns:
	•	Columns:

<div className="bg-slate-900 rounded-xl p-3 w-72 flex-shrink-0">


	•	Task cards:

<div className="bg-slate-800 rounded-lg p-3 mb-2 shadow-sm cursor-pointer">


	•	Board layout:

<div className="flex gap-4 overflow-x-auto h-[calc(100vh-80px)] p-4">



⸻

11. Implementation Milestones (Frontend)
	1.	Milestone 1 – Auth UI
	•	/login, /register
	•	Token storage
	•	Redirect to /boards
	2.	Milestone 2 – Boards Page
	•	Fetch & list boards
	•	Create board form
	3.	Milestone 3 – Board Page (No DnD)
	•	Fetch single board + columns + tasks
	•	Render static columns & tasks
	•	Forms to create columns & tasks
	4.	Milestone 4 – Drag & Drop
	•	Integrate react-beautiful-dnd
	•	Implement handleDragEnd
	•	Call reorder APIs
	5.	Milestone 5 – Real-Time
	•	Integrate Socket.IO
	•	Join board room
	•	Listen for task_* and column_* events
	•	Patch state / cache accordingly
	6.	Milestone 6 – Polish
	•	Loading states & error messages
	•	Better responsive design
	•	Small UX improvements (confirm dialogs, tooltips, etc.)

