# Mini Kanban Frontend

Next.js + React + JavaScript + Tailwind CSS + dnd-kit frontend for the Mini Kanban Board assessment.

## Setup

```bash
npm install
copy .env.local.example .env.local
npm run dev
```

Set `NEXT_PUBLIC_API_URL` to the backend API root. For the current Express backend:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Open `http://localhost:3000`.

## Backend integration

The frontend uses the existing backend routes:

- `/users`
- `/boards`
- `/board-members`
- `/columns`
- `/tasks`

Refresh-token requests use `credentials: include`, so the HTTP-only refresh cookie can be sent to the Express server.

## Important backend CORS

Because the frontend and backend run on different ports, the backend must allow `http://localhost:3000` and credentials. Example:

```js
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(cookieParser());
```

Do not use `origin: "*"` with credentials.
