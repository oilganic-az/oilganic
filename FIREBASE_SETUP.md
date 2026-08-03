# Firebase + Admin Panel Setup Guide

This guide explains how to connect the Oilganic admin panel to Firebase so that
changes made through the admin UI are immediately published to **all visitors** on
the live website (`oilganic.vercel.app`).

---

## 1. Create a Firebase Project

1. Go to [https://console.firebase.google.com](https://console.firebase.google.com)
2. Click **Add project** → name it `oilganic` → continue through the wizard
3. **Disable Google Analytics** (not needed)

---

## 2. Set Up Firestore Database

1. In the Firebase console, click **Firestore Database** → **Create database**
2. Choose **Start in test mode** for initial setup (you'll lock it down with rules later)
3. Select the closest region (e.g. `europe-west1` for .az domains)

---

## 3. Set Up Firebase Storage

1. Click **Storage** → **Get started**
2. Accept the default rules for now
3. Note your storage bucket name (e.g. `oilganic.appspot.com`)

---

## 4. Register a Web App

1. In Project Overview, click the **</>** (web) icon → Register app
2. App nickname: `oilganic-web`
3. Copy the `firebaseConfig` values shown

---

## 5. Configure Local Environment

Create `.env.local` in the project root (copy from `.env.example`):

```bash
cp .env.example .env.local
```

Fill in **all** values from the Firebase console:

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=oilganic.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=oilganic
VITE_FIREBASE_STORAGE_BUCKET=oilganic.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123

# Server-side admin credentials (NOT prefixed with VITE_)
ADMIN_USERNAME=oilganic.admin
ADMIN_PASSWORD=your_strong_password_here
JWT_SECRET=replace_with_a_random_64_char_string
```

---

## 6. Seed Firestore with Existing Products (One-time)

```bash
# Install firebase-admin (only needed for the seed script)
npm install --save-dev firebase-admin

# Download service account key:
# Firebase Console → Project Settings → Service Accounts → Generate new private key
# Save as: scripts/serviceAccountKey.json   (it is gitignored)

# Run the seed
npm run seed:firestore
```

This writes all ~150 existing products to Firestore. The live site will
immediately show them (via the real-time `onSnapshot` listener).

---

## 7. Deploy Firestore Security Rules

```bash
npm install -g firebase-tools
firebase login
firebase init firestore    # select your project, use firestore.rules
firebase deploy --only firestore:rules
```

---

## 8. Configure Vercel Environment Variables

In **Vercel Dashboard → oilganic project → Settings → Environment Variables**, add:

| Variable | Value |
|---|---|
| `VITE_FIREBASE_API_KEY` | *(from Firebase console)* |
| `VITE_FIREBASE_AUTH_DOMAIN` | *(from Firebase console)* |
| `VITE_FIREBASE_PROJECT_ID` | *(from Firebase console)* |
| `VITE_FIREBASE_STORAGE_BUCKET` | *(from Firebase console)* |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | *(from Firebase console)* |
| `VITE_FIREBASE_APP_ID` | *(from Firebase console)* |
| `ADMIN_USERNAME` | `oilganic.admin` |
| `ADMIN_PASSWORD` | *(your strong admin password)* |
| `JWT_SECRET` | *(random 64-char string)* |
| `ALLOWED_ORIGIN` | `https://oilganic.vercel.app` |

Then redeploy: push to `main` or trigger a manual redeploy.

---

## 9. Verify Everything Works

1. **Local dev**: `npm run dev` → go to `http://localhost:5173/admin/login`
2. Log in with the credentials from `.env.local`
3. Add a test product → check `http://localhost:5173/products` — it should appear instantly
4. Open the same URL in an **incognito tab** — product should be visible there too (proves data comes from Firestore, not localStorage)
5. Delete the test product
6. Push to GitHub → Vercel redeploys → repeat test on `oilganic.vercel.app`

---

## How Publishing Now Works

```
Admin edits product
         ↓
   Firestore write
         ↓
  Real-time listener fires on ALL connected browsers
         ↓
  Every visitor's product list updates immediately (no reload needed)
```

No rebuild, no redeploy required for product changes.

---

## Changing the Admin Password

Since the password now lives in Vercel's environment variables:

1. Go to **Vercel Dashboard → Settings → Environment Variables**
2. Update `ADMIN_PASSWORD`
3. Trigger a redeploy (or just push any commit)

The new password takes effect immediately after redeploy.
