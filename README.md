# Job Application Tracker

A kanban-style job application tracker to organize and manage your job search in one place.

**Live app → [job-application-tracker-dusky-one.vercel.app](https://job-application-tracker-dusky-one.vercel.app)**

---

## Features

- Kanban board to track applications across custom stages
- Drag and drop to move applications between columns
- Create, edit, and delete job applications
- Secure authentication (sign up / sign in)
- Data persisted per user account

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Database:** MongoDB (Mongoose)
- **Auth:** Better Auth
- **UI:** Tailwind CSS, shadcn/ui, Radix UI
- **Drag & Drop:** dnd-kit
- **Deployment:** Vercel

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/Sajad1-0/Job-application-tracker-nextjs.git
cd job-application-tracker
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root:

```env
MONGODB_URI=your_mongodb_connection_string
BETTER_AUTH_SECRET=your_random_secret
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deployment

This app is deployed on Vercel. Make sure to set all four environment variables in your Vercel project settings, and allow all IPs in your MongoDB Atlas network access settings.
