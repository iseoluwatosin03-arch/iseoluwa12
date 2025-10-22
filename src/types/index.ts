// These types will align with your Supabase schema.

export interface Profile {
  id: string; // uuid
  email: string;
  full_name: string | null;
  gender: 'Male' | 'Female' | 'Other' | null;
  age: number | null;
  city: string | null;
  state: string | null;
  number_of_kids: number | null;
  co_parenting: boolean | null;
  about: string | null;
  photo_url: string | null;
  created_at: string; // timestamp
}

export interface Like {
  id: string; // uuid
  user_id: string; // uuid
  liked_user_id: string; // uuid
  type: 'like' | 'skip';
  created_at: string; // timestamp
}

export interface Match {
  id: string; // uuid
  user1_id: string; // uuid
  user2_id: string; // uuid
  created_at: string; // timestamp
  // Joined profile data
  user1?: Profile;
  user2?: Profile;
}

export interface Message {
  id: string; // uuid
  sender_id: string; // uuid
  receiver_id: string; // uuid
  message: string;
  created_at: string; // timestamp
}
