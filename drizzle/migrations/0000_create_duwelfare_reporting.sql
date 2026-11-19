CREATE TYPE public.app_role AS ENUM ('welfare_staff');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can read their own role" ON public.user_roles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

CREATE TABLE public.welfare_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id text NOT NULL UNIQUE CHECK (ticket_id ~ '^DW-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}$'),
  submission_kind text NOT NULL DEFAULT 'report' CHECK (submission_kind IN ('report', 'suggestion')),
  category text NOT NULL CHECK (category IN ('Hostel Welfare', 'Feeding and Nutrition Welfare', 'Security and Safety Welfare', 'Transportation Welfare', 'Financial and Personal Support Welfare', 'Personal Welfare and Protection', 'Academic Welfare', 'Suggestions and Recommendations')),
  concern text NOT NULL CHECK (char_length(concern) BETWEEN 2 AND 160),
  location text CHECK (location IS NULL OR char_length(location) <= 160),
  description text NOT NULL CHECK (char_length(description) BETWEEN 20 AND 5000),
  urgency text NOT NULL DEFAULT 'normal' CHECK (urgency IN ('low', 'normal', 'high', 'urgent')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'escalated', 'resolved')),
  team_note text CHECK (team_note IS NULL OR char_length(team_note) <= 1000),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.welfare_reports TO anon;
GRANT SELECT, UPDATE ON public.welfare_reports TO authenticated;
GRANT ALL ON public.welfare_reports TO service_role;
ALTER TABLE public.welfare_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit an anonymous welfare item" ON public.welfare_reports
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);
CREATE POLICY "Welfare staff can read reports" ON public.welfare_reports
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'welfare_staff'));
CREATE POLICY "Welfare staff can update reports" ON public.welfare_reports
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'welfare_staff'))
  WITH CHECK (public.has_role(auth.uid(), 'welfare_staff'));

CREATE OR REPLACE FUNCTION public.get_welfare_ticket(_ticket_id text)
RETURNS TABLE (ticket_id text, status text, team_note text, created_at timestamptz)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT r.ticket_id, r.status, r.team_note, r.created_at
  FROM public.welfare_reports AS r
  WHERE r.ticket_id = _ticket_id
    AND _ticket_id ~ '^DW-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}$'
  LIMIT 1;
$$;
GRANT EXECUTE ON FUNCTION public.get_welfare_ticket(text) TO anon, authenticated;

CREATE TABLE public.welfare_announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL CHECK (char_length(title) BETWEEN 3 AND 140),
  body text NOT NULL CHECK (char_length(body) BETWEEN 10 AND 3000),
  published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.welfare_announcements TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.welfare_announcements TO authenticated;
GRANT ALL ON public.welfare_announcements TO service_role;
ALTER TABLE public.welfare_announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read published announcements" ON public.welfare_announcements
  FOR SELECT TO anon, authenticated
  USING (published OR public.has_role(auth.uid(), 'welfare_staff'));
CREATE POLICY "Welfare staff can create announcements" ON public.welfare_announcements
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'welfare_staff'));
CREATE POLICY "Welfare staff can update announcements" ON public.welfare_announcements
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'welfare_staff'))
  WITH CHECK (public.has_role(auth.uid(), 'welfare_staff'));
CREATE POLICY "Welfare staff can delete announcements" ON public.welfare_announcements
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'welfare_staff'));

CREATE INDEX welfare_reports_created_at_idx ON public.welfare_reports (created_at DESC);
CREATE INDEX welfare_reports_status_idx ON public.welfare_reports (status);
CREATE INDEX welfare_reports_category_idx ON public.welfare_reports (category);
CREATE INDEX welfare_announcements_published_created_idx ON public.welfare_announcements (published, created_at DESC);