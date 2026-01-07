# Frontend Directory Structure

This directory contains placeholder files to establish the project structure.

## Structure Overview

```
src/
├── assets/          # Images, fonts, static files
├── components/      # Reusable React components
│   ├── common/      # Generic UI components (Button, Input, Card, etc.)
│   ├── layout/      # Layout components (Header, Sidebar, Footer)
│   └── features/    # Feature-specific components
├── pages/           # Page components
│   ├── Auth/        # Login, Signup, ForgotPassword
│   ├── Dashboard/   # Main dashboard
│   ├── Accounts/    # Account management
│   ├── Transactions/# Transaction management
│   └── Settings/    # User settings
├── hooks/           # Custom React hooks
├── services/        # API service layer
├── store/           # State management (Zustand)
├── types/           # TypeScript type definitions
├── utils/           # Helper functions
├── theme/           # MUI theme configuration
├── App.tsx          # Root component
└── main.tsx         # Entry point
```

## Next Steps

The following components will be created in subsequent phases:
- Authentication pages and flows
- Dashboard with charts and analytics
- Account management interface
- Transaction entry and listing
- Settings and profile management
