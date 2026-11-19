import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { CheckCircle2, LoaderCircle, Search } from "lucide-react";
import { useState } from "react";

import { Confetti } from "@/components/welfare/confetti";
import { SiteHeader } from "@/components/welfare/site-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { formatReportStatus, isTicketId, normalizeTicketId, REPORT_STATUSES } from "@/lib/welfare";

export const Route = createFileRoute("/track")({
  head: () => ({
    meta: [
      { title: "Track a report – Duwelfare" },
      { name: "description", content: "Enter your private ticket ID to see the status of your report." },
    ],
  }),
  component: TrackPage,
});

type Ticket = { ticket_id: string; status: string; team_note: string | null; created_at: string };

function TrackPage() {
  const [value, setValue] = useState("");
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const lookup = async (event: React.FormEvent) => {
    event.preventDefault();
    setTicket(null);
    const id = normalizeTicketId(value);
    if (!isTicketId(id)) {
      setMessage("That doesn't look like a ticket ID. It looks like DW-AB12-CD34-EF56.");
      return;
    }
    setLoading(true);
    setMessage("");
    const { data, error } = await supabase.rpc("get_welfare_ticket", { _ticket_id: id });
    setLoading(false);
    if (error) {
      setMessage("We couldn't check that just now. Please try again in a moment.");
      return;
    }
    const row = data?.[0];
    if (!row) {
      setMessage("We couldn't find that ticket. Please check the ID and try again.");
      return;
    }
    setTicket(row);
  };

  const currentIndex = ticket ? REPORT_STATUSES.indexOf(ticket.status as (typeof REPORT_STATUSES)[number]) : -1;

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-calm to-background">
      <div className="blob -right-10 top-24 size-72 bg-violet-300" />
      <div className="blob -left-16 top-1/2 size-72 bg-sky-300 [animation-delay:-5s]" />
      <SiteHeader />
      <main className="relative mx-auto max-w-xl px-4 py-12 sm:px-6">
        <h1 className="font-display text-4xl font-bold">Track your <span className="text-gradient">report</span></h1>
        <p className="mt-2 text-muted-foreground">
          Enter the private ticket ID you saved. We don't know who you are, so only you can check it.
        </p>
        <form onSubmit={lookup} className="mt-6 flex gap-2">
          <Input
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="DW-XXXX-XXXX-XXXX"
            className="h-12 rounded-full bg-card px-5 font-mono"
            aria-label="Ticket ID"
          />
          <Button type="submit" disabled={loading} className="h-12 rounded-full px-6">
            {loading ? <LoaderCircle className="animate-spin" /> : <Search />} Check
          </Button>
        </form>
        {message ? (
          <p role="alert" className="mt-4 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {message}
          </p>
        ) : null}
        {ticket ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative mt-8 overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-xl"
          >
            {ticket.status === "resolved" ? <Confetti pieces={28} /> : null}
            <p className="font-mono text-sm text-muted-foreground">{ticket.ticket_id}</p>
            <p className="mt-1 font-display text-3xl font-bold text-gradient">
              {formatReportStatus(ticket.status)}
            </p>
            <ol className="mt-5 grid grid-cols-4 gap-2">
              {REPORT_STATUSES.map((status, index) => (
                <li key={status} className="text-center">
                  <span
                    className={`mx-auto grid size-8 place-items-center rounded-full text-xs font-bold ${index <= currentIndex ? "bg-gradient-to-br from-sky-400 to-teal-400 text-white shadow-md" : "bg-muted text-muted-foreground"}`}
                  >
                    {index <= currentIndex ? <CheckCircle2 className="size-4" /> : index + 1}
                  </span>
                  <span className="mt-1 block text-[11px] font-semibold text-muted-foreground">
                    {formatReportStatus(status)}
                  </span>
                </li>
              ))}
            </ol>
            <div className="mt-6 rounded-xl bg-calm p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Note from the welfare team
              </p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6">
                {ticket.team_note || "No note yet. We'll add one here as soon as we have an update."}
              </p>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Submitted {new Date(ticket.created_at).toLocaleDateString()}
            </p>
          </motion.div>
        ) : null}
      </main>
    </div>
  );
}
