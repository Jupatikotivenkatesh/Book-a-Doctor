# Book a Doctor

A production-ready full-stack MERN application for booking doctor appointments.

## Tech Stack

| Layer      | Technology                                      |
|------------|-------------------------------------------------|
| Frontend   | React 18 (Vite), Redux Toolkit, Ant Design 5    |
| Backend    | Node.js, Express.js, MVC Architecture           |
| Database   | MongoDB Atlas, Mongoose ODM                     |
| Auth       | JWT + bcryptjs                                  |
| Uploads    | Multer (documents & profile pictures)           |
| Email      | Nodemailer (HTML templates)                     |
| Deployment | Vercel (client) + Render (server) + Atlas (DB)  |

## Workflow

```
Registration → Login → Browse Doctors → Book Appointment
→ Upload Documents → Doctor Approval → Notification
→ Consultation → Follow-up Summary
```

## Roles
- **Patient** — Browse, book, upload docs, view results
- **Doctor** — Approve/reject appointments, add consultation notes
- **Admin** — Approve doctors, manage users and appointments

## Project Structure

```
Book-A-Doctor/
├── client/                  # React (Vite) frontend
│   └── src/
│       ├── components/      # Shared UI components & layouts
│       ├── pages/           # Route-level pages
│       ├── redux/           # Redux Toolkit store + slices
│       └── services/        # Axios API service
└── server/                  # Node.js/Express backend
    ├── config/              # DB connection
    ├── controllers/         # Business logic (MVC)
    ├── middleware/          # Auth, error, upload middleware
    ├── models/              # Mongoose schemas
    ├── routes/              # Express routers
    └── utils/               # Token, email, notifications
```

## Getting Started

### 1. Server setup
```bash
cd server
npm install
# Edit .env with your MongoDB URI, JWT secret, email credentials
npm run dev
```

### 2. Client setup
```bash
cd client
npm install
npm run dev
```

### 3. Create admin user
After starting the server, POST to `/api/auth/register` then manually update the user's `role` field to `"admin"` in MongoDB Atlas.

## API Base URL
`http://localhost:5000/api`

## Environment Variables

### Server (.env)
| Variable       | Description                    |
|----------------|--------------------------------|
| MONGO_URI      | MongoDB Atlas connection string|
| JWT_SECRET     | JWT signing secret             |
| JWT_EXPIRE     | Token expiry (default: 7d)     |
| EMAIL_HOST     | SMTP host                      |
| EMAIL_PORT     | SMTP port                      |
| EMAIL_USER     | SMTP username                  |
| EMAIL_PASS     | SMTP password/app password     |
| CLIENT_URL     | Frontend URL (for CORS + emails)|

### Client (.env)
| Variable       | Description      |
|----------------|------------------|
| VITE_API_URL   | Backend API URL  |
"# Book-a-Doctor" 
