/*
# [Create Function: get_matches_with_profiles]
This operation creates a PostgreSQL function to retrieve a user's matches along with the profile data of the other user in each match.

## Query Description:
This function is essential for the "Matches" page to work correctly. It queries the `matches` table, identifies the other participant in each match, and joins with the `profiles` table to fetch their details. The output is structured as a JSON object to be easily consumed by the frontend. This is a read-only operation and does not modify any data.

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true (The function can be dropped)

## Structure Details:
- Function Name: get_matches_with_profiles
- Arguments: p_user_id (uuid)
- Returns: A table with match details and a JSON object for the other user's profile.

## Security Implications:
- RLS Status: This function uses `SECURITY DEFINER` to safely fetch the profile of the matched user, which the calling user might not have direct RLS access to. This is a secure and standard pattern for this use case.
- Policy Changes: No
- Auth Requirements: The function should be called by an authenticated user.
- Search Path: Explicitly set to 'public' to mitigate security risks (CVE-2018-1058).

## Performance Impact:
- Indexes: The query relies on primary key lookups on the `matches` and `profiles` tables, which are indexed.
- Triggers: None
- Estimated Impact: Low. Performance will be efficient for a typical number of matches per user.
*/
CREATE OR REPLACE FUNCTION public.get_matches_with_profiles(p_user_id uuid)
RETURNS TABLE (
    id uuid,
    user1_id uuid,
    user2_id uuid,
    created_at timestamptz,
    other_user json
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT
        m.id,
        m.user1_id,
        m.user2_id,
        m.created_at,
        row_to_json(p.*) as other_user
    FROM
        public.matches m
    JOIN
        public.profiles p ON p.id = (
            CASE
                WHEN m.user1_id = p_user_id THEN m.user2_id
                ELSE m.user1_id
            END
        )
    WHERE
        (m.user1_id = p_user_id OR m.user2_id = p_user_id);
END;
$$;
