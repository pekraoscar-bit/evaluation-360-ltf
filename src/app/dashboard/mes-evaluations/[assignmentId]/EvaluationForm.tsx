"use client";

import { useMemo, useState, useTransition } from "react";
import { Loader2, Send, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { RATING_SCALE } from "@/types/database";
import { saveAnswer, submitEvaluation } from "./actions";

type Criterion = { id: string; name: string; description: string | null };
type Answer = { criterion_id: string; rating: number | null; comment: string | null };

export function EvaluationForm({
  assignmentId,
  criteria,
  initialAnswers,
  readOnly,
}: {
  assignmentId: string;
  criteria: Criterion[];
  initialAnswers: Answer[];
  readOnly: boolean;
}) {
  const initialMap = useMemo(() => {
    const m = new Map<string, { rating: number | null; comment: string }>();
    for (const c of criteria) m.set(c.id, { rating: null, comment: "" });
    for (const a of initialAnswers) {
      m.set(a.criterion_id, { rating: a.rating, comment: a.comment ?? "" });
    }
    return m;
  }, [criteria, initialAnswers]);

  const [values, setValues] = useState(initialMap);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(readOnly);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [pendingSubmit, startSubmitTransition] = useTransition();
  const [, startSaveTransition] = useTransition();

  const completedCount = [...values.values()].filter((v) => v.rating != null).length;
  const progress = criteria.length ? Math.round((completedCount / criteria.length) * 100) : 0;

  function setRating(criterionId: string, rating: number) {
    const current = values.get(criterionId) ?? { rating: null, comment: "" };
    const next = new Map(values);
    next.set(criterionId, { ...current, rating });
    setValues(next);
    setSavingId(criterionId);
    startSaveTransition(async () => {
      await saveAnswer(assignmentId, criterionId, rating, current.comment);
      setSavingId(null);
    });
  }

  function setComment(criterionId: string, comment: string) {
    const current = values.get(criterionId) ?? { rating: null, comment: "" };
    const next = new Map(values);
    next.set(criterionId, { ...current, comment });
    setValues(next);
  }

  function saveCommentOnBlur(criterionId: string) {
    const current = values.get(criterionId);
    if (!current) return;
    startSaveTransition(async () => {
      await saveAnswer(assignmentId, criterionId, current.rating, current.comment);
    });
  }

  function handleSubmit() {
    setSubmitError(null);
    startSubmitTransition(async () => {
      const res = await submitEvaluation(
        assignmentId,
        criteria.map((c) => c.id)
      );
      if (res.ok) {
        setSubmitted(true);
      } else {
        setSubmitError(res.error);
      }
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between text-sm mb-1.5">
          <span className="text-foreground/60">
            {completedCount} / {criteria.length} critères complétés
          </span>
          <span className="text-foreground/40">{progress}%</span>
        </div>
        <div className="h-2 rounded-full bg-foreground/10 overflow-hidden">
          <div
            className="h-full bg-brand-accent transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="space-y-4">
        {criteria.map((c) => {
          const v = values.get(c.id) ?? { rating: null, comment: "" };
          return (
            <div key={c.id} className="border border-brand-border rounded-xl p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-foreground text-sm">{c.name}</p>
                  {c.description && (
                    <p className="text-xs text-foreground/50 mt-0.5">{c.description}</p>
                  )}
                </div>
                {savingId === c.id && (
                  <Loader2 size={13} className="animate-spin text-foreground/30 mt-1 shrink-0" />
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {RATING_SCALE.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    disabled={submitted}
                    onClick={() => setRating(c.id, r.value)}
                    title={r.label}
                    className={`w-9 h-9 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                      v.rating === r.value
                        ? "bg-brand-primary text-white"
                        : "bg-foreground/5 text-foreground/60 hover:bg-foreground/10"
                    }`}
                  >
                    {r.value}
                  </button>
                ))}
                <span className="text-xs text-foreground/40 self-center ml-1">
                  {v.rating ? RATING_SCALE.find((r) => r.value === v.rating)?.label : "Non noté"}
                </span>
              </div>

              <textarea
                value={v.comment}
                disabled={submitted}
                onChange={(e) => setComment(c.id, e.target.value)}
                onBlur={() => saveCommentOnBlur(c.id)}
                placeholder="Commentaire (facultatif)"
                rows={2}
                className="w-full text-sm rounded-lg border border-brand-border bg-brand-surface px-3 py-2 disabled:opacity-50 disabled:bg-foreground/5"
              />
            </div>
          );
        })}
      </div>

      {submitted ? (
        <div className="flex items-center gap-2 text-sm text-brand-accent bg-brand-accent/10 rounded-lg px-4 py-3">
          <Check size={16} />
          Évaluation soumise.
        </div>
      ) : (
        <div className="space-y-2">
          {submitError && <p className="text-sm text-brand-danger">{submitError}</p>}
          <Button onClick={handleSubmit} disabled={pendingSubmit || completedCount < criteria.length}>
            {pendingSubmit ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            Soumettre l&apos;évaluation
          </Button>
        </div>
      )}
    </div>
  );
}
