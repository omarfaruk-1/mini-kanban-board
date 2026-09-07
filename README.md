# Mini Kanban Board

A full-stack Kanban board app for managing boards, columns, and tasks, with drag and drop support.

## Live Application

Frontend: https://mini-kanban-board-xi.vercel.app

Backend API: https://mini-kanban-board-5dog.onrender.com

## Features

- User registration and login
- Token-based authentication
- Email verification
- Board creation and management
- Board sharing with registered users
- Owner and member access levels
- Access control on boards, columns, and tasks
- Column management
- Task management
- Drag and drop task movement
- Reorder tasks within the same column
- Move tasks between columns
- Move tasks to a specific position
- Task order is saved, not just visual

## Tech Stack

**Frontend**
- Next.js
- React
- JavaScript
- Tailwind CSS
- dnd-kit

**Backend**
- Node.js
- Express 5
- Prisma ORM 7 (with the Neon adapter)
- JWT (jsonwebtoken)
- bcryptjs
- cookie-parser
- cors
- nodemailer, for sending the verification emails
- dotenv

**Database**
- PostgreSQL
- Neon PostgreSQL, accessed through Prisma's Neon adapter

## Repository Structure

Both the frontend and backend live in the same repo.

```
mini-kanban-board/
├── backend/
│   ├── prisma/
│   │   ├── migrations/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── config/
│   │   │   ├── appConfig.js
│   │   │   └── mail.config.js
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── board.controller.js
│   │   │   ├── boardMember.controller.js
│   │   │   ├── column.controller.js
│   │   │   └── task.controller.js
│   │   ├── db/
│   │   │   └── db.js
│   │   ├── errors/
│   │   ├── middlewares/
│   │   │   └── auth.middleware.js
│   │   ├── routes/
│   │   │   ├── auth.route.js
│   │   │   ├── board.routes.js
│   │   │   ├── boardMember.routes.js
│   │   │   ├── column.controller.js
│   │   │   └── task.routes.js
│   │   ├── services/
│   │   ├── templates/
│   │   ├── units/
│   │   └── app.js
│   ├── .env
│   ├── package.json
│   ├── prisma7.config.ts
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── boards/
│   │   │   │   ├── [boardId]/
│   │   │   │   │   └── page.jsx
│   │   │   │   └── page.jsx
│   │   │   ├── login/
│   │   │   │   └── page.jsx
│   │   │   ├── register/
│   │   │   │   └── page.jsx
│   │   │   ├── verify-email/
│   │   │   │   └── page.jsx
│   │   │   ├── globals.css
│   │   │   ├── layout.jsx
│   │   │   └── page.jsx
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   │   ├── AuthShell.jsx
│   │   │   │   ├── LoginForm.jsx
│   │   │   │   └── RegisterForm.jsx
│   │   │   ├── board/
│   │   │   │   ├── BoardCard.jsx
│   │   │   │   ├── BoardForm.jsx
│   │   │   │   ├── BoardHeader.jsx
│   │   │   │   └── BoardMembers.jsx
│   │   │   ├── common/
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── EmptyState.jsx
│   │   │   │   ├── Input.jsx
│   │   │   │   ├── Modal.jsx
│   │   │   │   ├── Spinner.jsx
│   │   │   │   └── Textarea.jsx
│   │   │   └── kanban/
│   │   │       ├── KanbanBoard.jsx
│   │   │       ├── KanbanColumn.jsx
│   │   │       ├── TaskCard.jsx
│   │   │       └── TaskForm.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── hooks/
│   │   │   └── useAuth.js
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── auth.service.js
│   │   │   ├── board.service.js
│   │   │   ├── column.service.js
│   │   │   └── member.service.js
│   │   └── utils/
│   ├── .env.local.example
│   ├── jsconfig.json
│   ├── next.config.mjs
│   └── package.json
│
└── README.md
```

## Setup Requirements

Make sure you have these installed before running the project locally:

- Node.js 18 or later
- npm
- Git
- A PostgreSQL database (Neon works fine for this)

## Local Setup

### 1. Clone the repo

```bash
git clone <your-github-repository-url>
cd mini-kanban-board
```

### 2. Backend setup

```bash
cd backend
npm install
```

This pulls in Prisma as well, so there's no need to install it separately.

Create a `.env` file inside `backend/`:

```
PORT=5000

DATABASE_URL=your_neon_postgresql_connection_string

JWT_ACCESS_SECRET=your_access_token_secret
JWT_REFRESH_SECRET=your_refresh_token_secret

FRONTEND_URL=http://localhost:3000

NODE_ENV=development
```

Generate the Prisma client:

```bash
npx prisma generate
```

Run migrations:

```bash
npx prisma migrate dev
```

Start the server:

```bash
npm run dev
```

Backend runs at `http://localhost:5000`

### 3. Frontend setup

Open a new terminal:

```bash
cd frontend
npm install
```

Create a `.env.local` file inside `frontend/`:

```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Start it:

```bash
npm run dev
```

Frontend runs at `http://localhost:3000`

## Environment Variables

**Backend**
```
PORT=5000
DATABASE_URL=your_neon_postgresql_connection_string
JWT_ACCESS_SECRET=your_access_token_secret
JWT_REFRESH_SECRET=your_refresh_token_secret
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

**Frontend**
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Don't commit real secrets or database credentials to the repo.

## Authentication

Auth is token-based. Protected requests need:

```
Authorization: Bearer <access_token>
```

Refresh tokens are stored as HTTP-only cookies, not in local storage.

## Board Sharing and Access Control

Every board has an owner. The owner can share the board with other registered users.

A user can only access a board if they're either:
- the owner, or
- someone the owner has added to the board

Anyone else gets blocked from viewing or modifying that board's columns and tasks.

## Task Management

Tasks support:
- Create
- Update
- Delete
- Reorder within a column
- Move between columns
- Move to a specific position

Order is stored in the database, so it stays consistent after a refresh.

## Drag and Drop

Handled on the frontend with dnd-kit. Covers:
- Reordering tasks in the same column
- Moving tasks across columns
- Dropping a task into a specific position

## API Overview

**Auth** — `/api/users`
```
POST   /api/users/register
POST   /api/users/login
POST   /api/users/verify-email
POST   /api/users/resend-verification-email
POST   /api/users/refresh-token
POST   /api/users/logout
```

**Boards** — `/api/boards`
```
GET    /api/boards
GET    /api/boards/:boardId
POST   /api/boards
PATCH  /api/boards/:boardId
DELETE /api/boards/:boardId
```

**Board Members** — `/api/board-members`
```
POST   /api/board-members/:boardId
DELETE /api/board-members/:boardId/members/:userId
```

**Columns** — `/api/columns`
```
POST   /api/columns/:boardId
GET    /api/columns/:boardId
PATCH  /api/columns/columns/:columnId
DELETE /api/columns/columns/:columnId
```

**Tasks** — `/api/tasks`
```
POST   /api/tasks/:columnId
GET    /api/tasks/column/:columnId
GET    /api/tasks/:taskId
PATCH  /api/tasks/:taskId
DELETE /api/tasks/:taskId
PATCH  /api/tasks/:taskId/move
```

## Production Environment

**Frontend**
```
NEXT_PUBLIC_API_URL=https://mini-kanban-board-5dog.onrender.com/api
```

**Backend**
```
FRONTEND_URL=https://mini-kanban-board-xi.vercel.app
```

## Deployment

**Frontend** — hosted on Vercel
https://mini-kanban-board-xi.vercel.app

**Backend** — hosted on Render
https://mini-kanban-board-5dog.onrender.com

**Database** — Neon PostgreSQL

## Assessment Requirements

**Single repository**
Both `frontend/` and `backend/` are in this one repo.

**Setup instructions**
Covered above — required software, cloning the repo, backend and frontend installation, database config, Prisma setup, sample env variables, and local dev commands.

**Deployment**
A live version is up and running: https://mini-kanban-board-xi.vercel.app

## License

Built as a technical assessment project.