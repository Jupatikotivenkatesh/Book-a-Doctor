# Book a Doctor — Deployment Guide

## Stack
| Layer    | Service         | URL pattern                              |
|----------|-----------------|------------------------------------------|
| Frontend | Vercel          | `https://book-a-doctor.vercel.app`       |
| Backend  | Render          | `https://book-a-doctor-api.onrender.com` |
| Database | MongoDB Atlas   | `cluster0.xxxxx.mongodb.net`             |

---

## 1. MongoDB Atlas Setup

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com) → Create a free cluster
2. **Database Access** → Add Database User (username + strong password)
3. **Network Access** → Add IP Address → `0.0.0.0/0` (allow all, required for Render)
4. **Connect** → Connect your application → Copy the connection string
5. Replace `<password>` with your DB user password in the connection string
6. Add `book-a-doctor` as the database name in the URI:
   ```
   mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/book-a-doctor?retryWrites=true&w=majority
   ```

---

## 2. Create Admin User

After first deployment, register normally then run in MongoDB Atlas → Collections:
```js
db.users.updateOne(
  { email: "admin@yourdomain.com" },
  { $set: { role: "admin" } }
)
```

---

## 3. Backend Deployment (Render)

1. Push code to GitHub
2. Go to [render.com](https://render.com) → New → Web Service
3. Connect your GitHub repo → select the **root** directory or set:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: Node
   - **Plan**: Free

4. Add Environment Variables in Render Dashboard:

| Variable      | Value                                              |
|---------------|----------------------------------------------------|
| `NODE_ENV`    | `production`                                       |
| `PORT`        | `5000`                                             |
| `MONGO_URI`   | Your Atlas connection string                       |
| `JWT_SECRET`  | A 64-char random hex string                        |
| `JWT_EXPIRE`  | `7d`                                               |
| `EMAIL_HOST`  | `smtp.gmail.com`                                   |
| `EMAIL_PORT`  | `587`                                              |
| `EMAIL_USER`  | Your Gmail address                                 |
| `EMAIL_PASS`  | Your Gmail App Password (16 chars, no spaces)      |
| `CLIENT_URL`  | `https://book-a-doctor.vercel.app`                 |

5. Deploy → wait for build to succeed
6. Test: `https://your-render-url.onrender.com/api/health`

> **Note**: Free Render instances spin down after 15 min of inactivity and take ~30s to wake.

---

## 4. Frontend Deployment (Vercel)

1. Go to [vercel.com](https://vercel.com) → New Project → Import Git Repository
2. Select your repo → Set:
   - **Framework Preset**: Vite
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

3. Add Environment Variables in Vercel Dashboard:

| Variable        | Value                                              |
|-----------------|----------------------------------------------------|
| `VITE_API_URL`  | `https://your-render-app.onrender.com/api`         |

4. Deploy → Vercel auto-detects Vite and configures SPA routing via `vercel.json`

---

## 5. Gmail App Password Setup

1. Enable 2-Factor Authentication on your Google account
2. Go to: [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
3. App: `Mail` → Device: `Other (custom name)` → `Book a Doctor`
4. Copy the 16-character password (remove spaces) → use as `EMAIL_PASS`

---

## 6. Post-Deployment Checklist

### Backend
- [ ] `GET /api/health` returns `{ status: "OK" }`
- [ ] `POST /api/auth/register` works
- [ ] `POST /api/auth/login` returns JWT
- [ ] MongoDB Atlas shows new documents after registration
- [ ] Email notification received on registration (check spam)
- [ ] Uploaded files served from `/uploads/...`

### Frontend
- [ ] Landing page loads on Vercel URL
- [ ] Register → Login → redirect to dashboard
- [ ] Browse doctors page loads (calls `/api/doctors`)
- [ ] Book appointment form submits successfully
- [ ] File upload works (max 10MB, PDF/JPG/PNG)
- [ ] Notifications appear in-app and via email
- [ ] Admin can approve/reject doctors
- [ ] Doctor can approve/reject/complete appointments
- [ ] Mobile responsive on iOS Safari / Android Chrome

### Security
- [ ] `.env` is NOT committed to git (check `.gitignore`)
- [ ] `JWT_SECRET` is a long random string (not the example value)
- [ ] MongoDB Atlas network access restricted to known IPs in production (optional)
- [ ] HTTPS enforced on both Vercel and Render (automatic)

---

## 7. Local Development

```bash
# Terminal 1 — Backend
cd server
cp .env.example .env        # Fill in your values
npm install
npm run dev                 # Runs on http://localhost:5000

# Terminal 2 — Frontend
cd client
npm install
npm run dev                 # Runs on http://localhost:5173
```

---

## 8. File Storage Note

Multer currently saves files to `server/uploads/`. This works for local dev and Render **persistent disk** (paid tier). For the **free Render tier**, the filesystem is ephemeral — files are lost on restart.

**Production recommendation**: Replace Multer disk storage with cloud storage:
- [Cloudinary](https://cloudinary.com) — free tier, easy setup
- [AWS S3](https://aws.amazon.com/s3/) — reliable, pay-per-use
- [Supabase Storage](https://supabase.com) — free tier

The `uploadMiddleware.js` storage engine would need to change from `diskStorage` to the cloud SDK.

---

## 9. Environment Variable Summary

### server/.env (development)
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_64_char_secret
JWT_EXPIRE=7d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=you@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx
CLIENT_URL=http://localhost:5173
```

### client/.env (development)
```env
VITE_API_URL=http://localhost:5000/api
```

### client/.env.production (or Vercel dashboard)
```env
VITE_API_URL=https://your-render-app.onrender.com/api
```
