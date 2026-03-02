# Manny’s Painting Company — Full Stack System

A production-ready full-stack painting company website built with:

- React (Vite)
- Netlify Functions (serverless backend)
- MongoDB
- Token-Protected Admin Panels
- Review Moderation System

---

## 🌐 Live Features

### 🏠 Home Page

- Hero section
- Services overview
- Quote request form
- Smooth scroll behavior

### 🖼 Gallery Page

- Project showcase layout

### ⭐ Public Review Submission

- 1–5 star rating system
- Optional written review
- Optional name field
- Character counter
- Submits securely to backend
- Reviews default to `pending` status

---

## 🔐 Admin Features

### Admin Quotes Panel

Route: `/admin`

- Bearer token authentication
- View submitted quotes
- Pagination
- Secure Netlify function access

### Admin Reviews Panel

Route: `/admin/reviews`

- Bearer token authentication
- Token persisted in localStorage
- Status filtering:
    - Pending
    - Approved
    - Rejected
    - All
- Approve / Reject / Set Pending controls
- Pagination
- Secure review moderation

---

## 🔑 Authentication Model

Admin panels require:

```
Authorization: Bearer <ADMIN_TOKEN>
```

Each Netlify function verifies:

```js
process.env.ADMIN_TOKEN;
```

If the token does not match:

- Returns `401 Unauthorized`

If the token matches:

- Returns protected data

---

## 🗂 Review Data Structure

Example review document:

```js
{
  _id: ObjectId,
  rating: 5,
  text: "Love my new floors!",
  name: "Stephanie",
  service: "Painting",
  status: "approved", // pending | approved | rejected
  submittedAt: Date
}
```

---

## 🧠 Review Moderation Flow

1. User submits review
2. Status defaults to `pending`
3. Admin loads `/admin/reviews`
4. Admin approves review
5. Status updates to `approved`
6. Approved reviews can be displayed publicly

---

## 📁 Netlify Functions

```
netlify/functions/
  submit-review.js
  admin-reviews.js
  admin-update-review-status.js
  submit-quote.js
  admin-quotes.js
```

---

## ⚙️ Environment Variables

Create a `.env` file in project root:

```
MONGODB_URI=your_mongodb_connection_string
ADMIN_TOKEN=your_secure_random_token
```

⚠ After modifying `.env`, restart:

```
netlify dev
```

---

## 🛠 Local Development

Start development server:

```
netlify dev --functions netlify/functions
```

App runs at:

```
http://localhost:8888
```

Admin routes:

- `/admin`
- `/admin/reviews`

---

## 🚀 Deployment Checklist

### 1️⃣ MongoDB

- Database created
- Connection string stored securely
- Optional: add indexes for performance

### 2️⃣ Netlify Setup

- Connect GitHub repository
- Build command:
    ```
    npm run build
    ```
- Publish directory:
    ```
    dist
    ```
- Functions directory:
    ```
    netlify/functions
    ```

### 3️⃣ Netlify Environment Variables

Add in Netlify dashboard:

```
MONGODB_URI
ADMIN_TOKEN
```

Must match local `.env`.

### 4️⃣ Admin Security Test

After deployment:

- Visit `/admin/reviews`
- Enter correct token
- Confirm:
    - No 401 errors
    - Reviews load
    - Status changes persist

### 5️⃣ Public Review Test

- Submit a review
- Confirm:
    - Appears in admin as `pending`
    - Can be approved
    - Displays publicly (if implemented)

---

## 🔒 Security Notes

- ADMIN_TOKEN should be:
    - Long
    - Random
    - Never committed to GitHub
- Do not expose ADMIN_TOKEN in frontend code
- All sensitive logic runs in Netlify Functions

---

## 📈 System Status

| Feature           | Status     |
| ----------------- | ---------- |
| Quote Submission  | ✅ Working |
| Review Submission | ✅ Working |
| Admin Auth        | ✅ Working |
| Review Moderation | ✅ Working |
| Status Filtering  | ✅ Working |
| Pagination        | ✅ Working |
| Token Persistence | ✅ Working |

---

## 🏁 Summary

This project includes:

- Secure serverless backend
- Token-protected admin panels
- Review moderation workflow
- Production-ready authentication pattern
- Clean React frontend with state-driven UI

The system is ready for real-world deployment and scalable enhancements.
