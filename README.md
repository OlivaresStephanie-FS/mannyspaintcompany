# Manny’s Painting Company — Contractor Quote & Review Platform

![React](https://img.shields.io/badge/React-18-blue?logo=react)
![Vite](https://img.shields.io/badge/Vite-5-purple?logo=vite)
![Netlify](https://img.shields.io/badge/Netlify-Functions-00C7B7?logo=netlify)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb)
![Cloudinary](https://img.shields.io/badge/Cloudinary-Media%20Storage-3448C5?logo=cloudinary)
![License](https://img.shields.io/badge/license-MIT-blue)

A production-ready contractor platform built for a real painting business. It allows customers to request service quotes, upload project photos, and submit post-job reviews, while giving the business a secure admin dashboard to manage leads, monitor quote activity, and moderate public feedback.

This project turns a traditional contractor workflow built around phone calls, text messages, and email into a structured web-based operations system with a scalable serverless backend.

---

## 🚀 Live Platform

🌐 https://mannyspaintingcompany.com

---

## 📸 Screenshots

### Homepage

![Homepage](./screenshots/home.png)

### Admin Dashboard

![Admin Dashboard](./screenshots/admin-dashboard.png)

### Reviews Page

![Reviews Page](./screenshots/reviews-page.png)

> Replace the screenshot file names above with your actual image file names if they differ.

---

## 🧰 Tech Stack

### Frontend

- React
- Vite
- React Router
- CSS
- Responsive component-based architecture

### Backend

- Netlify Functions
- Node.js
- MongoDB Atlas
- JWT authentication

### Infrastructure

- Cloudinary for secure image uploads
- Nodemailer for email notifications
- Netlify environment variables
- Netlify secrets scanning

---

## ✨ Features

### Public Website

- Service-focused contractor website
- Quote request form
- Project gallery
- Public reviews page
- Responsive layout across desktop and mobile

### Quote Request System

Customers can submit quote requests with:

- Name and contact information
- Service type
- Project description
- Photo uploads for project evaluation

Uploaded images are securely sent through Cloudinary signed uploads, and quote data is stored in MongoDB Atlas.

After submission:

- Admin notification email is sent
- Optional customer confirmation email is sent

### Admin Dashboard

Secure admin tools allow the business to manage incoming quote requests and review activity.

Features include:

- Admin login with JWT authentication
- Protected admin routes
- Quote list with pagination
- Thumbnail previews for uploaded images
- Quote detail management
- Status update workflow

Supported quote statuses:

- `new`
- `contacted`
- `scheduled`
- `completed`
- `archived`

### Customer Review System

After a project is completed, customers can submit a review through a secure review link.

Review form supports:

- 1–5 star rating
- Optional written feedback
- Optional customer name
- Associated service type

New reviews are saved with a default moderation state of:

- `pending`

### Review Moderation

Admins can manage submitted reviews through the protected reviews dashboard.

Supported review statuses:

- `pending`
- `approved`
- `rejected`

Only approved reviews are shown on the public reviews page.

---

## 🏗 Architecture

This project uses a modern serverless architecture.

```text
Customer
  │
  ▼
React Frontend (Netlify)
  │
  ▼
Netlify Functions (Serverless API)
  │
  ▼
MongoDB Atlas
  │
  ├── quotes collection
  └── reviews collection

Cloudinary
  └── secure image storage
Quote Submission Flow
Customer
  ▼
React Quote Form
  ▼
Cloudinary Signed Upload
  ▼
Netlify Function
  ▼
MongoDB Atlas
  ▼
Admin Notification Email
Review Workflow
Completed Job
  ▼
Secure Review Link
  ▼
Customer Review Form
  ▼
MongoDB Atlas (pending)
  ▼
Admin Moderation
  ▼
Public Reviews Page
🔐 Security

Security protections included in this project:

JWT-based admin authentication

Protected admin endpoints

Server-side validation

Environment variable protection

Netlify secrets scanning

.env excluded from Git

Controlled review moderation before public display

Admin API requests use:

Authorization: Bearer <JWT>
📁 Project Structure
mannyspaintcompany
│
├── netlify
│   └── functions
│       ├── admin-login.js
│       ├── admin-quotes.js
│       ├── admin-reviews.js
│       ├── admin-update-quote-status.js
│       ├── admin-update-review-status.js
│       ├── cloudinary-sign.js
│       ├── public-reviews.js
│       ├── public-submit-review.js
│       └── quote.js
│
├── screenshots
│   ├── home.png
│   ├── admin-dashboard.png
│   └── reviews-page.png
│
├── src
│   ├── components
│   │   ├── Footer.jsx
│   │   ├── Navbar.jsx
│   │   └── Review.jsx
│   │
│   ├── lib
│   │   └── adminAuth.js
│   │
│   ├── pages
│   │   ├── AdminLogin.jsx
│   │   ├── AdminQuotes.jsx
│   │   ├── AdminReviews.jsx
│   │   ├── Gallery.jsx
│   │   ├── Home.jsx
│   │   └── Reviews.jsx
│   │
│   ├── App.jsx
│   └── main.jsx
│
├── netlify.toml
├── package.json
└── vite.config.js
⚙️ Environment Variables

Required production environment variables:

MONGODB_URI=
MONGODB_DB=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_FOLDER=

ADMIN_USERNAME=
ADMIN_PASSWORD_HASH=
ADMIN_JWT_SECRET=

SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=

ADMIN_NOTIFY_EMAILS=
CLIENT_CONFIRM_ENABLED=
CLIENT_CONFIRM_SUBJECT=

REVIEW_TOKEN_SECRET=
REVIEW_TOKEN_TTL_DAYS=
PUBLIC_SITE_URL=
💻 Local Development

Run the project locally with the Netlify development server:

netlify dev --functions netlify/functions

Local development runs at:

http://localhost:8888
🚀 Deployment

This project is deployed on Netlify using a serverless architecture.

Deployment includes:

GitHub-connected automatic builds

Netlify Functions deployment

Environment variable management

HTTPS by default

Production domain support

💼 Why This Project Matters

Many small service businesses still rely on fragmented manual processes to manage customer inquiries, project photos, and post-job follow-up. This platform demonstrates how a local contractor business can be upgraded into a structured digital system with:

standardized lead intake

image-based project evaluation

admin-side quote management

moderated customer reviews

scalable cloud-based infrastructure

It is both a real business tool and a strong example of practical full-stack application development.

📬 Contact

If you'd like to discuss the project, collaborate, or connect professionally:

📧 soli@soli.nyc

🔗 LinkedIn: https://www.linkedin.com/in/solinyc

💻 GitHub: https://github.com/OlivaresStephanie-FS

👩‍💻 Author

Stephanie Olivares

Full-Stack Developer building modern, real-world business systems with React, Node.js, MongoDB, and serverless architecture.
```
