-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES TABLE (Extends the default auth.users)
-- This stores public user information like name, avatar, and verification status.
create table public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  avatar_url text,
  location text, -- Important for PH context (e.g., "Davao City", "Makati")
  user_type text default 'BASIC', -- 'BASIC', 'PREMIUM', 'VERIFIED_SHOP'
  is_verified boolean default false,
  is_shop boolean default false,
  rating numeric default 5.0,
  reviews_count integer default 0,
  joined_date timestamptz default now(),
  
  constraint username_length check (char_length(full_name) >= 3)
);

-- Turn on Row Level Security (RLS)
alter table public.profiles enable row level security;

-- Policies:
-- Public profiles are viewable by everyone
create policy "Public profiles are viewable by everyone" on profiles
  for select using (true);

-- Users can insert their own profile
create policy "Users can insert their own profile" on profiles
  for insert with check (auth.uid() = id);

-- Users can update own profile
create policy "Users can update own profile" on profiles
  for update using (auth.uid() = id);


-- 2. ITEMS TABLE
-- Stores the rental listings.
create table public.items (
  id uuid default uuid_generate_v4() primary key,
  owner_id uuid references public.profiles(id) not null,
  title text not null,
  description text,
  category text not null, -- 'Cameras', 'Vehicles', etc.
  price_per_day numeric not null, -- stored in PHP
  deposit_amount numeric default 0,
  images text[] default '{}', -- Array of image URLs
  condition text, -- 'Like New', 'Good', 'Fair'
  location text, -- Item specific location
  is_available boolean default true,
  created_at timestamptz default now()
);

alter table public.items enable row level security;

create policy "Items are viewable by everyone" on items
  for select using (true);

create policy "Users can insert their own items" on items
  for insert with check (auth.uid() = owner_id);

create policy "Users can update their own items" on items
  for update using (auth.uid() = owner_id);

create policy "Users can delete their own items" on items
  for delete using (auth.uid() = owner_id);


-- 3. RENTALS TABLE
-- Tracks the transaction state.
create table public.rentals (
  id uuid default uuid_generate_v4() primary key,
  item_id uuid references public.items(id) not null,
  renter_id uuid references public.profiles(id) not null,
  start_date timestamptz not null,
  end_date timestamptz not null,
  total_price numeric not null,
  status text default 'PENDING', -- 'PENDING', 'APPROVED', 'ACTIVE', 'COMPLETED', 'CANCELLED'
  delivery_method text default 'pickup', -- 'pickup', 'meetup', 'delivery'
  payment_status text default 'unpaid', -- 'unpaid', 'paid', 'refunded'
  created_at timestamptz default now()
);

alter table public.rentals enable row level security;

-- Renters can see their own rentals, Owners can see rentals for their items
create policy "Users can see their own rentals" on rentals
  for select using (
    auth.uid() = renter_id or 
    exists (select 1 from items where items.id = rentals.item_id and items.owner_id = auth.uid())
  );

create policy "Users can insert rentals" on rentals
  for insert with check (auth.uid() = renter_id);


-- 4. CONVERSATIONS & MESSAGES (Simple Realtime Chat)
create table public.conversations (
  id uuid default uuid_generate_v4() primary key,
  participant_ids uuid[] not null, -- Array of 2 user IDs
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.messages (
  id uuid default uuid_generate_v4() primary key,
  conversation_id uuid references public.conversations(id) on delete cascade not null,
  sender_id uuid references public.profiles(id) not null,
  content text not null,
  is_read boolean default false,
  created_at timestamptz default now()
);

alter table public.conversations enable row level security;
alter table public.messages enable row level security;

-- Policies for Chat would go here (complex due to arrays, simplified for now)
create policy "Users can view their conversations" on conversations
  for select using (auth.uid() = any(participant_ids));

create policy "Users can view messages in their conversations" on messages
  for select using (
    exists (
      select 1 from conversations 
      where id = messages.conversation_id 
      and auth.uid() = any(participant_ids)
    )
  );
  
create policy "Users can insert messages" on messages
  for insert with check (auth.uid() = sender_id);


-- 5. STORAGE BUCKETS (Script to run in Storage SQL Editor or via UI manually)
-- insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true);
-- insert into storage.buckets (id, name, public) values ('item-images', 'item-images', true);
