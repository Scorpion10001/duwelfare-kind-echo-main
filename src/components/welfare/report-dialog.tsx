import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Copy,
  HandHeart,
  LoaderCircle,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createTicketId,
  reportFormSchema,
  WELFARE_CATEGORIES,
  type ReportFormValues,
  type WelfareCategory,
} from "@/lib/welfare";
import { supabase } from "@/integrations/supabase/client";
import { Confetti } from "@/components/welfare/confetti";
import { categoryStyle } from "@/components/welfare/category-style";

type SubmissionKind = "report" | "suggestion";

type ReportDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  submissionKind: SubmissionKind;
  /** Jump straight to the details step with this category chosen. */
  initialCategory?: WelfareCategory | null;
};

const initialValues = (): ReportFormValues => ({
  category: "Hostel Welfare",
  concern: "",
  location: "",
  description: "",
  urgency: "normal",
});

const urgencyOptions = [
  { value: "low", label: "Not urgent", note: "When you have a moment" },
  { value: "normal", label: "Needs attention", note: "In the coming days" },
  { value: "high", label: "Time-sensitive", note: "Please review soon" },
  { value: "urgent", label: "Immediate safety", note: "A person may be at risk" },
] as const;

const slideVariants = {
  enter: (direction: number) => ({ opacity: 0, x: direction * 22 }),
  center: { opacity: 1, x: 0 },
  exit: (direction: number) => ({ opacity: 0, x: direction * -22 }),
};

export function ReportDialog({ open, onOpenChange, submissionKind, initialCategory }: ReportDialogProps) {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [values, setValues] = useState<ReportFormValues>(initialValues);
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [isSending, setIsSending] = useState(false);
  const isSuggestion = submissionKind === "suggestion";
  const totalSteps = isSuggestion ? 2 : 3;

  useEffect(() => {
    if (open && initialCategory && submissionKind === "report") {
      setValues((current) => ({ ...current, category: initialCategory, concern: "" }));
      setDirection(1);
      setStep(1);
    }
  }, [open, initialCategory, submissionKind]);

  const close = (nextOpen: boolean) => {
    onOpenChange(nextOpen);
    if (!nextOpen) {
      window.setTimeout(() => {
        setStep(0);
        setValues(initialValues());
        setTicketId(null);
        setError("");
      }, 180);
    }
  };

  const changeStep = (nextStep: number) => {
    setDirection(nextStep > step ? 1 : -1);
    setStep(nextStep);
    setError("");
  };

  const submit = async () => {
    const parsed = reportFormSchema.safeParse(values);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please check your answers.");
      return;
    }
    const savedCategory = isSuggestion ? "Suggestions and Recommendations" : parsed.data.category;
    setIsSending(true);
    setError("");
    const newTicket = createTicketId();
    const { error: sendError } = await supabase.from("welfare_reports").insert({
      ticket_id: newTicket,
      submission_kind: submissionKind,
      category: savedCategory,
      concern: parsed.data.concern,
      location: parsed.data.location || null,
      description: parsed.data.description,
      urgency: parsed.data.urgency,
    });
    setIsSending(false);
    if (sendError) {
      setError("Your message couldn't be sent just now. Please try again in a moment.");
      return;
    }
    setTicketId(newTicket);
  };

  const copyTicket = async () => {
    if (!ticketId) return;
    try {
      await navigator.clipboard.writeText(ticketId);
      toast.success("Your ticket ID has been copied.");
    } catch {
      toast.error("Please write down your ticket ID before closing.");
    }
  };

  const chooseConcern = (category: WelfareCategory, concern: string) => {
    setValues((current) => ({ ...current, category, concern }));
    changeStep(1);
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="w-[calc(100%-1rem)] max-w-2xl overflow-hidden border-border bg-card p-0 sm:rounded-2xl">
        {ticketId ? (
          <div className="relative px-6 py-12 text-center sm:px-12">
            <Confetti />
            <span className="mx-auto grid size-16 place-items-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-400 text-white shadow-lg">
              <CheckCircle2 className="size-8" />
            </span>
            <DialogHeader className="mt-6 items-center">
              <DialogTitle className="font-display text-3xl">You did a good thing.</DialogTitle>
              <DialogDescription className="max-w-md text-base leading-7">
                Your {isSuggestion ? "suggestion" : "report"} is safely with the welfare team.
                They can follow up here without knowing who you are.
              </DialogDescription>
            </DialogHeader>
            <div className="mx-auto mt-8 max-w-sm rounded-xl border border-dashed border-primary/35 bg-calm px-5 py-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Your private ticket ID
              </p>
              <p className="mt-2 font-mono text-2xl font-bold text-foreground">{ticketId}</p>
              <Button type="button" variant="outline" className="mt-4" onClick={copyTicket}>
                <Copy /> Copy ticket ID
              </Button>
            </div>
            <p className="mx-auto mt-5 flex max-w-sm items-start justify-center gap-2 text-sm leading-6 text-muted-foreground">
              <LockKeyhole className="mt-1 size-4 shrink-0 text-primary" />
              Save this ID to check for updates. We don't ask for your name or email, or attach an
              IP address to your report.
            </p>
            <Button type="button" className="mt-7" onClick={() => close(false)}>
              All done
            </Button>
          </div>
        ) : (
          <>
            <div className="px-6 pb-2 pt-7 sm:px-9">
              <div className="flex items-center justify-between gap-4">
                <div className="inline-flex items-center gap-2 rounded-full bg-calm px-3 py-1.5 text-xs font-semibold text-primary">
                  <ShieldCheck className="size-4" /> A private, anonymous space
                </div>
                <span className="text-sm tabular-nums text-muted-foreground">
                  {Math.min(step + 1, totalSteps)} <span className="text-border">/</span> {totalSteps}
                </span>
              </div>
              <DialogHeader className="mt-5 text-left">
                <DialogTitle className="font-display text-2xl sm:text-3xl">
                  {isSuggestion ? "An idea for a kinder campus" : "Let's make things better"}
                </DialogTitle>
                <DialogDescription className="text-sm leading-6">
                  {isSuggestion
                    ? "Share an idea or recommendation. No name or email needed."
                    : "Share what is happening, in your own words. No names or email needed."}
                </DialogDescription>
              </DialogHeader>
              <div className="mt-6 flex gap-2" aria-label={`Step ${step + 1} of ${totalSteps}`}>
                {Array.from({ length: totalSteps }, (_, index) => (
                  <span
                    key={index}
                    className={`h-2 flex-1 rounded-full transition-all duration-500 ${index <= step ? "bg-gradient-to-r from-sky-400 to-teal-400" : "bg-muted"}`}
                  />
                ))}
              </div>
            </div>

            <div className="min-h-[340px] overflow-y-auto px-6 py-4 sm:min-h-[350px] sm:px-9">
              <AnimatePresence mode="wait" custom={direction}>
                {step === 0 && !isSuggestion ? (
                  <motion.div
                    key="category"
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.2, ease: "easeOut" }}
                  >
                    <p className="mb-3 text-sm font-medium text-foreground">What would you like to talk about?</p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {WELFARE_CATEGORIES.map((category) => (
                        <button
                          type="button"
                          key={category.name}
                          onClick={() => chooseConcern(category.name, "")}
                          className={`group flex min-h-24 items-start gap-3 rounded-xl border p-3.5 text-left transition-colors hover:border-primary/40 hover:bg-calm ${values.category === category.name ? "border-primary/50 bg-calm" : "border-border bg-background"}`}
                        >
                          <span className={`mt-0.5 grid size-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br text-white shadow-sm ${categoryStyle(category.icon).gradient}`}>
                            {(() => {
                              const Icon = categoryStyle(category.icon).icon;
                              return <Icon className="size-4" />;
                            })()}
                          </span>
                          <span className="min-w-0">
                            <span className="block text-sm font-semibold leading-5 text-foreground">{category.name}</span>
                            <span className="mt-1 block text-xs leading-5 text-muted-foreground">{category.description}</span>
                          </span>
                          <ArrowRight className="ml-auto mt-1 size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                        </button>
                      ))}
                    </div>
                  </motion.div>
                ) : step === (isSuggestion ? 0 : 1) ? (
                  <motion.div
                    key="details"
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="space-y-5"
                  >
                    <div className="rounded-lg bg-calm px-4 py-3 text-sm text-foreground">
                      <span className="font-semibold">{isSuggestion ? "Suggestions and Recommendations" : values.category}</span>
                      {!isSuggestion && values.concern ? <span className="text-muted-foreground"> · {values.concern}</span> : null}
                    </div>
                    {isSuggestion ? (
                      <input type="hidden" value="Suggestions and Recommendations" readOnly />
                    ) : values.concern ? (
                      <div className="space-y-2">
                        <Label htmlFor="report-title">A short title</Label>
                        <Input
                          id="report-title"
                          maxLength={160}
                          placeholder="For example, water has been off in the west wing"
                          value={values.concern}
                          onChange={(event) => setValues({ ...values, concern: event.target.value })}
                          autoFocus
                        />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Label htmlFor="report-title">What is the main concern?</Label>
                        <Input
                          id="report-title"
                          maxLength={160}
                          placeholder="A few words to sum it up"
                          value={values.concern}
                          onChange={(event) => setValues({ ...values, concern: event.target.value })}
                          autoFocus
                        />
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="report-location">Where is it happening? <span className="font-normal text-muted-foreground">(optional)</span></Label>
                      <Input
                        id="report-location"
                        maxLength={160}
                        placeholder="A building, area or landmark"
                        value={values.location ?? ""}
                        onChange={(event) => setValues({ ...values, location: event.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-3">
                        <Label htmlFor="report-description">Tell us a little more</Label>
                        <span className="text-xs tabular-nums text-muted-foreground">{values.description.length}/5000</span>
                      </div>
                      <Textarea
                        id="report-description"
                        minLength={20}
                        maxLength={5000}
                        rows={4}
                        placeholder="What happened? What would help? Share only what feels comfortable."
                        value={values.description}
                        onChange={(event) => setValues({ ...values, description: event.target.value })}
                      />
                    </div>
                    <fieldset className="space-y-2">
                      <legend className="text-sm font-medium">How soon does this need attention?</legend>
                      <div className="grid grid-cols-2 gap-2">
                        {urgencyOptions.map((option) => (
                          <button
                            type="button"
                            key={option.value}
                            aria-pressed={values.urgency === option.value}
                            onClick={() => setValues({ ...values, urgency: option.value })}
                            className={`flex min-h-16 items-center gap-2 rounded-lg border px-3 py-2 text-left transition-colors ${values.urgency === option.value ? "border-primary/50 bg-calm" : "border-border bg-background hover:bg-muted/50"}`}
                          >
                            <span className={`grid size-5 shrink-0 place-items-center rounded-full border ${values.urgency === option.value ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}>
                              {values.urgency === option.value ? <Check className="size-3" /> : null}
                            </span>
                            <span className="min-w-0">
                              <span className="block text-sm font-semibold">{option.label}</span>
                              <span className="block text-xs text-muted-foreground">{option.note}</span>
                            </span>
                          </button>
                        ))}
                      </div>
                    </fieldset>
                  </motion.div>
                ) : (
                  <motion.div
                    key="review"
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="space-y-5"
                  >
                    <div className="rounded-xl border border-border bg-background p-4">
                      <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                        <HandHeart className="size-4" /> A quick check before we send
                      </div>
                      <p className="mt-3 font-semibold text-foreground">{values.concern}</p>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{values.description}</p>
                      <div className="mt-4 flex flex-wrap gap-2 text-xs">
                        <span className="rounded-full bg-calm px-3 py-1.5 font-medium text-primary">
                          {isSuggestion ? "Suggestions and Recommendations" : values.category}
                        </span>
                        <span className="rounded-full bg-muted px-3 py-1.5 text-muted-foreground">
                          {urgencyOptions.find((option) => option.value === values.urgency)?.label}
                        </span>
                        {values.location ? <span className="rounded-full bg-muted px-3 py-1.5 text-muted-foreground">{values.location}</span> : null}
                      </div>
                    </div>
                    <div className="flex items-start gap-3 rounded-xl bg-mint px-4 py-4 text-sm leading-6 text-foreground">
                      <LockKeyhole className="mt-1 size-4 shrink-0 text-primary" />
                      Your report is not linked to an account. Only the welfare team can read it.
                    </div>
                    <p className="text-xs leading-5 text-muted-foreground">
                      If anyone is in immediate danger, please contact campus security or local emergency services now.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
              {error ? <p className="mt-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">{error}</p> : null}
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-border px-6 py-4 sm:px-9">
              <Button
                type="button"
                variant="ghost"
                onClick={() => (step === 0 ? close(false) : changeStep(step - 1))}
              >
                {step === 0 ? "Not now" : <><ArrowLeft /> Back</>}
              </Button>
              {step < totalSteps - 1 ? (
                !isSuggestion && step === 0 ? (
                  <span className="text-xs text-muted-foreground">Pick a topic to continue</span>
                ) : (
                <Button
                  type="button"
                  onClick={() => {
                    if (!isSuggestion && step === 0) return;
                    if (step === (isSuggestion ? 0 : 1)) {
                      const parsed = reportFormSchema.safeParse(values);
                      if (!parsed.success) {
                        setError(parsed.error.issues[0]?.message ?? "Please check your answers.");
                        return;
                      }
                    }
                    changeStep(step + 1);
                  }}
                >
                  Review <ArrowRight />
                </Button>
                )
              ) : (
                <Button type="button" disabled={isSending} onClick={submit}>
                  {isSending ? <LoaderCircle className="animate-spin" /> : <CheckCircle2 />}
                  {isSending ? "Sending safely…" : "Send anonymously"}
                </Button>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}