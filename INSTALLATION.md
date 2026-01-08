# Installation Guide - Required Modules

This document lists all required modules/packages for the Trello Clone project.

## Prerequisites

Before installing modules, ensure you have:
- **Python 3.9+** installed
- **Node.js 18+** installed
- **PostgreSQL 14+** installed and running
- **pip** (Python package manager)
- **npm** or **yarn** (Node.js package manager)

---

## 📦 Python Backend Dependencies

Location: `server/requirements.txt`

### Core Framework
- **fastapi** (0.104.1) - Modern, fast web framework for building APIs
- **uvicorn[standard]** (0.24.0) - ASGI server for FastAPI

### Database
- **sqlalchemy** (2.0.23) - SQL toolkit and ORM
- **psycopg2-binary** (2.9.9) - PostgreSQL adapter for Python
- **alembic** (1.12.1) - Database migration tool

### Data Validation & Settings
- **pydantic** (2.5.0) - Data validation using Python type annotations
- **pydantic-settings** (2.1.0) - Settings management using Pydantic

### Utilities
- **python-dotenv** (1.0.0) - Load environment variables from .env file
- **python-multipart** (0.0.6) - Support for parsing multipart/form-data (file uploads)

### Installation Command
```bash
cd server
pip install -r requirements.txt
```

---

## 📦 Node.js Frontend Dependencies

Location: `client/package.json`

### Core Framework
- **react** (^18.2.0) - React library
- **react-dom** (^18.2.0) - React DOM renderer
- **next** (^14.0.4) - Next.js framework

### Drag & Drop
- **@dnd-kit/core** (^6.1.0) - Drag and drop toolkit core
- **@dnd-kit/sortable** (^8.0.0) - Sortable components for dnd-kit
- **@dnd-kit/utilities** (^3.2.2) - Utility functions for dnd-kit

### HTTP Client & State Management
- **axios** (^1.6.2) - HTTP client for API calls
- **zustand** (^4.4.7) - Lightweight state management

### UI & Utilities
- **react-icons** (^4.12.0) - Popular icons library for React
- **date-fns** (^2.30.0) - Date utility library

### Development Dependencies
- **typescript** (^5.3.3) - TypeScript compiler
- **@types/node** (^20.10.5) - TypeScript types for Node.js
- **@types/react** (^18.2.45) - TypeScript types for React
- **@types/react-dom** (^18.2.18) - TypeScript types for React DOM

### Styling
- **tailwindcss** (^3.4.0) - Utility-first CSS framework
- **postcss** (^8.4.32) - CSS post-processor
- **autoprefixer** (^10.4.16) - PostCSS plugin for autoprefixing

### Linting
- **eslint** (^8.56.0) - JavaScript/TypeScript linter
- **eslint-config-next** (^14.0.4) - ESLint configuration for Next.js

### Installation Command
```bash
cd client
npm install
```

---

## 📦 Root Dependencies

Location: `package.json` (root)

### Development Tools
- **concurrently** (^8.2.2) - Run multiple commands concurrently

### Installation Command
```bash
npm install
```

---

## 🚀 Quick Installation (All at Once)

From the root directory:

```bash
# Install root dependencies
npm install

# Install Python backend dependencies
cd server
pip install -r requirements.txt

# Install frontend dependencies
cd ../client
npm install
```

Or use the convenience script:

```bash
npm run install:all
```

---

## 📋 Complete Module List Summary

### Python Packages (9 packages)
1. fastapi
2. uvicorn[standard]
3. sqlalchemy
4. psycopg2-binary
5. python-dotenv
6. python-multipart
7. pydantic
8. pydantic-settings
9. alembic

### Node.js Packages - Production (11 packages)
1. react
2. react-dom
3. next
4. @dnd-kit/core
5. @dnd-kit/sortable
6. @dnd-kit/utilities
7. axios
8. date-fns
9. react-icons
10. zustand
11. concurrently (root)

### Node.js Packages - Development (8 packages)
1. typescript
2. @types/node
3. @types/react
4. @types/react-dom
5. tailwindcss
6. postcss
7. autoprefixer
8. eslint
9. eslint-config-next

**Total: 28 packages** (9 Python + 19 Node.js)

---

## 🔍 Verification

After installation, verify everything is installed correctly:

### Check Python packages
```bash
cd server
pip list
```

### Check Node.js packages
```bash
cd client
npm list --depth=0
```

---

## ⚠️ Common Issues

### Python
- **Module not found**: Make sure you're using the correct Python environment
- **psycopg2 installation fails**: Install PostgreSQL development libraries first
  - Ubuntu/Debian: `sudo apt-get install libpq-dev`
  - macOS: `brew install postgresql`

### Node.js
- **npm install fails**: Clear cache and try again: `npm cache clean --force`
- **Version conflicts**: Delete `node_modules` and `package-lock.json`, then reinstall

---

## 📝 Notes

- All versions are specified to ensure compatibility
- Python packages should be installed in a virtual environment (recommended)
- Node.js packages will be installed in `node_modules` directory
- Total installation size: ~500MB (including all dependencies)
