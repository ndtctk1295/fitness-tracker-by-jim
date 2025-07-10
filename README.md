# Fitness Tracker App

A comprehensive fitness tracking application built with Next.js, TypeScript, Tailwind CSS, and MongoDB.

## Features

- User authentication with role-based access control
- Exercise and workout tracking
- Training calendar
- Customizable timer with different strategies
- Weight plate calculator
- Dark/light theme support

## Tech Stack

- **Frontend**: Next.js 14, React 19, Tailwind CSS, Shadcn UI
- **Backend**: Next.js API Routes, MongoDB
- **Authentication**: NextAuth.js
- **State Management**: Zustand
- **Styling**: Tailwind CSS with Shadcn UI components
- **Database**: MongoDB with Mongoose

## Getting Started

### Prerequisites

- Node.js 16+
- Yarn or npm
- MongoDB database (local or cloud-based like MongoDB Atlas)

### Environment Setup

1. Clone the repository
2. Create a `.env.local` file in the root directory with the following variables:

```
# MongoDB Connection String
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-random-secret-key-here

# Optional OAuth Providers
GITHUB_ID=your-github-client-id
GITHUB_SECRET=your-github-client-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### Installation

```bash
# Install dependencies
yarn install

# Start development server
yarn dev
```

### Setting up an Admin User

Run the admin initialization script to create an admin user:

```bash
npx ts-node ./scripts/init-admin.ts
```

The default admin credentials are:
- Email: `admin@example.com`
- Password: `admin123456`

**Note:** Remember to change these credentials in production.

## Project Structure

```
fitness-tracker/
├── app/                  # Next.js app router pages
│   ├── (protected)/      # Routes requiring authentication
│   ├── admin/            # Admin routes
│   ├── api/              # API routes
│   └── auth/             # Authentication pages
├── components/           # React components
│   ├── auth/             # Authentication components
│   ├── layouts/          # Layout components
│   ├── timer/            # Timer related components
│   └── ui/               # UI components
├── hooks/                # Custom React hooks
├── lib/                  # Utilities, models, services
│   ├── models/           # Mongoose models
│   ├── mongodb/          # MongoDB connection logic
│   ├── services/         # Data service layer
│   └── stores/           # Zustand state stores
├── public/               # Static files
└── scripts/              # Utility scripts
```

## Authentication

The application uses NextAuth.js with JWT strategy and supports:

- Credentials authentication (email/password)
- GitHub OAuth
- Google OAuth

User roles:
- **User**: Basic access to all personal features
- **Admin**: Full access including category and exercise management

## License

MIT
