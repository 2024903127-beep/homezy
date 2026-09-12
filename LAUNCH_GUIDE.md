# 🚀 Homezy v1.0.0 — Complete Launch & Free Hosting Guide

This guide explains how to host the complete Homezy platform **100% free** and generate standalone Android APKs for launch.

---

## 🏛️ System Architecture & Free Stack

| Component | Technology | Free Hosting Platform | Free Tier Benefits |
|---|---|---|---|
| **Database** | PostgreSQL | **Supabase** | 500MB database, pooled connections, direct table editor |
| **Backend API** | NestJS / Node 20 | **Render** or **Railway** | Free Web Service with automatic HTTPS & Git deploys |
| **Customer Website** | Next.js (App Router) | **Vercel** | Unlimited preview/production deployments, global CDN |
| **Admin Operations** | Next.js (App Router) | **Vercel** | Fast SSR, secure environment variables |
| **Consumer Mobile App** | React Native (Expo) | **Expo EAS Build** | Free cloud builds generating installable `.apk` files |
| **Partner Mobile App** | React Native (Expo) | **Expo EAS Build** | Free cloud builds generating installable `.apk` files |

---

## 📦 STEP 1: Push Monorepo to GitHub

1. Create a new repository on [GitHub](https://github.com/new) named `homezy` (private or public).
2. Run these commands from the `D:\Homezy` directory:
```bash
git remote add origin https://github.com/<your-username>/homezy.git
git branch -M main
git push -u origin main
```
*(All `.env` secrets and credentials are automatically ignored by our root `.gitignore`)*

---

## 🗄️ STEP 2: Setup Free Database on Supabase

1. Go to [database.new](https://database.new) (Supabase) and sign in.
2. Click **New Project**:
   - Name: `homezy`
   - Database Password: *(choose a strong password and save it)*
   - Region: `South Asia (Mumbai)` or nearest to India
3. Under **Project Settings** > **Database** > **Connection String**:
   - Select **URI** mode and copy the connection string. It looks like:
   ```env
   postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true
   ```
4. **Push Prisma Schema to Supabase**:
   On your local machine, open `homezy-backend/.env` and update `DATABASE_URL` with your Supabase connection string:
   ```bash
   cd homezy-backend
   npx prisma db push
   ```
5. **Create Your Master Admin in Supabase**:
   - In your Supabase Dashboard, open **Table Editor** > `admin_users` table.
   - Click **Insert Row**:
     - `id`: Leave auto / uuid
     - `email`: `your-email@gmail.com`
     - `name`: `Super Admin`
     - `role`: `SUPER_ADMIN`
     - `isActive`: `true`
     - `passwordHash`: Generate a bcrypt hash using:
       ```bash
       node -e "const b = require('bcrypt'); console.log(b.hashSync('YourSecurePassword123!', 10))"
       ```
       Paste the output hash into `passwordHash`.
     - Click **Save**.
   - Now you can sign into the Admin Portal using this email and password!

---

## 🌐 STEP 3: Deploy Backend on Render (Free)

1. Sign up on [render.com](https://render.com).
2. Click **New +** > **Web Service** > Connect your GitHub repository `homezy`.
3. Configure the service:
   - **Name:** `homezy-backend`
   - **Root Directory:** `homezy-backend`
   - **Runtime:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm run start:prod`
   - **Plan:** `Free`
4. In **Environment Variables**, add:
   ```env
   NODE_ENV=production
   PORT=4000
   DATABASE_URL=<Your Supabase PostgreSQL Connection String>
   JWT_SECRET=<64-char random hex string>
   CORS_ORIGINS=https://homezy.in,https://homezy-website.vercel.app,https://homezy-admin.vercel.app
   BREVO_API_KEY=<your-brevo-api-key>
   BREVO_SENDER_EMAIL=<your-sender-email>
   BREVO_SENDER_NAME=Homezy
   STORAGE_PROVIDER=r2
   R2_ACCOUNT_ID=<your-r2-account-id>
   R2_ACCESS_KEY_ID=<your-r2-access-key-id>
   R2_SECRET_ACCESS_KEY=<your-r2-secret-access-key>
   R2_BUCKET_NAME=home-service-storage
   R2_PUBLIC_DOMAIN=https://pub-a3be33960a904a3b9fa7b7a2617e8150.r2.dev
   ```
5. Click **Deploy Web Service**.
6. Once deployed, Render provides your live URL (e.g., `https://homezy-backend.onrender.com/v1`).

---

## 💻 STEP 4: Deploy Customer Website on Vercel (Free)

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub.
2. Click **Add New...** > **Project** > Import `homezy`.
3. In Project Configuration:
   - **Project Name:** `homezy-website`
   - **Framework Preset:** Next.js
   - **Root Directory:** Click **Edit** and choose `homezy-website`.
4. **Environment Variables**:
   ```env
   NEXT_PUBLIC_API_URL=https://homezy-backend.onrender.com/v1
   ```
5. Click **Deploy**.
6. Your live website is now accessible at `https://homezy-website.vercel.app`!

---

## 🛡️ STEP 5: Deploy Admin Portal on Vercel (Free)

1. In Vercel, click **Add New...** > **Project** > Import `homezy` again.
2. In Project Configuration:
   - **Project Name:** `homezy-admin`
   - **Framework Preset:** Next.js
   - **Root Directory:** Click **Edit** and choose `homezy-admin-next`.
3. **Environment Variables**:
   ```env
   NEXT_PUBLIC_API_URL=https://homezy-backend.onrender.com/v1
   ```
4. Click **Deploy**.
5. Your live admin console is now online at `https://homezy-admin.vercel.app`!

---

## 📱 STEP 6: Build Standalone Android APKs (Free)

You can build `.apk` files directly from Expo's free cloud infrastructure without installing Android Studio!

### Install EAS CLI:
```bash
npm install -g eas-cli
```

### Log in to Expo:
```bash
eas login
```
*(If you don't have an Expo account, create one free at [expo.dev](https://expo.dev))*

### 1. Build Consumer APK:
```bash
cd D:\Homezy\homezy-consumer
# Configure EAS project
eas init --id
# Build the APK using the preview profile configured in eas.json
EXPO_PUBLIC_API_URL=https://homezy-backend.onrender.com/v1 eas build -p android --profile preview
```
- EAS will build the app in the cloud.
- When finished, it gives you a direct link to download `Homezy.apk`!
- You can install this `.apk` directly on any Android device or share it via WhatsApp/Drive.

### 2. Build Partner APK:
```bash
cd D:\Homezy\homezy-partner
eas init --id
EXPO_PUBLIC_API_URL=https://homezy-backend.onrender.com/v1 eas build -p android --profile preview
```
- When finished, download `Homezy-Partner.apk`!

---

## 🔐 STEP 7: How Auth & Verification Work in Live Mode

1. **Customer & Partner Mobile App / Web Login**:
   - User enters their phone number and optional Gmail address.
   - Backend creates a real cryptographic OTP hash in Supabase `otp_codes` table.
   - Brevo dispatches a branded email with the 6-digit OTP directly to the user's Gmail!
   - There are **no test codes** (`123456`, `000000`) — only the genuine OTP received in Gmail / SMS is accepted.

2. **Admin Portal Login**:
   - Admin opens `https://homezy-admin.vercel.app/login`.
   - Logs in with the email & password added to Supabase.
   - If password is forgotten, clicking **Forgot?** sends a temporary reset password to their admin email via Brevo.
