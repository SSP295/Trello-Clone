# Trello Clone - Project Management Tool

A full-stack Kanban-style project management web application that replicates Trello's design and user experience. Built with Next.js, FastAPI (Python), PostgreSQL, and SQLAlchemy ORM.

## Features

### Core Features (Must Have)
- ✅ **Board Management**: Create, view, edit, and delete boards
- ✅ **Lists Management**: Create, edit, delete, and reorder lists with drag-and-drop
- ✅ **Cards Management**: Create, edit, delete, and move cards between lists
- ✅ **Card Details**: 
  - Add/remove colored labels
  - Set due dates
  - Create checklists with items (mark complete/incomplete)
  - Assign members to cards
- ✅ **Drag & Drop**: Smooth drag-and-drop for reordering lists and moving cards
- ✅ **Search & Filter**: Search cards by title, filter by labels, members, or due date

### Bonus Features (Good to Have)
- ✅ **Responsive Design**: Works on mobile, tablet, and desktop
- ✅ **Multiple Boards Support**: Create and manage multiple boards
- ✅ **File Attachments**: Upload and manage file attachments on cards
- ✅ **Comments & Activity Log**: Add comments and view activity on cards
- ✅ **Card Covers**: Add cover images to cards
- ✅ **Board Background Customization**: Change board background colors

## Tech Stack

### Frontend
- **Next.js 14** (React framework)
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **@dnd-kit** for drag-and-drop functionality
- **Zustand** for state management
- **Axios** for API calls
- **date-fns** for date formatting
- **react-icons** for icons

### Backend
- **Python 3.9+** with **FastAPI**
- **PostgreSQL** database
- **SQLAlchemy ORM** for database management
- **Alembic** for database migrations
- **Uvicorn** ASGI server

## Prerequisites

Before you begin, ensure you have the following installed:
- Python 3.9 or higher
- Node.js (v18 or higher) for frontend
- PostgreSQL (v14 or higher)
- pip (Python package manager)
- npm or yarn

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd trello-clone
```

### 2. Install Dependencies

Install dependencies for root, server, and client:

```bash
npm run install:all
```

Or install them separately:

```bash
# Root dependencies
npm install

# Server dependencies (Python)
cd server
pip install -r requirements.txt

# Client dependencies
cd ../client
npm install
```

### 3. Database Setup

1. Create a PostgreSQL database:

```bash
createdb trello_clone
```

Or using PostgreSQL client:

```sql
CREATE DATABASE trello_clone;
```

2. Configure the database connection in `server/.env`:

```bash
cd server
cp .env.example .env
```

Edit `server/.env` and update the `DATABASE_URL`:

```
DATABASE_URL="postgresql://username:password@localhost:5432/trello_clone"
PORT=5000
NODE_ENV=development
```

3. Run database migrations:

```bash
cd server
alembic upgrade head
```

4. Seed the database with sample data:

```bash
python seed.py
```

### 4. Create Uploads Directory

```bash
mkdir -p server/uploads
```

### 5. Configure Frontend Environment

Create `client/.env.local`:

```bash
cd client
echo "NEXT_PUBLIC_API_URL=http://localhost:5000/api" > .env.local
```

### 6. Run the Application

#### Option 1: Run both server and client together (recommended)

From the root directory:

```bash
npm run dev
```

This will start:
- Backend server on `http://localhost:5000`
- Frontend client on `http://localhost:3000`

#### Option 2: Run separately

**Terminal 1 - Backend:**
```bash
cd server
python -m uvicorn main:app --reload --port 5000
```

Or use the run script:
```bash
cd server
python run.py
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

### 7. Access the Application

Open your browser and navigate to:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api

## Project Structure

```
trello-clone/
├── client/                 # Next.js frontend
│   ├── app/               # Next.js app directory
│   ├── components/        # React components
│   ├── lib/              # API utilities
│   ├── store/            # Zustand state management
│   ├── types/            # TypeScript types
│   └── package.json
├── server/               # FastAPI backend
│   ├── app/              # Application code
│   │   ├── routers/      # API route handlers
│   │   ├── models.py     # SQLAlchemy models
│   │   ├── schemas.py    # Pydantic schemas
│   │   └── database.py   # Database configuration
│   ├── alembic/          # Database migrations
│   ├── uploads/          # File uploads directory
│   ├── main.py           # FastAPI application
│   ├── seed.py           # Database seed script
│   └── requirements.txt  # Python dependencies
└── package.json          # Root package.json
```

## Database Schema

The application uses the following main entities:

- **User**: Default users for card assignments
- **Board**: Project boards
- **List**: Lists within boards (e.g., To Do, In Progress, Done)
- **Card**: Cards within lists
- **Label**: Colored labels for cards
- **CardLabel**: Many-to-many relationship between cards and labels
- **CardMember**: Many-to-many relationship between cards and users
- **Checklist**: Checklists on cards
- **ChecklistItem**: Items within checklists
- **Attachment**: File attachments on cards
- **Comment**: Comments on cards

## API Endpoints

### Boards
- `GET /api/boards` - Get all boards
- `GET /api/boards/:id` - Get board by ID
- `POST /api/boards` - Create board
- `PUT /api/boards/:id` - Update board
- `DELETE /api/boards/:id` - Delete board

### Lists
- `GET /api/lists/board/:boardId` - Get lists for a board
- `GET /api/lists/:id` - Get list by ID
- `POST /api/lists` - Create list
- `PUT /api/lists/:id` - Update list
- `PUT /api/lists/reorder` - Reorder lists
- `DELETE /api/lists/:id` - Delete list

### Cards
- `GET /api/cards/list/:listId` - Get cards for a list
- `GET /api/cards/:id` - Get card by ID
- `POST /api/cards` - Create card
- `PUT /api/cards/:id` - Update card
- `PUT /api/cards/:id/move` - Move card to different list
- `PUT /api/cards/reorder` - Reorder cards
- `DELETE /api/cards/:id` - Delete card

### Card Features
- `POST /api/cards/:id/labels` - Add label to card
- `DELETE /api/cards/:id/labels/:labelId` - Remove label from card
- `POST /api/cards/:id/members` - Add member to card
- `DELETE /api/cards/:id/members/:userId` - Remove member from card
- `POST /api/cards/:id/checklists` - Create checklist
- `PUT /api/cards/checklists/:id` - Update checklist
- `DELETE /api/cards/checklists/:id` - Delete checklist
- `POST /api/cards/checklists/:id/items` - Add checklist item
- `PUT /api/cards/checklist-items/:id` - Update checklist item
- `DELETE /api/cards/checklist-items/:id` - Delete checklist item
- `POST /api/cards/:id/attachments` - Upload attachment
- `DELETE /api/cards/attachments/:id` - Delete attachment
- `POST /api/cards/:id/comments` - Add comment
- `PUT /api/cards/comments/:id` - Update comment
- `DELETE /api/cards/comments/:id` - Delete comment

### Labels
- `GET /api/labels/board/:boardId` - Get labels for a board
- `POST /api/labels` - Create label
- `PUT /api/labels/:id` - Update label
- `DELETE /api/labels/:id` - Delete label

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID

### Search
- `GET /api/search/cards` - Search cards (query params: q, labelId, userId, dueDate, boardId)

## Assumptions

1. **No Authentication**: The application assumes a default user is logged in. Sample users are created in the database seed script.

2. **Default User**: The first user from the database is used as the default user for comments and activities.

3. **File Uploads**: File uploads are stored locally in the `server/uploads` directory. For production, consider using cloud storage (AWS S3, Cloudinary, etc.).

4. **Image URLs**: Card cover images can be set via URL. The application doesn't currently support image uploads for covers, but the infrastructure is in place.

## Deployment

### Backend Deployment (Render/Railway)

1. Set environment variables:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `PORT`: Port number (usually provided by the platform)
   - `NODE_ENV`: production

2. Build commands:
   ```bash
   npm install
   npm run prisma:generate
   npm run prisma:migrate
   npm start
   ```

### Frontend Deployment (Vercel/Netlify)

1. Set environment variables:
   - `NEXT_PUBLIC_API_URL`: Your backend API URL

2. Build settings:
   - Build command: `npm run build`
   - Output directory: `.next`

## Development Notes

- The application uses Prisma for database migrations. Always run migrations after schema changes.
- File uploads are handled by Multer with a 10MB size limit.
- Drag-and-drop uses @dnd-kit library for smooth interactions.
- State management is handled by Zustand for simplicity and performance.

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Verify DATABASE_URL in `server/.env` is correct
- Check database permissions

### Port Already in Use
- Change the PORT in `server/.env` or `client/.env.local`
- Kill the process using the port: `lsof -ti:5000 | xargs kill`

### Prisma Issues
- Run `npm run prisma:generate` after schema changes
- Run `npm run prisma:migrate` to apply migrations

## License

MIT

## Author

Built as a full-stack assignment project.
