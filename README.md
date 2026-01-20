# HiramKo - Peer-to-Peer Rental Platform 🤝

HiramKo is a next-generation rental marketplace improving access to underutilized assets. It features secure escrow payments, AI-powered search, and integrated logistics.

## Features ✨
*   **Smart Search:** AI-enhanced search suggestions using Gemini.
*   **Secure Payments:** Integrated with PayMongo (via Supabase Edge Functions) and Escrow logic.
*   **Real-time Chat:** P2P messaging between Renters and Owners.
*   **Logistics:** Built-in Delivery Tracking and Rider Dashboard.
*   **Mobile Ready:** Fully responsive design with mobile-first navigation.

## Tech Stack 🛠️
*   **Frontend:** React, Vite, TypeScript, TailwindCSS
*   **Backend:** Supabase (Auth, DB, Realtime, Edge Functions)
*   **AI:** Google Gemini API
*   **Payments:** PayMongo

## Local Setup 💻

1.  **Clone & Install**
    ```bash
    npm install
    ```

2.  **Environment Variables**
    Create a `.env` file based on `.env.example`:
    ```
    VITE_SUPABASE_URL=your_supabase_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    VITE_GEMINI_API_KEY=your_gemini_key
    ```
    *For Payments:* set `PAYMONGO_SECRET_KEY` in your Supabase Dashboard.

3.  **Run Development Server**
    ```bash
    npm run dev
    ```

## Deployment 🚀

### 1. Database & Edge Functions (Supabase)
*   Link your project: `supabase link`
*   Deploy functions: `supabase functions deploy`
*   Push schema: `supabase db push`

### 2. Frontend (Vercel/Netlify)
*   Connect your repository.
*   Add the Environment Variables from step 2.
*   Build Command: `npm run build`
*   Output Directory: `dist`

---
*Built with ❤️ for the Sharing Economy*
