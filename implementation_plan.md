# Implementation Plan: Full Backend Integration for HiramKo

This plan outlines the architecture and steps required to transform the current HiramKo prototype (Frontend-only) into a fully functional application capable of serving real customers.

## 1. Architectural Choice: Supabase (Backend-as-a-Service)
To move quickly and effectively, we will use **Supabase**. It is an open-source Firebase alternative that provides exactly what HiramKo needs without managing a complex server infrastructure.

**Why Supabase?**
*   **Database**: Full PostgreSQL database (relational, perfect for users/rentals/items).
*   **Auth**: Built-in User Management (Email/Password, Google, Facebook login).
*   **Storage**: Buckets for storing User Avatars and Item Images.
*   **Realtime**: Built-in subscription system for the Chat functionality.
*   **Edge Functions**: For handling secure logic like Payments (Stripe).

## 2. Infrastructure Setup
- [ ] **Create Supabase Project**: Initialize a new project for HiramKo.
- [ ] **Environment Variables**: Add `.env` keys to the Vite project.
    - `VITE_SUPABASE_URL`
    - `VITE_SUPABASE_ANON_KEY`

## 3. Database Schema Design (PostgreSQL)
We will map the existing TypeScript interfaces to SQL tables.

### Tables
1.  **`profiles`** (extends Auth Users)
    *   `id` (uuid, references auth.users)
    *   `username` (text)
    *   `full_name` (text)
    *   `avatar_url` (text)
    *   `is_verified` (boolean)
    *   `user_type` (enum: BASIC, PREMIUM, SHOP)
    *   `location` (text)

2.  **`items`**
    *   `id` (uuid)
    *   `owner_id` (uuid, fk profiles)
    *   `title` (text)
    *   `description` (text)
    *   `category` (text)
    *   `price_per_day` (numeric)
    *   `deposit_amount` (numeric)
    *   `images` (text array)
    *   `condition` (text)
    *   `is_available` (boolean)

3.  **`rentals`**
    *   `id` (uuid)
    *   `item_id` (uuid, fk items)
    *   `renter_id` (uuid, fk profiles)
    *   `start_date` (timestamptz)
    *   `end_date` (timestamptz)
    *   `status` (enum: PENDING, ACTIVE, COMPLETED, etc.)
    *   `total_price` (numeric)
    *   `delivery_method` (text)

4.  **`conversations` & `messages`**
    *   For the P2P chat system, using Supabase Realtime.

## 4. Authentication Integration
- [ ] Replace `MOCK_USERS` with real Auth context.
- [ ] Create `AuthProvider` context in React.
- [ ] Implement Sign Up / Login / Forgot Password pages.
- [ ] Add Row Level Security (RLS) policies (e.g., only the owner can edit their item).

## 5. Feature Migration
- [ ] **Home Feed**: Fetch `items` from DB instead of `MOCK_ITEMS`.
- [ ] **Item Details**: Dynamic fetching by ID.
- [ ] **Rent Item**: Create a row in `rentals` table.
- [ ] **Chat**: Subscribe to DB changes for real-time messaging.
- [ ] **Image Upload**: Upload files to Supabase Storage Bucket when creating items.

## 6. Payment & Verification (The "Real Customers" part)
- [ ] **KYC**: Integration with an ID verification service or manual admin approval for `verified` status.
- [ ] **Payments**: Integrate **Stripe** or **PayMongo** (popular in Philippines).
    - Use Supabase Edge Functions to handle the "Checkout Session".
    - Store transaction IDs in the `rentals` table.

## 7. Deployment
- [ ] **Frontend**: Deploy to **Vercel** or **Netlify**.
- [ ] **Backend**: Managed by Supabase.
- [ ] **Domain**: Buy `hiramko.com` (or similar) and connect.

---

**Next Immediate Step**:
Do you want to proceed with setting up the Supabase client in the code and creating the initial data services?
