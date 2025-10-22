-- =================================================================
-- SoloParentLove - Supabase Schema
-- =================================================================

-- -----------------------------------------------------------------
-- 1. TABLES
-- -----------------------------------------------------------------

-- PROFILE TABLE
-- Stores public user information.
CREATE TABLE public.profiles (
    id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
    email text NOT NULL,
    full_name text,
    gender text,
    age integer,
    city text,
    state text,
    number_of_kids integer,
    co_parenting boolean,
    about text,
    photo_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    PRIMARY KEY (id)
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public.profiles IS 'Public profile information for each user.';

-- LIKES TABLE
-- Stores a record of one user liking another.
CREATE TABLE public.likes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL REFERENCES public.profiles ON DELETE CASCADE,
    liked_user_id uuid NOT NULL REFERENCES public.profiles ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    PRIMARY KEY (id),
    UNIQUE (user_id, liked_user_id)
);
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public.likes IS 'Records when a user likes another user''s profile.';

-- MATCHES TABLE
-- Stores a record of a mutual like.
CREATE TABLE public.matches (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user1_id uuid NOT NULL REFERENCES public.profiles ON DELETE CASCADE,
    user2_id uuid NOT NULL REFERENCES public.profiles ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    PRIMARY KEY (id),
    UNIQUE (user1_id, user2_id)
);
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public.matches IS 'Represents a mutual match between two users.';

-- MESSAGES TABLE
-- Stores chat messages between matched users.
CREATE TABLE public.messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    sender_id uuid NOT NULL REFERENCES public.profiles ON DELETE CASCADE,
    receiver_id uuid NOT NULL REFERENCES public.profiles ON DELETE CASCADE,
    message text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    PRIMARY KEY (id)
);
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public.messages IS 'Stores individual chat messages between users.';


-- -----------------------------------------------------------------
-- 2. ROW LEVEL SECURITY (RLS) POLICIES
-- -----------------------------------------------------------------

-- PROFILES POLICIES
CREATE POLICY "Allow authenticated users to read all profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow user to insert their own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Allow user to update their own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- LIKES POLICIES
CREATE POLICY "Allow user to read their own likes" ON public.likes FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Allow user to insert their own likes" ON public.likes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Allow user to delete their own likes" ON public.likes FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- MATCHES POLICIES
CREATE POLICY "Allow user to see their own matches" ON public.matches FOR SELECT TO authenticated USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- MESSAGES POLICIES
CREATE POLICY "Allow user to see messages they sent or received" ON public.messages FOR SELECT TO authenticated USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Allow user to insert messages" ON public.messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = sender_id);


-- -----------------------------------------------------------------
-- 3. STORAGE
-- -----------------------------------------------------------------

-- Create a bucket for profile photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile_photos', 'profile_photos', true)
ON CONFLICT (id) DO NOTHING;

-- STORAGE POLICIES
CREATE POLICY "Allow authenticated users to view all profile photos" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'profile_photos');
CREATE POLICY "Allow user to upload their own profile photo" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'profile_photos' AND auth.uid() = (storage.foldername(name))[1]::uuid);
CREATE POLICY "Allow user to update their own profile photo" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'profile_photos' AND auth.uid() = (storage.foldername(name))[1]::uuid);


-- -----------------------------------------------------------------
-- 4. FUNCTIONS & TRIGGERS
-- -----------------------------------------------------------------

-- Function to create a new profile entry when a new user signs up.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function after a new user is created in auth.users.
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Function to create a match when a mutual like occurs.
CREATE OR REPLACE FUNCTION public.handle_new_like()
RETURNS TRIGGER AS $$
DECLARE
  match_exists boolean;
BEGIN
  -- Check if the liked user has also liked the current user
  IF EXISTS (SELECT 1 FROM public.likes WHERE user_id = NEW.liked_user_id AND liked_user_id = NEW.user_id) THEN
    -- To prevent duplicates, ensure the match is always stored with the smaller user_id first
    INSERT INTO public.matches (user1_id, user2_id)
    VALUES (
      LEAST(NEW.user_id, NEW.liked_user_id),
      GREATEST(NEW.user_id, NEW.liked_user_id)
    )
    ON CONFLICT (user1_id, user2_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function after a new like is inserted.
CREATE TRIGGER on_like_created
  AFTER INSERT ON public.likes
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_like();
