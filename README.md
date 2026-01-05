# Smart Discover - Affiliate Marketing App

A modern, responsive e-commerce affiliate platform built with React, Supabase, and Framer Motion.

## 🚀 Features

- **Modern UI**: Clean "fit-to-fit" interface for both mobile and desktop, inspired by leading e-commerce platforms.
- **Intelligent Product Gallery**: High-performance image carousels and vertical grids with robust handling for both external URLs and Data URIs.
- **Mandatory Authentication**: Secure login flow with Protected Routes ensuring app content is only visible to registered users.
- **Admin Dashboard**: Specialized interface for managing products, categories, banners, and policies.
- **Multi-layered Security**: Role-based access control combined with specific email verification for admin accounts.
- **Daily Terms Agreement**: Compulsory daily legal and-pricing disclaimer agreement to ensure user compliance.

## 🛠️ Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, shadcn/ui.
- **State Management**: TanStack Query (React Query).
- **Backend**: Supabase (Authentication, PostgreSQL Database).
- **Animations**: Framer Motion for smooth transitions and micro-interactions.
- **Icons**: Lucide React.

## 📦 Getting Started

1. **Clone the repository**:
   ```sh
   git clone <YOUR_GITHUB_URL>
   ```
2. **Install dependencies**:
   ```sh
   npm install
   ```
3. **Set up Environment Variables**:
   Create a `.env` file with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
   ```
4. **Run development server**:
   ```sh
   npm run dev
   ```

## 🔒 Security Notice

- **Admin Access**: Currently restricted strictly to `adssma@smart.com`.
- **Private Data**: Ensure `.env` is never committed to version control (already added to `.gitignore`).

---
Developed as a premium affiliate discover platform.
