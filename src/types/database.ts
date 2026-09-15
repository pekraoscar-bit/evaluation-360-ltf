/**
 * Types Supabase générés à la main à partir de
 * supabase/migrations/0001_schema_initial.sql.
 *
 * À remplacer plus tard par `npx supabase gen types typescript` une fois le
 * CLI Supabase relié au projet (nécessite un accès réseau vers supabase.com,
 * indisponible dans l'environnement de génération de code utilisé ici).
 */

type Timestamp = string;

export type UserRole =
  | "drh"
  | "n1"
  | "collaborateur"
  | "evaluateur_pair"
  | "evaluateur_collaborateur";

export type EvaluationSourceType = "auto" | "collaborateurs" | "pairs" | "n_plus_1";
export type CampaignPeriod = "avril" | "juillet" | "octobre" | "janvier";
export type CampaignStatusType = "planifiee" | "ouverte" | "cloturee" | "prolongee";
export type EvaluationStatusType = "non_commencee" | "en_cours" | "soumise" | "validee";
export type ActionStatusType = "a_faire" | "en_cours" | "realise" | "reporte" | "abandonne";

interface Table<Row, Insert, Update = Partial<Insert>> {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
}

export type Database = {
  public: {
    Tables: {
      sites: Table<
        { id: string; name: string; created_at: Timestamp },
        { id?: string; name: string; created_at?: Timestamp }
      >;
      positions: Table<
        {
          id: string;
          name: string;
          active: boolean;
          display_order: number;
          created_at: Timestamp;
        },
        {
          id?: string;
          name: string;
          active?: boolean;
          display_order?: number;
          created_at?: Timestamp;
        }
      >;
      position_criteria: Table<
        {
          id: string;
          position_id: string;
          name: string;
          description: string | null;
          category: string | null;
          display_order: number;
          weight: number;
          active: boolean;
          created_at: Timestamp;
        },
        {
          id?: string;
          position_id: string;
          name: string;
          description?: string | null;
          category?: string | null;
          display_order?: number;
          weight?: number;
          active?: boolean;
          created_at?: Timestamp;
        }
      >;
      employees: Table<
        {
          id: string;
          matricule: string;
          full_name: string;
          position_id: string | null;
          site_id: string | null;
          manager_employee_id: string | null;
          user_id: string | null;
          active: boolean;
          created_at: Timestamp;
        },
        {
          id?: string;
          matricule: string;
          full_name: string;
          position_id?: string | null;
          site_id?: string | null;
          manager_employee_id?: string | null;
          user_id?: string | null;
          active?: boolean;
          created_at?: Timestamp;
        }
      >;
      profiles: Table<
        {
          id: string;
          employee_id: string | null;
          role: UserRole;
          full_name: string | null;
          created_at: Timestamp;
        },
        {
          id: string;
          employee_id?: string | null;
          role?: UserRole;
          full_name?: string | null;
          created_at?: Timestamp;
        }
      >;
      app_settings: Table<
        {
          id: number;
          weight_collaborateurs: number;
          weight_n1: number;
          weight_pairs: number;
          weight_auto: number;
          rating_min: number;
          rating_max: number;
          threshold_insuffisant_max: number;
          threshold_ameliorer_max: number;
          threshold_satisfaisant_max: number;
          threshold_bien_max: number;
          updated_at: Timestamp;
        },
        Partial<{
          id: number;
          weight_collaborateurs: number;
          weight_n1: number;
          weight_pairs: number;
          weight_auto: number;
          rating_min: number;
          rating_max: number;
          threshold_insuffisant_max: number;
          threshold_ameliorer_max: number;
          threshold_satisfaisant_max: number;
          threshold_bien_max: number;
          updated_at: Timestamp;
        }>
      >;
      evaluation_campaigns: Table<
        {
          id: string;
          name: string;
          year: number;
          period: CampaignPeriod;
          start_date: string | null;
          end_date: string | null;
          status: CampaignStatusType;
          created_at: Timestamp;
        },
        {
          id?: string;
          name: string;
          year: number;
          period: CampaignPeriod;
          start_date?: string | null;
          end_date?: string | null;
          status?: CampaignStatusType;
          created_at?: Timestamp;
        }
      >;
      evaluation_assignments: Table<
        {
          id: string;
          campaign_id: string;
          evaluatee_id: string;
          evaluator_id: string;
          source: EvaluationSourceType;
          created_at: Timestamp;
        },
        {
          id?: string;
          campaign_id: string;
          evaluatee_id: string;
          evaluator_id: string;
          source: EvaluationSourceType;
          created_at?: Timestamp;
        }
      >;
      evaluations: Table<
        {
          id: string;
          assignment_id: string;
          status: EvaluationStatusType;
          submitted_at: Timestamp | null;
          validated_at: Timestamp | null;
          created_at: Timestamp;
          updated_at: Timestamp;
        },
        {
          id?: string;
          assignment_id: string;
          status?: EvaluationStatusType;
          submitted_at?: Timestamp | null;
          validated_at?: Timestamp | null;
          created_at?: Timestamp;
          updated_at?: Timestamp;
        }
      >;
      evaluation_answers: Table<
        {
          id: string;
          evaluation_id: string;
          criterion_id: string;
          rating: number | null;
          comment: string | null;
          created_at: Timestamp;
          updated_at: Timestamp;
        },
        {
          id?: string;
          evaluation_id: string;
          criterion_id: string;
          rating?: number | null;
          comment?: string | null;
          created_at?: Timestamp;
          updated_at?: Timestamp;
        }
      >;
      action_plans: Table<
        {
          id: string;
          employee_id: string;
          campaign_id: string | null;
          created_at: Timestamp;
        },
        { id?: string; employee_id: string; campaign_id?: string | null; created_at?: Timestamp }
      >;
      action_items: Table<
        {
          id: string;
          action_plan_id: string;
          axe: string;
          objectif: string | null;
          action: string | null;
          responsable_employee_id: string | null;
          date_debut: string | null;
          date_cible: string | null;
          priorite: string | null;
          status: ActionStatusType;
          comment: string | null;
          created_at: Timestamp;
        },
        {
          id?: string;
          action_plan_id: string;
          axe: string;
          objectif?: string | null;
          action?: string | null;
          responsable_employee_id?: string | null;
          date_debut?: string | null;
          date_cible?: string | null;
          priorite?: string | null;
          status?: ActionStatusType;
          comment?: string | null;
          created_at?: Timestamp;
        }
      >;
      evaluation_interviews: Table<
        {
          id: string;
          employee_id: string;
          campaign_id: string;
          interview_date: string | null;
          points_forts: string | null;
          difficultes: string | null;
          axes_amelioration: string | null;
          objectifs: string | null;
          actions_decidees: string | null;
          commentaire_n1: string | null;
          commentaire_collaborateur: string | null;
          done: boolean;
          created_at: Timestamp;
        },
        {
          id?: string;
          employee_id: string;
          campaign_id: string;
          interview_date?: string | null;
          points_forts?: string | null;
          difficultes?: string | null;
          axes_amelioration?: string | null;
          objectifs?: string | null;
          actions_decidees?: string | null;
          commentaire_n1?: string | null;
          commentaire_collaborateur?: string | null;
          done?: boolean;
          created_at?: Timestamp;
        }
      >;
      notifications: Table<
        {
          id: string;
          employee_id: string;
          message: string;
          read: boolean;
          created_at: Timestamp;
        },
        { id?: string; employee_id: string; message: string; read?: boolean; created_at?: Timestamp }
      >;
      audit_logs: Table<
        {
          id: string;
          actor_user_id: string | null;
          action: string;
          details: Record<string, unknown> | null;
          created_at: Timestamp;
        },
        {
          id?: string;
          actor_user_id?: string | null;
          action: string;
          details?: Record<string, unknown> | null;
          created_at?: Timestamp;
        }
      >;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
      evaluation_source: EvaluationSourceType;
      campaign_period: CampaignPeriod;
      campaign_status: CampaignStatusType;
      evaluation_status: EvaluationStatusType;
      action_status: ActionStatusType;
    };
    CompositeTypes: Record<string, never>;
  };
};

/** Échelle de notation confirmée dans le fichier Excel (1 à 5). */
export const RATING_SCALE = [
  { value: 1, label: "Insuffisant" },
  { value: 2, label: "À améliorer" },
  { value: 3, label: "Satisfaisant" },
  { value: 4, label: "Bien" },
  { value: 5, label: "Excellent" },
] as const;

export type RatingValue = 1 | 2 | 3 | 4 | 5;

/** Pondération par défaut confirmée par les formules du fichier Excel. */
export const DEFAULT_WEIGHTS: Record<EvaluationSourceType, number> = {
  collaborateurs: 0.4,
  n_plus_1: 0.3,
  pairs: 0.15,
  auto: 0.15,
};

/** Seuils d'appréciation par défaut (modifiables par la DRH). */
export const DEFAULT_APPRECIATION_THRESHOLDS = [
  { min: 1.0, max: 1.99, label: "Insuffisant" },
  { min: 2.0, max: 2.99, label: "À améliorer" },
  { min: 3.0, max: 3.49, label: "Satisfaisant" },
  { min: 3.5, max: 4.49, label: "Bien" },
  { min: 4.5, max: 5.0, label: "Excellent" },
] as const;
