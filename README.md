# 📚 CourseMart – Online Course Marketplace

CourseMart is a modern online course marketplace built with **Angular 20** and **Firebase**.  
It allows **students** to buy and consume courses, **professors/sellers** to upload and sell their knowledge, and **administrators** to manage the platform.  

This project is for **educational purposes** – the goal is to learn how to:  
- Work with different data types (videos, PDFs, metadata).  
- Implement real-world features like authentication, file uploads, and e-commerce transactions.  
- Integrate frontend (Angular) with a serverless backend (Firebase + Stripe).  

---

## ✨ Features

### 🔑 Authentication & Roles
- Email/password login via Firebase Auth  
- Role-based access control (Student, Seller, Admin)  
- Admin can promote/demote user roles  

### 🎓 Course Management
- Sellers can create, edit, and publish courses  
- Upload videos and documents (PDFs) to Firebase Storage  
- Organize courses into modules and lessons  
- Submit courses for admin review before publishing  

### 🛒 Marketplace & Transactions
- Public catalog with search and filters  
- Course detail page with previews  
- Add to cart and checkout  
- Stripe test-mode integration for payments (simulated but realistic)  
- Order history for students  

### 📖 Learning Experience
- "My Courses" student library  
- Video player (Video.js) integration  
- PDF viewer (PDF.js)  
- Track progress across lessons  
- Reviews & ratings  

### 🛠️ Admin Console
- Manage users (promote/demote roles)  
- Approve or reject pending courses  
- Moderate reviews  

---

## 🏗️ Tech Stack

### Frontend
- [Angular 20](https://angular.dev/) – standalone components, Angular Material  
- [RxJS](https://rxjs.dev/) – state management  
- [AngularFire](https://github.com/angular/angularfire) – Firebase SDK for Angular  

### Backend (Serverless)
- [Firebase Auth](https://firebase.google.com/products/auth) – authentication & roles  
- [Cloud Firestore](https://firebase.google.com/products/firestore) – NoSQL database  
- [Firebase Storage](https://firebase.google.com/products/storage) – file & video uploads  
- [Firebase Functions](https://firebase.google.com/products/functions) – serverless backend logic  
- [Stripe](https://stripe.com/docs/payments/checkout) (test mode) – transaction simulation  

### Media
- [Video.js](https://videojs.com/) – video playback  
- [PDF.js](https://mozilla.github.io/pdf.js/) – PDF viewer  

---

## 🚀 Getting Started

### 1. Clone Repository
```bash
git clone https://github.com/YOUR_USERNAME/coursemart.git
cd coursemart
