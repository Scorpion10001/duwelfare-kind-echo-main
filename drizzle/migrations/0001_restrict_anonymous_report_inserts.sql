REVOKE INSERT ON public.welfare_reports FROM anon;
GRANT INSERT (ticket_id, submission_kind, category, concern, location, description, urgency) ON public.welfare_reports TO anon;
GRANT INSERT (ticket_id, submission_kind, category, concern, location, description, urgency) ON public.welfare_reports TO authenticated;