# Manny's Painting Company

Production website and customer management platform for [Manny's Painting Company](https://mannyspaintingcompany.com), a family-owned painting contractor serving New York City and the Tri-State area.

The application gives customers a professional way to explore services, view project work, read reviews, and request quotes with photo uploads. Internally, it provides a secure admin portal for managing leads, reviews, and business activity.

Built with React and Vite on the frontend, Netlify Functions on the backend, MongoDB Atlas for data storage, and Cloudinary for secure file uploads.

---

## Features

### Public Website

- Responsive marketing website
- Services overview
- Project gallery
- Customer reviews
- Quote request form with file uploads
- Contact information
- Mobile responsive design

### Admin Dashboard

- Secure admin authentication
- Quote management
- Quote status updates
- Review moderation
- Dashboard analytics
- Activity tracking

### Backend

- Netlify Functions API
- MongoDB Atlas
- Cloudinary image uploads
- Email notifications

---

## Tech Stack

### Frontend

- React
- Vite
- CSS Modules

### Backend

- Netlify Functions
- MongoDB Atlas
- Cloudinary
- Nodemailer

### Deployment

- Netlify

---

## Local Development

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev:netlify
```

This project should be run using **Netlify Dev** because it depends on Netlify Functions for quotes, reviews, uploads, authentication, and admin features. Running `npm run dev` alone will not provide the serverless API layer.

The application is typically available at:

```
http://localhost:8888
```

---

## Environment Variables

Configure these in Netlify or a local `.env` file. Do not commit secret values to Git.

### Database

- `MONGODB_URI`
- `MONGODB_DB`

### Cloudinary

- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `CLOUDINARY_FOLDER`

### Admin Authentication

- `ADMIN_USERNAME`
- `ADMIN_PASSWORD_HASH`
- `ADMIN_JWT_SECRET`

### Email (SMTP)

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `ADMIN_NOTIFY_EMAILS`
- `NOTIFY_EMAIL_FROM_NAME`
- `CLIENT_CONFIRM_ENABLED`
- `CLIENT_CONFIRM_SUBJECT`

### Reviews

- `REVIEW_TOKEN_SECRET`
- `REVIEW_TOKEN_TTL_DAYS`
- `REVIEW_EMAIL_ENABLED`
- `REVIEW_EMAIL_SUBJECT`
- `PUBLIC_SITE_URL`

---

## Project Structure

```
mannyspaintcompany/
├── netlify/
│   └── functions/          # Serverless API (quotes, reviews, admin, uploads)
├── public/                 # Static assets
├── src/
│   ├── components/         # Shared UI (Navbar, Footer, QuoteForm, etc.)
│   ├── data/               # Shared public content (gallery project data)
│   ├── lib/                # Frontend helpers (admin auth utilities)
│   ├── pages/              # Route-level pages (public + admin)
│   ├── styles/             # Global CSS and design tokens
│   ├── App.jsx             # Application routing
│   └── main.jsx            # React entry point
├── netlify.toml            # Netlify build, functions, and redirects
├── package.json
└── vite.config.js
```

### Key Public Routes

| Route | Purpose |
|---|---|
| `/` | Homepage |
| `/gallery` | Project gallery |
| `/reviews` | Approved customer reviews |
| `/review/:quoteId` | Secure review submission link |

### Key Admin Routes

| Route | Purpose |
|---|---|
| `/admin/login` | Admin authentication |
| `/admin` | Quote management |
| `/admin/reviews` | Review moderation |
| `/admin/dashboard` | Business analytics |
| `/admin/activity` | Activity log |

---

## Current Status

The **Public Site Polish** milestone has been completed.

Recent work includes:

- Homepage redesign with hero, services, differentiators, quote section, and reviews
- Production-ready public copy and Tri-State service area messaging
- SVG service icons and improved services card hierarchy
- Recent Projects preview section on the homepage
- Reviews section with loading skeleton and empty state
- Quote form styling aligned with the public site design system
- Expanded professional footer with navigation and contact details
- Improved typography, spacing, and tablet/mobile responsiveness
- Shared gallery project data prepared for real client photos

The admin dashboard, Netlify Functions, quote workflow, review workflow, and upload pipeline remain stable and unchanged during this milestone.

---

## Roadmap

Upcoming milestones:

- **Branding & Assets** — Logo, favicon, real project photography, and visual identity refinements
- **SEO & Marketing** — Meta tags, search optimization, and launch-ready marketing content
- **UX Polish** — Navigation improvements, form success states, and interaction refinements
- **Customer Experience** — Testimonials, content expansion, and stronger trust signals
- **Production Readiness** — Performance, accessibility, security review, and final launch QA

---

## Author

**Stephanie Olivares**

Developed for Manny's Painting Company / SOLINYC LLC.
