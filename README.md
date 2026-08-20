# 💰 Personal Finance Dashboard

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)
![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-brightgreen.svg?style=for-the-badge)

</div>

> A secure, production-grade personal finance platform built for real-time bank transaction synchronization, automated spending categorization, and actionable cash flow analytics.

---

## 📋 Features

- 🏦 **Bank-Grade Plaid Integration**: Secure Link authentication flow with server-side token exchanges and zero client-side credential exposure.
- 📊 **Interactive Spending Analytics**: Visual monthly breakdowns, category distribution charts, and month-over-month trends powered by Recharts.
- 🔄 **Idempotent Transaction Sync**: Incremental transaction synchronization algorithm that eliminates duplicates and handles pending, updated, or removed items.
- 🏷️ **Smart Categorization & Overrides**: Automatic mapping of financial taxonomy with user manual override support that persists across sync cycles.
- 🔒 **Encrypted Credential Protection**: AES-256 encryption at rest for sensitive Plaid access tokens with strict server-side authorization checks.
- 📱 **Adaptive Responsive UI**: Tailored user experiences across desktop sidebars and mobile card layouts designed with Tailwind CSS.

---

## 🛠️ Tech Stack

- [Next.js (App Router)](https://nextjs.org/) - Full-stack React framework
- [TypeScript](https://www.typescriptlang.org/) - Type safety & developer experience
- [PostgreSQL](https://www.postgresql.org/) - Primary relational database
- [Prisma ORM](https://www.prisma.io/) - Next-gen Node.js and TypeScript ORM
- [Plaid API](https://plaid.com/) - Secure financial data abstraction layer
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Recharts](https://recharts.org/) - Composably designed React charting library
- [Zod](https://zod.dev/) - TypeScript-first schema validation

---

## ⚡ Quick Start & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/username/personal-finance-dashboard.git
   cd personal-finance-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Environment Variables**
   Copy the example environment file and configure your credentials:
   ```bash
   cp .env.example .env
   ```

4. **Run Database Migrations**
   Synchronize your PostgreSQL database schema with Prisma:
   ```bash
   npx prisma db push
   ```

5. **Start the Development Server**
   ```bash
   npm run dev
   ```
   Navigate to `http://localhost:3000` to access the application.

---

## 🔑 API Key & Environment Configuration

Create a `.env` file in the root directory with the following variables:

```env
# Database Connection
DATABASE_URL="postgresql://user:password@localhost:5432/finance_db?schema=public"

# Authentication Secret
AUTH_SECRET="your-super-secret-auth-key-at-least-32-chars"

# Encryption Key for Sensitive Credentials (AES-256: 32 bytes hex/base64)
ENCRYPTION_KEY="0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"

# Plaid Integration Credentials
PLAID_CLIENT_ID="your_plaid_client_id"
PLAID_SECRET="your_plaid_secret"
PLAID_ENV="sandbox" # sandbox, development, or production
```

> ⚠️ **Security Notice**: Never expose your `PLAID_SECRET`, `ENCRYPTION_KEY`, or `AUTH_SECRET` to the browser or commit them into version control. Ensure all sensitive tokens are securely managed via server-side environment variables.

---

## 🔄 How It Works

1. **User Authentication**: Securely log in or register a new account to instantiate an isolated user session.
2. **Connect Financial Institution**: Launch Plaid Link inside the dashboard to select and authenticate your financial accounts.
3. **Server Token Exchange**: Plaid returns a short-lived `public_token`, which is securely exchanged server-side for an encrypted `access_token` stored in PostgreSQL.
4. **Incremental Sync**: The server pulls new, updated, or removed transactions, automatically categorizing each entry.
5. **Visualize & Refine**: View aggregated spending trends, inspect interactive charts, and adjust transaction categories to fit your budgeting workflow.

---

## 🏗️ Building for Production

To create an optimized production build:

```bash
npm run build
```

To start the production server:

```bash
npm run start
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">

**Created By Mert Batu BULBUL**
* 🎓 AI Engineering & Full Stack Developer * 💻 React *

**Don't forget to star ⭐ this repo if you found it useful!**

</div>

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page or submit a pull request.
