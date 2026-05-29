# PlacementReady – DSA & Interview Preparation Platform

Welcome to **PlacementReady**, a comprehensive platform designed to help students prepare for coding interviews, mock tests, and placements. 

This repository follows a **Multi-App Architecture** containing two independent Next.js 15 applications powered by Firebase.

## 📂 Project Structure

- **/user-app**: The student-facing portal where users can practice DSA questions, take mock tests, and track their learning streak.
- **/admin-app**: The administrator dashboard used to manage questions, users, and overall analytics.

## 🚀 Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/en/) (v18 or higher)
- npm (Node Package Manager)

## 🛠️ Installation & Setup

You will need to install dependencies for both applications separately.

### 1. Setup the User Application (Student Portal)
Open your terminal and navigate to the user application directory:
```bash
cd user-app
npm install
```

### 2. Setup the Admin Application
Open another terminal (or navigate back) and install the admin application dependencies:
```bash
cd admin-app
npm install
```

---

## ⚙️ Configuration (Firebase)

Both applications use **Firebase** for authentication and real-time database management (Firestore). They share a fallback mock configuration by default, but for cross-app data syncing to work perfectly, you MUST provide your own Firebase keys.

Follow these steps to set up your Firebase project:

### Step 1: Create a Firebase Project
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add project** (or "Create a project").
3. Enter a project name (e.g., `placement-ready`) and click **Continue**.
4. Disable Google Analytics (optional) and click **Create project**. Wait for it to finish, then click **Continue**.

### Step 2: Register your Web App
1. On your new project dashboard, click the **Web icon `</>`** (it looks like a code bracket) to add a Firebase app.
2. Register the app with a nickname (e.g., `placement-web`) and click **Register app**.
3. You will see a `firebaseConfig` object containing keys like `apiKey`, `authDomain`, etc. Keep this page open (you'll need to copy these keys soon).

### Step 3: Setup Authentication
1. On the left sidebar menu, click **Build** > **Authentication**.
2. Click **Get started**.
3. Under the **Sign-in method** tab, click **Google** and enable it. 
4. Select your support email and click **Save**.

### Step 4: Setup Firestore Database
1. On the left sidebar menu, click **Build** > **Firestore Database**.
2. Click **Create database**.
3. Choose your database location (e.g., **`nam5 (us-central)`** to stay on the free tier) and click **Next**.
4. Select **Start in Test mode** (this allows you to read/write data easily during development without setting up complex security rules immediately) and click **Create**.

### Step 5: Add Keys to Your Local Environments
1. Go back to the Project Settings (Gear icon ⚙️ next to "Project Overview" > Project settings) and scroll down to your Web App configuration.
2. Open your code editor and create a file named `.env.local` inside the `user-app/` directory.
3. Create another identical file named `.env.local` inside the `admin-app/` directory.
4. Copy your Firebase keys and paste them into BOTH `.env.local` files using the exact format below:

```env
NEXT_PUBLIC_FIREBASE_API_KEY="your_api_key_here"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your_project_id.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your_project_id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your_project_id.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your_sender_id_here"
NEXT_PUBLIC_FIREBASE_APP_ID="your_app_id_here"
```

*Note: Once you save the `.env.local` files, you must restart both your `user-app` and `admin-app` terminal servers for the changes to take effect.*

---

## 🏃‍♂️ Running the Applications Locally

You can run both applications at the same time using two separate terminal windows.

### Starting the User App
```bash
cd user-app
npm run dev
```
*The user application will start by default on [http://localhost:3000](http://localhost:3000)*

### Starting the Admin App
In a **new terminal window**:
```bash
cd admin-app
npm run dev -p 3001
```
*The admin application will start on [http://localhost:3001](http://localhost:3001)* (Using the `-p 3001` flag prevents port conflicts).

---

## 🌐 Deployment (Vercel)

Since these are two separate Next.js applications, you should deploy them as **two separate projects** on Vercel.

1. Go to [Vercel](https://vercel.com/) and click **Add New Project**.
2. Select this repository.
3. For the **User Portal**:
   - Set the **Root Directory** to `user-app`.
   - Add your Firebase `.env` variables.
   - Click Deploy.
4. For the **Admin Portal**:
   - Click Add New Project again and select the same repository.
   - Set the **Root Directory** to `admin-app`.
   - Add your Firebase `.env` variables.
   - Click Deploy.

---


## 🛠️ Tech Stack
- **Framework**: Next.js 15 (App Router, React 19)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 & Shadcn UI
- **Animations**: Framer Motion
- **Backend**: Firebase (Auth, Firestore)
