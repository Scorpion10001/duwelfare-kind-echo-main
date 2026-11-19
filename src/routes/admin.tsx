import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, CheckCircle2, Clock, Inbox, LoaderCircle, LogOut, Save } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { SiteHeader } from "@/components/welfare/site-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { formatReportStatus, REPORT_STATUSES, WELFARE_CATEGORIES } from "@/lib/welfare";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Staff dashboard – Duwelfare" }, { name: "robots", content: "noindex" }],
  }),
  component: AdminPage,
});

type Report = Tables<"welfare_reports">;
type AuthState = "loading" | "signed_out" | "not_staff" | "staff";

const URGENCY_ORDER = ["urgent", "high", "normal", "low"];
const URGENCY_BORDER: Record<string, string> = {
  urgent: "border-l-red-500",
  high: "border-l-orange-400",
  normal: "border-l-sky-400",
  low: "border-l-emerald-400",
};
const selectClass =
  "h-10 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring";

function AdminPage() {
  const [auth, setAuth] = useState<AuthState>("loading");

  const check = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    const user = data.session?.user;
    if (!user) return setAuth("signed_out");
    const { data: isStaff } = await supabase.rpc("has_role", { _user_id: user.id, _role: "welfare_staff" });
    setAuth(isStaff ? "staff" : "not_staff");
  }, []);

  useEffect(() => {
    void check();
    const { data } = supabase.auth.onAuthStateChange(() => {
      // defer: never call supabase inside the auth callback directly
      setTimeout(() => void check(), 0);
    });
    return () => data.subscription.unsubscribe();
  }, [check]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-calm via-background to-lilac/40">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        {auth === "loading" ? (
          <LoaderCircle className="mx-auto mt-20 animate-spin text-primary" />
        ) : auth === "signed_out" ? (
          <LoginForm />
        ) : auth === "not_staff" ? (
          <div className="mx-auto max-w-md rounded-2xl bg-card p-6 text-center shadow-sm">
            <h1 className="font-display text-xl font-bold">No access yet</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              This account isn't on the welfare team. Ask an administrator to add the welfare_staff role.
            </p>
            <Button className="mt-4" variant="outline" onClick={() => supabase.auth.signOut()}>
              Sign out
            </Button>
          </div>
        ) : (
          <Dashboard />
        )}
      </main>
    </div>
  );
}

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (signInError) setError("Those details didn't match. Please try again.");
  };

  return (
    <form onSubmit={submit} className="mx-auto max-w-sm space-y-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
      <h1 className="font-display text-2xl font-bold">Welfare team login</h1>
      <Input type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
      <Input type="password" required placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
      {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
      <Button type="submit" className="w-full" disabled={busy}>
        {busy ? <LoaderCircle className="animate-spin" /> : null} Sign in
      </Button>
    </form>
  );
}

function Dashboard() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("all");
  const [urgency, setUrgency] = useState("all");
  const [status, setStatus] = useState("all");

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("welfare_reports")
      .select("*")
      .order("created_at", { ascending: false });
    setLoading(false);
    if (error) toast.error("Couldn't load reports.");
    else setReports(data ?? []);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const visible = reports
    .filter((r) => (category === "all" || r.category === category) && (urgency === "all" || r.urgency === urgency) && (status === "all" || r.status === status))
    .sort((a, b) => URGENCY_ORDER.indexOf(a.urgency) - URGENCY_ORDER.indexOf(b.urgency));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-bold">Reports ({visible.length})</h1>
        <Button variant="outline" onClick={() => supabase.auth.signOut()}>
          <LogOut /> Sign out
        </Button>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: "Total", value: reports.length, icon: Inbox, color: "from-sky-400 to-cyan-400" },
          { label: "Waiting", value: reports.filter((r) => r.status === "pending").length, icon: Clock, color: "from-amber-400 to-orange-400" },
          { label: "Urgent", value: reports.filter((r) => r.urgency === "urgent" && r.status !== "resolved").length, icon: AlertTriangle, color: "from-rose-400 to-red-400" },
          { label: "Resolved", value: reports.filter((r) => r.status === "resolved").length, icon: CheckCircle2, color: "from-emerald-400 to-teal-400" },
        ].map((tile) => (
          <div key={tile.label} className={`flex items-center gap-3 rounded-2xl bg-gradient-to-br p-4 text-white shadow-md ${tile.color}`}>
            <tile.icon className="size-7 shrink-0 opacity-90" />
            <div>
              <p className="font-display text-2xl font-bold leading-none">{tile.value}</p>
              <p className="mt-1 text-xs font-semibold text-white/90">{tile.label}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        <select className={selectClass} value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Category">
          <option value="all">All categories</option>
          {[...WELFARE_CATEGORIES.map((c) => c.name), "Suggestions and Recommendations"].map((name) => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
        <select className={selectClass} value={urgency} onChange={(e) => setUrgency(e.target.value)} aria-label="Urgency">
          <option value="all">Any urgency</option>
          {URGENCY_ORDER.map((u) => <option key={u} value={u}>{formatReportStatus(u)}</option>)}
        </select>
        <select className={selectClass} value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status">
          <option value="all">Any status</option>
          {REPORT_STATUSES.map((s) => <option key={s} value={s}>{formatReportStatus(s)}</option>)}
        </select>
      </div>
      {loading ? (
        <LoaderCircle className="mx-auto mt-16 animate-spin text-primary" />
      ) : visible.length === 0 ? (
        <p className="mt-8 rounded-2xl bg-card p-6 text-muted-foreground">No reports match these filters.</p>
      ) : (
        <div className="mt-6 space-y-4">
          {visible.map((report) => (
            <ReportCard key={report.id} report={report} onSaved={load} />
          ))}
        </div>
      )}
    </div>
  );
}

function ReportCard({ report, onSaved }: { report: Report; onSaved: () => void }) {
  const [status, setStatus] = useState(report.status);
  const [note, setNote] = useState(report.team_note ?? "");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("welfare_reports")
      .update({ status, team_note: note.trim() || null, updated_at: new Date().toISOString() })
      .eq("id", report.id);
    setSaving(false);
    if (error) return toast.error("Couldn't save changes.");
    toast.success("Saved.");
    onSaved();
  };

  return (
    <article className={`rounded-2xl border border-border border-l-8 bg-card p-5 shadow-sm ${URGENCY_BORDER[report.urgency] ?? "border-l-slate-300"}`}>
      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
        <span className="rounded-full bg-calm px-3 py-1 text-primary">{report.category}</span>
        <span className={`rounded-full px-3 py-1 ${report.urgency === "urgent" ? "bg-destructive text-destructive-foreground" : "bg-muted text-muted-foreground"}`}>
          {formatReportStatus(report.urgency)}
        </span>
        <span className="rounded-full bg-muted px-3 py-1 text-muted-foreground">{report.submission_kind}</span>
        <span className="ml-auto font-mono text-muted-foreground">{report.ticket_id}</span>
      </div>
      <h2 className="mt-3 font-display text-lg font-semibold">{report.concern}</h2>
      {report.location ? <p className="text-xs text-muted-foreground">📍 {report.location}</p> : null}
      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{report.description}</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-[180px_1fr_auto]">
        <select className={selectClass} value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status">
          {REPORT_STATUSES.map((s) => <option key={s} value={s}>{formatReportStatus(s)}</option>)}
        </select>
        <Textarea rows={2} maxLength={1000} placeholder="Note visible to the student" value={note} onChange={(e) => setNote(e.target.value)} />
        <Button onClick={save} disabled={saving}>
          {saving ? <LoaderCircle className="animate-spin" /> : <Save />} Save
        </Button>
      </div>
    </article>
  );
}
