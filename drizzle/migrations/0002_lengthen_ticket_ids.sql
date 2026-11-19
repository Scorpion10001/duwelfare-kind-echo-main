ALTER TABLE public.welfare_reports DROP CONSTRAINT IF EXISTS welfare_reports_ticket_id_check;
ALTER TABLE public.welfare_reports ADD CONSTRAINT welfare_reports_ticket_id_check CHECK (ticket_id ~ '^DW-[0-9A-HJKMNP-TV-Z]{4}-[0-9A-HJKMNP-TV-Z]{4}-[0-9A-HJKMNP-TV-Z]{4}$');

CREATE OR REPLACE FUNCTION public.get_welfare_ticket(_ticket_id text)
RETURNS TABLE (ticket_id text, status text, team_note text, created_at timestamptz)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT r.ticket_id, r.status, r.team_note, r.created_at
  FROM public.welfare_reports AS r
  WHERE r.ticket_id = upper(_ticket_id)
  LIMIT 1;
$$;
GRANT EXECUTE ON FUNCTION public.get_welfare_ticket(text) TO anon, authenticated;