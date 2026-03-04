Manny’s Painting Company — Full-Stack Quote & Review Platform

A production-ready contractor website and operations platform built with React, Netlify Functions, MongoDB, and Cloudinary.

The system allows customers to request painting quotes, upload project photos, and leave reviews after job completion, while providing a secure admin dashboard for managing quotes and moderating reviews.

Built with a serverless architecture, secure JWT authentication, and a scalable backend designed for real-world business operations.

Tech Stack

Frontend

React (Vite)

React Router

Component-driven architecture

Backend

Netlify Functions (serverless Node.js)

MongoDB Atlas

JWT authentication

Infrastructure

Cloudinary (image storage)

Nodemailer (SMTP email notifications)

Netlify environment variables & secrets scanning

Core Features
Quote Request System

Customers can submit painting project requests including:

Contact information

Service type

Project description

Photo uploads

Images upload securely through Cloudinary signed uploads, while quote data is stored in MongoDB.

After submission:

Admin notification email is sent

Optional client confirmation email is sent

Admin Quote Dashboard

Route

/admin

Features

Secure JWT authentication

Pagination for large datasets

Image preview thumbnails

Quote status management

Allowed statuses

new
contacted
scheduled
completed
archived

All updates are validated server-side and persisted to MongoDB.

Customer Review System

After a job is completed, customers can submit a review through a secure link.

Route

/review/:quoteId

Review fields

1–5 star rating

Optional text feedback

Optional name

Associated service type

New reviews default to:

status: "pending"
Review Moderation

Admins moderate reviews in:

/admin/reviews

Moderation controls

pending
approved
rejected

Approved reviews appear on the public reviews page.

Public Reviews Page

Route

/reviews

Displays approved customer reviews including:

Star rating

Review text

Customer name

Service type

Submission date

Data is served through a cached Netlify function for performance.

Architecture Overview
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

Image uploads are handled by Cloudinary signed uploads.

All admin functionality is secured using JWT authentication.

Security Model

Admin endpoints require a JWT token.

Authorization: Bearer <JWT>

Tokens are issued by the admin login function and verified server-side using:

ADMIN_JWT_SECRET

Security protections include:

Server-side validation

JWT verification

Netlify environment variables

Secrets scanning

.env excluded from Git

Project Structure
mannyspaintcompany
│
├── netlify/functions
│ ├── quote.js
│ ├── public-submit-review.js
│ ├── public-reviews.js
│ ├── admin-login.js
│ ├── admin-quotes.js
│ ├── admin-reviews.js
│ ├── admin-update-quote-status.js
│ ├── admin-update-review-status.js
│ └── cloudinary-sign.js
│
├── src
│ ├── components
│ │ ├── Navbar.jsx
│ │ ├── Footer.jsx
│ │ └── Review.jsx
│ │
│ ├── pages
│ │ ├── Home.jsx
│ │ ├── Gallery.jsx
│ │ ├── Reviews.jsx
│ │ ├── AdminLogin.jsx
│ │ ├── AdminQuotes.jsx
│ │ └── AdminReviews.jsx
│ │
│ ├── lib
│ │ └── adminAuth.js
│ │
│ ├── App.jsx
│ └── main.jsx
│
├── netlify.toml
├── package.json
└── vite.config.js
Local Development

Run the Netlify dev server:

netlify dev --functions netlify/functions

App runs at:

http://localhost:8888
Environment Variables

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
Deployment

Hosted on Netlify using serverless functions.

Deployment pipeline includes:

Automatic builds from GitHub

Environment variable management

Secrets scanning protection

HTTPS enabled by default

System Status
Feature Status
Quote Submission Complete
Image Uploads Complete
Admin Quote Dashboard Complete
JWT Authentication Complete
Review Submission Complete
Review Moderation Complete
Public Reviews Page Complete
Serverless Backend Complete
Author

Stephanie Olivares

Full-stack developer building scalable web systems using modern serverless architecture.
Manny’s Painting Company — Contractor Quote & Review Platform

A production-grade full-stack contractor platform that allows customers to request service quotes, upload project photos, and submit post-job reviews — while providing contractors with a secure admin dashboard to manage leads and customer feedback.

Built with a modern serverless architecture, the system replaces manual contractor workflows (phone calls, email chains, and spreadsheets) with a structured digital pipeline for lead intake, job tracking, and reputation management.

The platform includes secure image uploads, automated email notifications, JWT-protected admin tools, and a moderated public review system — all deployed through a scalable serverless backend.

This project demonstrates how a traditional local service business can be transformed into a structured web application platform using modern cloud infrastructure.

Key Capabilities

Customer Lead Generation

Structured quote request form

Secure photo uploads for project evaluation

Automatic admin notification emails

Optional customer confirmation emails

Contractor Operations Dashboard

Secure admin authentication

Quote lifecycle management

Image previews and project details

Pagination for large quote datasets

Reputation Management System

Customer review submission after project completion

Admin moderation workflow

Public reviews page for social proof

Cloud-Native Architecture

Serverless backend using Netlify Functions

MongoDB Atlas database

Cloudinary secure image storage

Environment-based configuration and secrets management

Why This Project Matters

Many contractor businesses still rely on manual lead management and paper-based processes. This platform demonstrates how a simple service website can evolve into a fully operational digital management system.

Key improvements over traditional contractor workflows include:

Structured lead intake instead of phone/email requests

Photo-based project evaluation

Automated notifications

Digital job tracking

Controlled customer review publishing

The result is a scalable operational platform suitable for small service businesses.

Tech Stack
Frontend

React (Vite)

React Router

Component-driven architecture

Backend

Netlify Functions (Serverless Node.js)

MongoDB Atlas

JWT authentication

Infrastructure

Cloudinary (secure image storage)

Nodemailer (SMTP email notifications)

Netlify environment variables & secrets scanning

Architecture Overview
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

Images are securely uploaded through Cloudinary signed uploads, and admin operations are protected with JWT authentication.

💡 Developer: Stephanie Olivares
Full-stack developer focused on building real-world operational systems using modern serverless architecture.