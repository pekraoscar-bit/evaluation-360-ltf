export type AppSettingsThresholds = {
  threshold_insuffisant_max: number;
  threshold_ameliorer_max: number;
  threshold_satisfaisant_max: number;
  threshold_bien_max: number;
};

export function getAppreciation(score: number, t: AppSettingsThresholds) {
  if (score <= t.threshold_insuffisant_max) return { label: "Insuffisant", color: "text-brand-danger bg-brand-danger/10" };
  if (score <= t.threshold_ameliorer_max) return { label: "À améliorer", color: "text-brand-warning bg-brand-warning/10" };
  if (score <= t.threshold_satisfaisant_max) return { label: "Satisfaisant", color: "text-foreground/70 bg-foreground/10" };
  if (score <= t.threshold_bien_max) return { label: "Bien", color: "text-brand-primary bg-brand-primary/10" };
  return { label: "Excellent", color: "text-brand-accent bg-brand-accent/10" };
}
