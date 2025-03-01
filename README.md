# Student Finance Tracker Backend

A web-based application that helps students efficiently manage their finances by tracking expenses, viewing monthly summaries, and analyzing spending habits through data visualizations.

## 🚀 Features

-   Expense Tracking & Categorization
-   Monthly Summary
-   Budgeting Tips
-   Data Visualization
-   Financial Goal Setting
-   Recurring Expense Reminders
-   User Authentication

## 🛠️ Tech Stack

-   **Backend**: Fastify, TypeScript, Node.js
-   **Database**: PostgreSQL with Prisma ORM (Using Neon)
-   **Logging**: Winston
-   **Deployment**: Vercel
-   **Authentication**: JWT

## 👋 Prerequisites

-   Node.js (v16+)
-   npm or yarn
-   PostgreSQL (Using Neon cloud database)

## 🔧 Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/student-finance-tracker.git
cd student-finance-tracker
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the root directory:

```env
PORT=3000
NODE_ENV=development
DATABASE_URL="your_neon_database_url"
JWT_SECRET=your-secret-key
APP_CLIENT_ID=your-client-id
JWT_ISS=your-iss
```

### 4. Set up Prisma

```bash
# Generate Prisma client
npx prisma generate

# Apply database schema changes
npx prisma db push
```

### 5. Build the project

```bash
npm run build
```

### 6. Start the development server

```bash
npm run dev
```

## 🏃‍♂️ Running in Production

### Deploying to Vercel

1. Install Vercel CLI:
    ```bash
    npm install -g vercel
    ```
2. Login to Vercel:
    ```bash
    vercel login
    ```
3. Deploy the project:
    ```bash
    vercel --prod
    ```
4. If database schema updates are needed:
    ```bash
    npx prisma db push
    ```

## 💁️ Project Structure

```
├── README.md
├── package.json
├── package-lock.json
├── tsconfig.json
├── prisma/
│   ├── schema.prisma        # Prisma schema
│   └── migrations/          # Database migrations
└── src/
    ├── app.ts               # Application setup
    ├── server.ts            # Server entry point
    ├── config/
    │   └── config.ts        # App configuration
    ├── lib/                 # Shared libraries
    │   └── prisma.ts        # Prisma client instance
    ├── modules/
    │   └── auth/            # Feature modules
    │       ├── controller.ts
    │       ├── service.ts
    │       └── route.ts
    ├── router/
    │   └── master.router.ts # Main router
    └── utils/
        └── logger.ts        # Winston logger setup
```

## 🗃️ Database Setup

### Using Prisma

Prisma is a modern ORM that simplifies database operations and provides type-safety.

1. **Configure Prisma Schema**

    The `prisma/schema.prisma` file defines your database schema:

    ```prisma
    generator client {
      provider = "prisma-client-js"
    }

    datasource db {
      provider = "postgresql"
      url      = env("DATABASE_URL")
    }

    model User {
      id        Int      @id @default(autoincrement())
      email     String   @unique
      password  String
      name      String?
      createdAt DateTime @default(now())
      updatedAt DateTime @updatedAt
      expenses  Expense[]
    }

    model Expense {
      id          Int      @id @default(autoincrement())
      amount      Float
      category    String
      description String?
      date        DateTime
      createdAt   DateTime @default(now())
      updatedAt   DateTime @updatedAt
      userId      Int
      user        User     @relation(fields: [userId], references: [id])
    }
    ```

2. **Apply Schema Changes**

    ```bash
    npx prisma db push
    ```

3. **Generate Prisma Client**

    ```bash
    npx prisma generate
    ```

4. **Database Management**

    ```bash
    # View your database using Prisma Studio
    npx prisma studio
    ```

## 🤦‍♂️ Testing

```bash
# Run tests
npm test
```

## 🔍 API Documentation

API documentation is available at `url-to-update/api/documentation` when the server is running.

## 🗂️ API Endpoints

### Authentication

-   **POST** `/auth/login` - Login and get JWT

_More endpoints to be added as development progresses_

## 🛠️ Development Commands

```bash
# Start development server with hot-reload
npm run dev

# Build for production
npm run build

# Run linting
npm run lint

# Run tests
npm test

# Prisma commands
npx prisma studio       # Open Prisma Studio
npx prisma db push      # Apply schema changes
npx prisma generate     # Generate Prisma client
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is for educational purposes only and does not include a formal license.
