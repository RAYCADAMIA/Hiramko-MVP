# Testing the HiramKo Rental Flow

To thoroughly test the end-to-end rental process, follow these steps with two different user accounts (User A - Owner, User B - Renter).

### Phase 1: Listing (User A)
1. **Login** as User A.
2. Navigate to **"Post Item"**.
3. Fill in details:
   - **Title**: Test Camera
   - **Price**: ₱1,000 / day
   - **Security Deposit**: ₱500 (Set manually or use suggestion)
   - **Location**: Davao City
4. Click **"List item"**.
5. Verify you are redirected to the **Dashboard** and see the item under **"My Listings"**.

### Phase 2: Discovery & Inquiry (User B)
1. **Login** as User B (use a different browser or incognito).
2. Find the "Test Camera" on the home page.
3. Click **"Inquire First"**.
4. Send a message to the owner.
5. Verify as **User A** that you receive a notification and can reply in the Messages tab.

### Phase 3: Booking & Escrow (User B)
1. On the "Test Camera" details page, click **"Hiram Ko"**.
2. If your escrow balance is low, you will see an "Insufficient Escrow" alert.
3. Go to **"Deposit"** and add at least ₱500.
4. Go back to the item and click **"Hiram Ko"** again.
5. Proceed to **Checkout** and confirm booking.
6. Verify as **User A** that you have a new **Rental Request** in your Dashboard.

### Phase 4: Approval & Execution (User A)
1. As User A, go to Dashboard -> **"Rental Activities"**.
2. Click **"Verify & Approve"**.
3. The system will check User B's balance. If successful:
   - User B's deposit is **held** in escrow.
   - Status changes to **Approved**.
4. Verify User B's escrow balance has decreased.

### Phase 5: Completion (User A)
1. Once the rental duration is over, click **"Confirm Return"** as User A.
2. Select "Item safe & returned".
3. Verify:
   - The deposit is **released** back to User B.
   - Status changes to **Completed**.
   - User B's balance is updated.

---

# Deployment Readiness

Wait, before deploying to a live domain, ensure the following:

1. **Supabase Bucket**: Create a public bucket named `item-images` in your Supabase project so the cloud uploads work.
2. **Environment Variables**:
   - `VITE_SUPABASE_URL`: Your Supabase Project URL.
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase Anon Key.
   - `VITE_GEMINI_API_KEY`: A valid Google Gemini API key for AI description generation.
3. **Build Command**: Run `npm run build` to ensure there are no TypeScript or build errors.
4. **Hosting**: Use **Vercel** or **Netlify** for easy React deployment. Connect your Git repository and set the environment variables in the hosting provider's dashboard.
