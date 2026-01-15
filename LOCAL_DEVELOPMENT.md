# 🚀 Local Development Guide

This guide will help you run TrackMyExpense locally on your machine.

---

## Prerequisites

Before you start, make sure you have:
- **Node.js** >= 20.0.0 ([Download](https://nodejs.org/))
- **npm** >= 10.0.0 (comes with Node.js)
- **Git** (already installed ✓)

Check your versions:
```bash
node --version
npm --version
```

---

## 🎨 Running the Frontend

The frontend is ready to run right now!

### Step 1: Navigate to Frontend Directory
```bash
cd d:\Myworkspace\TrackMyExpense\frontend
```

### Step 2: Install Dependencies
```bash
npm install
```

This will install all the packages defined in `package.json`:
- React 18
- TypeScript
- Material-UI
- Vite
- React Query
- And more...

**Note:** This may take 2-3 minutes on first install.

### Step 3: Start Development Server
```bash
npm run dev
```

**Expected Output:**
```
VITE v5.1.0  ready in 500 ms

➜  Local:   http://localhost:3000/
➜  Network: use --host to expose
➜  press h + enter to show help
```

### Step 4: Open in Browser
The browser should automatically open to `http://localhost:3000`

If not, manually open: **http://localhost:3000**

**What You'll See:**
- A dark-themed page with gradient background
- "TrackMyExpense" heading in purple gradient
- Success message confirming setup is complete
- Message about next steps

---

## 🔧 Backend (Not Yet Implemented)

The backend Lambda functions haven't been created yet. Here are your options:

### Option 1: Mock Backend (Recommended for Now)
Continue developing the frontend with mock data until we create the real backend.

### Option 2: Wait for Backend Implementation
We'll create the Lambda functions and local Express server in the next phase.

### Option 3: Local Express Server (Coming Soon)
I can create a local Express server that mimics Lambda functions for development.

---

## 📝 Available NPM Scripts

### Frontend Scripts

```bash
# Start development server (with hot reload)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint

# Fix linting issues
npm run lint:fix

# Format code with Prettier
npm run format

# Type check (without building)
npm run type-check

# Run tests
npm run test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

### Backend Scripts (When Implemented)

```bash
# Start local development server
npm run dev

# Build TypeScript
npm run build

# Run linter
npm run lint

# Run tests
npm run test

# Deploy to AWS
npm run deploy
```

---

## 🛠️ Development Workflow

### 1. Make Changes
Edit files in `frontend/src/` - Vite will automatically reload the browser!

### 2. Check for Errors
- **Browser Console:** F12 → Console tab
- **Terminal:** Watch for TypeScript/ESLint errors

### 3. Format Code
```bash
npm run format
```

### 4. Type Check
```bash
npm run type-check
```

---

## 🐛 Troubleshooting

### Issue: `npm install` fails
**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### Issue: Port 3000 already in use
**Solution:**
```bash
# Kill process on port 3000 (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or change port in vite.config.ts
# Change: port: 3000 → port: 3001
```

### Issue: TypeScript errors
**Solution:**
```bash
# Restart TypeScript server in VS Code
# Ctrl+Shift+P → "TypeScript: Restart TS Server"
```

### Issue: Module not found
**Solution:**
```bash
# Reinstall dependencies
npm install
```

---

## 🔥 Hot Module Replacement (HMR)

Vite provides instant HMR - changes appear in the browser without full page reload!

**Try it:**
1. Run `npm run dev`
2. Open `src/App.tsx`
3. Change the heading text
4. Save the file
5. See instant update in browser! ⚡

---

## 📂 Project Structure

```
frontend/
├── src/
│   ├── App.tsx              ← Main component
│   ├── main.tsx             ← Entry point
│   ├── index.css            ← Global styles
│   ├── theme/
│   │   └── index.ts         ← MUI theme
│   ├── types/
│   │   └── index.ts         ← TypeScript types
│   └── services/
│       └── api.ts           ← API client
├── index.html               ← HTML template
├── package.json             ← Dependencies
├── vite.config.ts           ← Vite configuration
└── tsconfig.json            ← TypeScript config
```

---

## 🎯 Next Steps After Running Locally

1. ✅ Verify the app runs successfully
2. ✅ Explore the code structure
3. ✅ Make a small change to see HMR in action
4. ⏳ Wait for backend implementation
5. ⏳ Connect frontend to backend APIs

---

## 💡 Tips

- **Use VS Code Extensions:**
  - ESLint
  - Prettier
  - TypeScript and JavaScript Language Features
  - ES7+ React/Redux/React-Native snippets

- **Keep Terminal Open:** Watch for errors and warnings

- **Use React DevTools:** Install the browser extension for debugging

- **Check Network Tab:** Monitor API calls (when backend is ready)

---

## 🆘 Need Help?

If you encounter any issues:
1. Check the error message in terminal
2. Check browser console (F12)
3. Review this guide
4. Check `package.json` for correct scripts

---

**Ready to code!** 🚀
