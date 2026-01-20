# HiramKo System Architecture
**Version:** 1.0
**Date:** 2025-12-10

## 1. High-Level Architecture
HiramKo follows a **Service-Oriented Architecture (SOA)** approach, leveraging **Serverless** components provided by Supabase. The system is designed to be "WebApp First," ensuring a responsive and robust browser experience before expanding to mobile.

### Core Components
1.  **Client Layer (SPA):** React + Vite application hosted on the edge. Handling UI, state management, and user interactions.
2.  **Backend Services (Supabase):**
    *   **Auth Service:** Manages JWT tokens, signups, and session security.
    *   **Data Layer (PostgreSQL):** Relational database storing Users, Items, Rentals, and Transactions.
    *   **Storage Service:** Object storage for User Avatars and Listing Images.
    *   **Edge Functions (Future):** Validation logic for complex Escrow triggers.
3.  **AI Service Layer:** Stateless integration with **Google Gemini API** for content generation (descriptions, chat replies) and analysis.
4.  **Payment Gateway:** Integration with **PayMongo** for handling PH-based localized payments and disbursement.

---

## 2. Module Breakdown

### 2.1 User Module
*   **Authentication:** Email/Password via Supabase Auth.
*   **Profile Management:** Fetches/Updates `profiles` table.
*   **KYC Sub-system:** Handles ID upload (Storage) and status updates (`is_verified` flag).

### 2.2 Inventory Module
*   **Listing Management:** CRUD operations on `items` table.
*   **Search Engine:**
    *   Vector-like semantic search using Gemini-generated keywords stored in local metadata or simple ILIKE queries on DB.
    *   Filters: Category, Price, Location.

### 2.3 Transaction Module (Rental & Escrow)
***Critical Logic Flow***

The transaction system is the reliable core of HiramKo, ensuring trust between Strangers.

**A. Rental Request Flow**
1.  **Request:** Renter initiates request -> Creates `rental` record (Status: `PENDING`).
2.  **Approval:** Owner accepts -> Status: `APPROVED`.
3.  **Payment/Escrow Lock:**
    *   Renter is redirected to PayMongo.
    *   **Authorized Amount:** Rental Fee + Security Deposit (Escrow).
    *   Upon success, `rental` status -> `ACTIVE` (or `PICKUP_READY`).

**B. The Escrow Logic (Hold & Release)**
*   **State 1: Locked.** When `ACTIVE`, the Security Deposit is held in a platform "Escrow Wallet" or "Hold State". It is NOT transferred to the owner yet.
*   **State 2: Return Success.**
    *   Item returned -> Owner confirms condition -> Status: `COMPLETED`.
    *   **Action:** System triggers PayMongo/Platform to **Refund/Release** the Security Deposit back to the **Renter**.
    *   Rental Fee is released to Owner.
*   **State 3: Dispute / Non-Return.**
    *   Item NOT returned by due date -> System flags `OVERDUE`.
    *   **Penalty Proc:** Automated notification sent to Renter with penalty calculation.
    *   **Report:** Owner files "Missing Item" or "Damaged" report.
    *   **Admin Review:** Admin panel allows HiramKo staff to review evidence.
    *   **Action:** If approved, Admin triggers **Release to Owner**. The Security Deposit is transferred to the Owner as compensation.

### 2.4 Communication Module
*   **Chat:** Real-time messaging via Supabase Realtime (WebSockets).
*   **AI Auto-Reply:** Client-side intercept that sends incoming message context to Gemini -> returns suggested reply -> User approves/sends.

---

## 3. Data Flow Diagram (Conceptual)

```mermaid
graph TD
    User[Clients (Web)] -->|HTTPS| CDN[Vite Host]
    User -->|API/WS| Supabase[Supabase BaaS]
    User -->|GenAI| Gemini[Google Gemini API]
    
    subgraph Supabase Service
        Auth[GoTrue Auth]
        DB[(PostgreSQL)]
        Storage[S3 Compat]
    end
    
    subgraph External Services
        PayMongo[PayMongo Gateway]
    end

    Supabase --> DB
    Supabase --> Storage
    
    %% Escrow Flow
    User -- "1. Rent & Pay" --> PayMongo
    PayMongo -- "2. Webhook (Success)" --> Supabase
    Supabase -- "3. Lock Deposit" --> DB
    
    User -- "4. Return Item" --> Supabase
    Supabase -- "5. Confirm & Unlock" --> PayMongo
    PayMongo -- "6. Refund Renter" --> User
```

## 4. Security & Compliance
*   **RLS (Row Level Security):** Strict DB policies ensuring Users can only edit their own items/profiles.
*   **KYC Data:** ID images stored in a private bucket, accessible only by Admins.
*   **Escrow Safety:** Funds are never directly touched by the Rentor until specific "Completion" or "Admin Approval" events occur.

## 5. Deployment Strategy
*   **Environment:** Development (Local + Mock PayMongo) -> Staging -> Production.
*   **CI/CD:** Automated builds via Vercel or similar (Future).
