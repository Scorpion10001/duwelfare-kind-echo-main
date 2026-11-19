import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import {
  ArrowRight,
  EyeOff,
  Lightbulb,
  LockKeyhole,
  Megaphone,
  MessageCircleHeart,
  Search,
  ShieldCheck,
  Sparkles,
  Ticket,
} from "lucide-react";
import { useEffect, useState } from "react";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { BreathingBubble } from "@/components/welfare/breathing-bubble";
import { categoryStyle } from "@/components/welfare/category-style";
import { MoodCheckin } from "@/components/welfare/mood-checkin";
import { ReportDialog } from "@/components/welfare/report-dialog";
import { SiteHeader } from "@/components/welfare/site-header";
import { supabase } from "@/integrations/supabase/client";
import { WELFARE_CATEGORIES, type WelfareCategory } from "@/lib/welfare";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Duwelfare – A safe space to speak up" },
      {
        name: "description",
        content:
          "Report welfare issues anonymously, track your report and share ideas. No login, name or email needed.",
      },
    ],
  }),
  component: Index,
});

type Announcement = { id: string; title: string; body: string; created_at: string };

const PROMISES = [
  "100% anonymous",
  "No login needed",
  "No name or email",
  "No IP address stored",
  "A real person reads every report",
  "Track progress with a private ticket",
];

const STEPS = [
  { icon: MessageCircleHeart, title: "Tell us what's happening", text: "Pick a topic and share it in your own words. Takes about two minutes.", color: "from-sky-400 to-cyan-400" },
  { icon: Ticket, title: "Keep your private ticket", text: "You get a secret ticket ID. It's the only link between you and your report.", color: "from-amber-400 to-orange-400" },
  { icon: Search, title: "Check for updates", text: "Come back any time and enter your ticket to see the team's progress and notes.", color: "from-violet-400 to-fuchsia-400" },
];

const FAQS = [
  { q: "Is it really anonymous?", a: "Yes. There's no account, and we never ask for your name, email or phone number. We don't attach an IP address to your report either." },
  { q: "What if I lose my ticket ID?", a: "Because we don't know who you are, we can't recover it. If you're worried, copy it or write it down when it appears." },
  { q: "Who sees my report?", a: "Only signed-in members of the welfare team. Reports are never shown publicly." },
  { q: "Is this for emergencies?", a: "No. If someone is in immediate danger, contact campus security or emergency services right away, then use Duwelfare to follow up." },
  { q: "Can I share an idea instead of a problem?", a: "Absolutely. Use “Share a suggestion” and tell us what would make campus kinder, safer or easier." },
];

function Index() {
  const [dialog, setDialog] = useState<null | "report" | "suggestion">(null);
  const [startCategory, setStartCategory] = useState<WelfareCategory | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [openCard, setOpenCard] = useState<string | null>(null);

  // 3D tilt on the hero image
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-8, 8]), { stiffness: 120, damping: 14 });
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [8, -8]), { stiffness: 120, damping: 14 });

  useEffect(() => {
    let cancelled = false;
    supabase
      .from("welfare_announcements")
      .select("id,title,body,created_at")
      .eq("published", true)
      .order("created_at", { ascending: false })
      .limit(4)
      .then(({ data }) => {
        if (!cancelled && data) setAnnouncements(data);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const openReport = (category: WelfareCategory | null = null) => {
    setStartCategory(category);
    setDialog("report");
  };

  return (
    <div className="min-h-screen overflow-x-clip bg-background">
      <SiteHeader />

      <main>
        {/* ---------- Hero ---------- */}
        <section className="relative">
          <div className="blob -left-20 top-0 size-80 bg-sky-300" />
          <div className="blob right-0 top-20 size-96 bg-violet-300 [animation-delay:-4s]" />
          <div className="blob bottom-0 left-1/3 size-72 bg-emerald-300 [animation-delay:-8s]" />

          <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 pb-20 pt-12 sm:px-6 md:grid-cols-2 md:pt-20">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <span className="inline-flex items-center gap-2 rounded-full bg-card/80 px-4 py-2 text-xs font-extrabold text-primary shadow-sm ring-1 ring-border backdrop-blur">
                <ShieldCheck className="size-4" /> 100% anonymous · no login needed
              </span>
              <h1 className="mt-6 font-display text-5xl font-bold leading-[1.05] sm:text-6xl">
                Your voice makes campus <span className="text-gradient">kinder</span>.
              </h1>
              <p className="mt-5 max-w-md text-lg leading-8 text-muted-foreground">
                Something not right? Tell the welfare team at your own pace. We never ask for your
                name, email or IP address.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                  <Button
                    size="lg"
                    className="h-14 w-full rounded-full border-0 bg-gradient-to-r from-sky-500 via-teal-500 to-emerald-500 px-8 text-base font-bold text-white shadow-xl shadow-teal-500/30 hover:opacity-95"
                    onClick={() => openReport()}
                  >
                    <Megaphone /> Report an issue
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="h-14 w-full rounded-full border-2 border-primary/30 bg-card/70 px-8 text-base font-bold backdrop-blur"
                  >
                    <Link to="/track">
                      <Search /> Track my report
                    </Link>
                  </Button>
                </motion.div>
              </div>
              <button
                type="button"
                onClick={() => setDialog("suggestion")}
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-sunny px-4 py-2 text-sm font-bold text-foreground transition-transform hover:scale-105"
              >
                <Lightbulb className="size-4 text-amber-500" /> Have an idea instead? Share a suggestion
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="relative [perspective:1000px]"
              onMouseMove={(event) => {
                const box = event.currentTarget.getBoundingClientRect();
                mx.set((event.clientX - box.left) / box.width - 0.5);
                my.set((event.clientY - box.top) / box.height - 0.5);
              }}
              onMouseLeave={() => {
                mx.set(0);
                my.set(0);
              }}
            >
              <motion.div style={{ rotateX, rotateY }} className="relative">
                <div className="absolute -inset-4 -z-10 rounded-[2.5rem] bg-gradient-to-br from-sky-300 via-teal-300 to-violet-300 opacity-60 blur-2xl" />
                <img
                  src="/images/duwelfare-campus.png"
                  alt="Students relaxing together on campus"
                  width={640}
                  height={480}
                  className="aspect-[4/3] w-full rounded-[2.5rem] border-4 border-card object-cover shadow-2xl"
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                  }}
                />
                <span className="animate-bob absolute -left-4 top-8 flex items-center gap-2 rounded-2xl bg-card px-3 py-2 text-sm font-bold shadow-lg">
                  <EyeOff className="size-4 text-violet-500" /> Anonymous
                </span>
                <span className="animate-bob absolute -right-3 top-1/2 flex items-center gap-2 rounded-2xl bg-card px-3 py-2 text-sm font-bold shadow-lg [animation-delay:-2s]">
                  <LockKeyhole className="size-4 text-emerald-500" /> Private
                </span>
                <span className="animate-bob absolute -bottom-4 left-10 flex items-center gap-2 rounded-2xl bg-card px-3 py-2 text-sm font-bold shadow-lg [animation-delay:-3.5s]">
                  <Sparkles className="size-4 text-amber-500" /> We listen
                </span>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ---------- Promise marquee ---------- */}
        <div className="overflow-hidden border-y border-border bg-gradient-to-r from-sky-500 via-teal-500 to-violet-500 py-3 text-white">
          <div className="animate-marquee flex w-max gap-10 whitespace-nowrap text-sm font-bold">
            {[...PROMISES, ...PROMISES, ...PROMISES, ...PROMISES].map((promise, index) => (
              <span key={index} className="flex items-center gap-10">
                {promise} <Sparkles className="size-4" />
              </span>
            ))}
          </div>
        </div>

        {/* ---------- Check-in + breathing ---------- */}
        <section className="mx-auto grid max-w-6xl gap-6 px-4 py-20 sm:px-6 md:grid-cols-[1.4fr_1fr]">
          <MoodCheckin
            onAction={(kind, personal) => {
              if (kind === "suggestion") setDialog("suggestion");
              else openReport(personal ? "Personal Welfare and Protection" : null);
            }}
          />
          <BreathingBubble />
        </section>

        {/* ---------- Categories ---------- */}
        <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
          <p className="text-xs font-extrabold uppercase tracking-widest text-primary">Seven areas</p>
          <h2 className="mt-1 font-display text-3xl font-bold sm:text-4xl">What can you report?</h2>
          <p className="mt-2 text-muted-foreground">Tap a card to see examples, then start a report in one click.</p>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {WELFARE_CATEGORIES.map((category, index) => {
              const style = categoryStyle(category.icon);
              const Icon = style.icon;
              const isOpen = openCard === category.name;
              return (
                <motion.div
                  key={category.name}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.4, delay: (index % 3) * 0.08 }}
                  whileHover={{ y: -6 }}
                  className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition-shadow hover:shadow-xl"
                >
                  <button
                    type="button"
                    onClick={() => setOpenCard(isOpen ? null : category.name)}
                    aria-expanded={isOpen}
                    className="block w-full p-6 text-left"
                  >
                    <span className={`grid size-14 place-items-center rounded-2xl bg-gradient-to-br text-white shadow-md ${style.gradient}`}>
                      <Icon className="size-7" />
                    </span>
                    <h3 className="mt-4 font-display text-xl font-semibold">{category.name}</h3>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">{category.description}</p>
                    <span className={`mt-3 inline-block rounded-full px-3 py-1 text-xs font-bold ${style.chip}`}>
                      {isOpen ? "Hide examples" : "See examples"}
                    </span>
                  </button>
                  <motion.div
                    initial={false}
                    animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6">
                      <ul className="space-y-1.5 text-sm text-foreground/80">
                        {category.details.map((detail) => (
                          <li key={detail} className="flex gap-2">
                            <span className={`mt-2 size-1.5 shrink-0 rounded-full bg-gradient-to-br ${style.gradient}`} />
                            {detail}
                          </li>
                        ))}
                      </ul>
                      <Button
                        type="button"
                        onClick={() => openReport(category.name)}
                        className={`mt-4 w-full rounded-full border-0 bg-gradient-to-r font-bold text-white ${style.gradient}`}
                      >
                        Report this <ArrowRight />
                      </Button>
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* ---------- How it works ---------- */}
        <section className="bg-gradient-to-b from-calm to-background py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="text-center font-display text-3xl font-bold sm:text-4xl">How it works</h2>
            <div className="mt-12 grid gap-8 md:grid-cols-3">
              {STEPS.map((step, index) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.12 }}
                  className="relative rounded-3xl bg-card p-7 pt-10 text-center shadow-sm"
                >
                  <span className={`absolute -top-7 left-1/2 grid size-14 -translate-x-1/2 place-items-center rounded-2xl bg-gradient-to-br text-white shadow-lg ${step.color}`}>
                    <step.icon className="size-7" />
                  </span>
                  <span className="font-display text-sm font-bold text-primary">Step {index + 1}</span>
                  <h3 className="mt-1 font-display text-xl font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.text}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- Announcements ---------- */}
        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">Welfare announcements</h2>
          {announcements.length === 0 ? (
            <p className="mt-6 rounded-3xl bg-sunny px-6 py-8 text-foreground/80">
              📣 No announcements yet. Updates on welfare programmes will appear here.
            </p>
          ) : (
            <div className="mt-8 grid gap-5 md:grid-cols-2">
              {announcements.map((item, index) => (
                <motion.article
                  key={item.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08 }}
                  className="rounded-3xl border border-border border-l-8 border-l-teal-400 bg-card p-6 shadow-sm"
                >
                  <p className="text-xs font-bold text-primary">{new Date(item.created_at).toLocaleDateString()}</p>
                  <h3 className="mt-1 font-display text-xl font-semibold">{item.title}</h3>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{item.body}</p>
                </motion.article>
              ))}
            </div>
          )}
        </section>

        {/* ---------- FAQ ---------- */}
        <section className="mx-auto max-w-3xl px-4 pb-20 sm:px-6">
          <h2 className="text-center font-display text-3xl font-bold sm:text-4xl">Good to know</h2>
          <Accordion type="single" collapsible className="mt-8 space-y-3">
            {FAQS.map((faq) => (
              <AccordionItem key={faq.q} value={faq.q} className="rounded-2xl border bg-card px-5">
                <AccordionTrigger className="text-left font-display text-base font-semibold hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-6 text-muted-foreground">{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        {/* ---------- Final call to action ---------- */}
        <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
          <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-sky-500 via-teal-500 to-violet-500 px-6 py-14 text-center text-white shadow-xl">
            <div className="blob -left-10 -top-10 size-60 bg-white/50" />
            <div className="blob -bottom-10 -right-10 size-60 bg-emerald-200/50 [animation-delay:-6s]" />
            <h2 className="relative font-display text-3xl font-bold sm:text-4xl">Ready when you are.</h2>
            <p className="relative mx-auto mt-3 max-w-md text-white/90">
              One honest message can change things for you and everyone around you.
            </p>
            <motion.div className="relative mt-8 inline-block" whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.96 }}>
              <Button
                size="lg"
                onClick={() => openReport()}
                className="h-14 rounded-full bg-white px-10 text-base font-bold text-teal-700 shadow-lg hover:bg-white/90"
              >
                <Megaphone /> Start a report
              </Button>
            </motion.div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-card py-8 text-center text-sm text-muted-foreground">
        <p>If anyone is in immediate danger, contact campus security or emergency services right away.</p>
        <p className="mt-2 font-display font-semibold text-primary">Duwelfare · made with care 💙</p>
      </footer>

      <ReportDialog
        open={dialog !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDialog(null);
            setStartCategory(null);
          }
        }}
        submissionKind={dialog ?? "report"}
        initialCategory={startCategory}
      />
    </div>
  );
}
