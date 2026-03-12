# Manny’s Painting Company — Contractor Quote & Review Platform

A production-grade contractor operations platform that allows customers to request service quotes, upload project photos, and submit post-job reviews — while providing contractors with a secure admin dashboard to manage leads and customer feedback.

The platform replaces manual contractor workflows (phone calls, emails, spreadsheets) with a **structured digital pipeline for lead intake, job tracking, and reputation management**.

Built using a **modern serverless architecture** with Netlify Functions, MongoDB Atlas, and Cloudinary.

---

# 🚀 Live Platform

https://mannyspaintingcompany.com

---

# 🧰 Tech Stack

## Frontend

- React (Vite)
- React Router
- Component-driven architecture
- Responsive UI

## Backend

- Netlify Functions (serverless Node.js)
- MongoDB Atlas
- JWT authentication

## Infrastructure

- Cloudinary (secure image uploads)
- Nodemailer (SMTP email notifications)
- Netlify environment variables
- Netlify secrets scanning

---

# ✨ Core Features

## Quote Request System

Customers can submit painting project requests including:

- Contact information
- Service type
- Project description
- Photo uploads

Images upload securely through **Cloudinary signed uploads**, while quote data is stored in **MongoDB Atlas**.

After submission:

- Admin notification email is sent
- Optional client confirmation email is sent

---

# 🧑‍💼 Admin Quote Dashboard

Route:

/admin

Features:

- Secure JWT authentication
- Pagination for large datasets
- Image preview thumbnails
- Quote lifecycle management

Quote statuses:

new
contacted
scheduled
completed
archived

All updates are validated server-side and persisted to MongoDB.

---

# ⭐ Customer Review System

After a job is completed, customers can submit a review through a secure link.

Route:

/review/:quoteId

Review fields:

- 1–5 star rating
- Optional text feedback
- Optional name
- Associated service type

New reviews default to:

status: "pending"

---

# 🛡 Review Moderation

Admins moderate reviews through:

/admin/reviews

Moderation states:

pending
approved
rejected

Approved reviews appear on the public reviews page.

---

# 🌍 Public Reviews Page

Route:

/reviews

Displays approved customer reviews including:

- Star rating
- Review text
- Customer name
- Service type
- Submission date

Data is served through a **cached Netlify function** for performance.

---

# 🏗 Architecture Overview

React Frontend
│
▼
Netlify Functions (Serverless API)
│
▼
MongoDB Atlas
│
├── quotes collection
└── reviews collection

Image uploads are handled through **Cloudinary signed uploads**.

Admin operations are protected using **JWT authentication**.

---

# 🔐 Security Model

Admin endpoints require a JWT token.

Authorization: Bearer <JWT>

Tokens are issued by the admin login function and verified using:

ADMIN_JWT_SECRET

Security protections include:

- Server-side validation
- JWT verification
- Netlify environment variables
- Secrets scanning
- `.env` excluded from Git

---

# 📁 Project Structure

mannyspaintcompany
│
├── netlify
│   └── functions
│       ├── quote.js
│       ├── public-submit-review.js
│       ├── public-reviews.js
│       ├── admin-login.js
│       ├── admin-quotes.js
│       ├── admin-reviews.js
│       ├── admin-update-quote-status.js
│       ├── admin-update-review-status.js
│       └── cloudinary-sign.js
│
├── src
│   ├── components
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   └── Review.jsx
│   │
│   ├── pages
│   │   ├── Home.jsx
│   │   ├── Gallery.jsx
│   │   ├── Reviews.jsx
│   │   ├── AdminLogin.jsx
│   │   ├── AdminQuotes.jsx
│   │   └── AdminReviews.jsx
│   │
│   ├── lib
│   │   └── adminAuth.js
│   │
│   ├── App.jsx
│   └── main.jsx
│
├── netlify.toml
├── package.json
└── vite.config.js

---

# 💻 Local Development

Run the Netlify development server:

netlify dev --functions netlify/functions

Application runs at:

http://localhost:8888

---

# ⚙️ Environment Variables

Required production variables include:

MONGODB_URI
MONGODB_DB

CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
CLOUDINARY_FOLDER

ADMIN_USERNAME
ADMIN_PASSWORD_HASH
ADMIN_JWT_SECRET

SMTP_HOST
SMTP_PORT
SMTP_USER
SMTP_PASS

ADMIN_NOTIFY_EMAILS
CLIENT_CONFIRM_ENABLED
CLIENT_CONFIRM_SUBJECT

REVIEW_TOKEN_SECRET
REVIEW_TOKEN_TTL_DAYS
PUBLIC_SITE_URL

---

# 🚀 Deployment

Hosted on **Netlify using serverless functions**.

Deployment pipeline includes:

- Automatic builds from GitHub
- Environment variable management
- Secrets scanning protection
- HTTPS enabled by default

---

# 👩‍💻 Author

**Stephanie Olivares**

Full-Stack Developer building real-world operational platforms using modern serverless architecture.
