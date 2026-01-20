# HiramKo Product Requirements Document (PRD)
**Version:** 1.0  
**Date:** 2025-12-10  
**Status:** In Development (MVP Phase)

## 1. Executive Summary
**HiramKo** is a futuristic, peer-to-peer (P2P) rental ecosystem designed to democratize access to assets. The core philosophy is "Anyone can rent anything," aiming **to make renting anything hassle-free** while enabling users to lend underutilized items and renters to access goods without ownership costs. The platform emphasizes security, trust (via KYC and Escrow), and ease of use (AI-assisted features).

## 2. Project Goals & Objectives
*   **Democratize Rentals:** Create a marketplace for everyday items (tools, gadgets, fashion) beyond traditional car/house rentals.
*   **Trust & Safety:** Implement robust identity verification (KYC) and financial security (Escrow system) to mitigate risk for localized P2P transactions.
*   **AI-Enhanced UX:** Leverage Google Gemini AI to simplify listing creation, improve search discoverability, and assist in user communication.
*   **Visual Excellence:** deliver a "premium," futuristic user interface that engages users immediately.

## 3. Target Audience
*   **Lenders:** Individuals with underutilized assets (cameras, tools, costumes) looking to earn passive income.
*   **Renters:** Students, hobbyists, or professionals needing temporary access to items (e.g., a drill for a weekend project, a gown for an event).
*   **Rental Shops:** Small businesses looking for a digital storefront with delivery integration (e.g., clothing rental, car rental, camera gear shops).

## 4. System Architecture

### 4.1 Tech Stack (WebApp-First Strategy)
*   **Strategy:** We are currently **WebApp First**. A dedicated mobile app version will be developed immediately after the web application is fully stable and ready for wide usage.
*   **Frontend:** React (v18), Vite, TypeScript.
*   **Styling:** TailwindCSS (with custom animations and glassmorphism design system).
*   **Backend (BaaS):** Supabase
    *   **Database:** PostgreSQL.
    *   **Authentication:** Supabase Auth (Email/Password, OAuth ready).
    *   **Storage:** Supabase Storage (Item images, Avatar hosting).
*   **Artificial Intelligence:** Google Gemini API (`gemini-2.5-flash`)
    *   Smart Item Description Generation.
    *   Context-aware Search Suggestions.
    *   AI Chat Assistant for automated customer service responses.

### 4.2 Integration Points
*   **Supabase Client:** Handles real-time data fetching for items and user profiles.
*   **Gemini Service:** Stateless API calls for generating text and analysis.

## 5. Functional Requirements & Features

### 5.1 User Management
*   **Registration/Login:** Email or **Phone Number** based signup with robust validation.
*   **Profiles:** Public profiles with ratings, reviews, and "Verified" badges.
*   **KYC Verification:**
    *   **Open Access:** Accepts **Student IDs** for general items.
    *   **High-Value Items:** Requires **Government Valid ID** (e.g., for Cars, Condos).
    *   **AI Integration:** uses AI to verify ID authenticity and match with user selfies.
*   **Membership:** All features are currently open to all verified users (No tiered restrictions for this version).

### 5.2 Inventory & Listing
*   **Create Listing:** Users can post items with photos, pricing, and category.
*   **Featured Listings:** Dedicated section for high-engagement or promoted items.
*   **AI Assistance:** One-click generation of professional usage descriptions based on keywords.
*   **Categories:** Structured categorization (Cameras, Vehicles, Gadgets, etc.) for easy browsing.
*   **Management:** Owners can view, **edit**, and manage their active listings (CRUD).

### 5.3 Discovery & Search
*   **Smart Search:** Keyword search enhanced by Gemini AI to suggest relevant categories or related terms.
*   **Filtering:** Filter by Category, Price Range, and Location.
*   **Visual Feed:** High-fidelity item cards with hover effects and quick status views.

### 5.4 Transactions & Rentals
*   **Rental Prerequisites:**
    1.  User must be **KYC Verified**.
    2.  User must meet the item's **Escrow Credit** requirements.
*   **Rental Workflow:** Request -> Approve -> Pickup -> Return -> Complete.
*   **Escrow System:**
    *   **Logic:** Escrow credits automatically transfer/lock from Renter to the Transaction Flow upon renting.
    *   **Release API:** Credits return to the **Renter** only once the item is successfully marked returned.
    *   **Dispute/Non-Return:** If the item is not returned, credits remain locked/held. The Rentor must file a report. **Admins must approve** the release of these credits to the Rentor as compensation.
    *   **Penalties:** A procurement penalty system will notify and charge the renter if the item is not returned by the agreed date.
*   **Delivery Tracking:** UI for tracking Rider pickup and delivery stages methods.

### 5.5 Communication
*   **P2P Chat:** Direct messaging between Renter and Owner.
*   **AI Auto-Reply:** "Smart Reply" suggestions for shop owners to handle common inquiries automatically.

### 5.6 Logistics & Rider System
*   **Logistics Options (Owner Defined):**
    *   **Light Items:** Motorcycle compatible (Standard Delivery).
    *   **Medium/Heavy:** Requires specialized transport (Van/Truck/Speaker/Lights).
    *   **Owner Logistics:** Owner provides their own delivery service.
    *   **No Delivery:** For fixed assets like Condos, Lots, Rooms.
*   **Rider Mode:**
    *   Dedicated interface for Riders to accept jobs.
    *   Job types filtered by vehicle capacity (Motorcycle vs Truck).
    *   Proof of Pickup/Delivery integration.

### 5.7 Inquiry & Survey Logic
*   **Survey/Meetup Option:** For items requiring physical check before renting (e.g., Fitting clothes, House Viewing, Car Condition Check).
*   **Inquire First:** Option to chat/schedule verification before committing to payment.

## 6. Data Model (Core Entities)

### User (`users` / `profiles`)
*   `id` (UUID), `email`, `full_name`, `avatar_url`
*   `is_verified` (Boolean)
*   `rating`, `reviews_count`

### Item (`items`)
*   `id` (UUID), `owner_id` (FK)
*   `title`, `description`, `category`
*   `price_per_day`, `deposit_amount`
*   `images` (Array of URLs)
*   `status` (Available/Rented)

### Rental (`rentals`)
*   `id`, `item_id`, `renter_id`, `owner_id`
*   `start_date`, `end_date`
*   `total_price`, `escrow_status`
*   `status` (Pending/Active/Completed/Disputed)

## 7. Current Project State & Roadmap

### Current Version (v0.5 - Alpha)
*   ✅ **Completed:** Frontend Design System, Auth Flow (Login/Signup), Item Posting with AI, Homepage with Listings, Profile Dashboard (UI). **(Ongoing: UI Polish for smoothness).**
*   ⚠️ **Mocked/Simulated:** Rental Transaction Logic (Escrow & Payment processing is UI-only), Notification delivery, Real-time Chat sync (partially mocked).
*   🔄 **In Progress:** Integrating Supabase for all CRUD operations (Items currently hybrid DB/Mock fallback).

### Roadmap (v1.0)
*   **Payments:** Integrate **PayMongo** (Philippines-based) for real payment processing.
*   **Real-time:** Fully enable Supabase Realtime for Chat and Status Updates.
*   **Admin Panel:** Dispute resolution dashboard.
*   **Mobile:** Responsive PWA optimization or Mobile App Wrapper.
