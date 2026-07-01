# Change Networks – IAM Frontend

This is the frontend dashboard for the Change Networks IAM (Identity and Access Management) platform. It provides a sleek, modern, and highly interactive user interface to manage users, groups, policies, and view effective permissions in real-time.

## 🚀 Tech Stack
- **Framework:** React 19 + Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Shadcn UI
- **Routing:** React Router v7
- **Icons:** Lucide React
- **Data Fetching:** Axios + React Query (TanStack)

---

## 🛠️ Local Setup Instructions

Follow these steps to get the frontend dashboard running locally on your machine.

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- The **Backend API** should be running locally (or deployed) for the frontend to fetch data.

### 2. Clone and Install
```bash
# Clone your repository (if not already done)
git clone https://github.com/lakshyagupta001/iam-frontend.git
cd frontend

# Install dependencies
npm install
```

### 3. Environment Variables
Create a `.env` file in the root of the `frontend` directory:
```bash
touch .env
```

Open the `.env` file and add the URL pointing to your backend API:
```env
# If your backend is running locally on port 8000
VITE_API_URL="http://localhost:8000/api"

# (Optional) If connecting to a deployed backend
# VITE_API_URL="https://your-backend.onrender.com/api"
```

### 4. Run the Development Server
```bash
# Start the Vite development server
npm run dev
```
The dashboard should now be running at `http://localhost:5173`. 

---

## 🔑 Demo Login

If you have seeded the backend using `npm run prisma:seed`, you can log in to the dashboard using any of the generated accounts. 

**Password for all demo accounts:** `Pass@123`

- **Root Admin:** `root@changenetworks.com`
- **User:** `lakshya@changenetworks.com`
- **User:** `yash@changenetworks.com`
- **User:** `rahul@changenetworks.com`

---

## 📂 Project Structure

- `src/components/` - Global shared components (Layouts, UI elements like Shadcn)
- `src/modules/` - Feature-based folders (Dashboard, IAM, Resources)
- `src/context/` - React Context providers (AuthContext)
- `src/api/` - Axios configuration and global API utilities

## 📦 Build for Production

To create an optimized production build:
```bash
npm run build
```
This will generate a `dist/` folder containing the static files that can be deployed to Vercel, Netlify, or any static host.
