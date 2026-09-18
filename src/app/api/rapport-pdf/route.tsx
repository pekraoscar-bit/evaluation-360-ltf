import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { createClient } from "@/lib/supabase/server";
import { getAppreciation } from "@/lib/scores/appreciation";
import { EvaluationReportDocument, type ReportActionItem } from "@/lib/pdf/ReportDocument";

export async function GET(request: NextRequest) {
  const employeeId = request.nextUrl.searchParams.get("employe");
  const campaignId = request.nextUrl.searchParams.get("campagne");

  if (!employeeId || !campaignId) {
    return NextResponse.json({ error: "Paramètres manquants." }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, employee_id")
    .eq("id", user.id)
    .maybeSingle();

  // Contrôle d'accès explicite : la personne elle-même ou la DRH uniquement
  // (même règle que la fonction SQL get_evaluatee_scores, vérifiée ici en
  // plus par prudence puisque cette route sert un fichier téléchargeable).
  const authorized = profile?.role === "drh" || profile?.employee_id === employeeId;
  if (!authorized) {
    return NextResponse.json({ error: "Accès non autorisé." }, { status: 403 });
  }

  const [
    { data: employee },
    { data: positions },
    { data: sites },
    { data: campaign },
    { data: criteria, error: scoresError },
    { data: settings },
    { data: interview },
    { data: plans },
  ] = await Promise.all([
    supabase.from("employees").select("full_name, position_id, site_id").eq("id", employeeId).maybeSingle(),
    supabase.from("positions").select("id, name"),
    supabase.from("sites").select("id, name"),
    supabase.from("evaluation_campaigns").select("name").eq("id", campaignId).maybeSingle(),
    supabase.rpc("get_evaluatee_scores", { p_campaign_id: campaignId, p_evaluatee_id: employeeId }),
    supabase.from("app_settings").select("*").eq("id", 1).maybeSingle(),
    supabase
      .from("evaluation_interviews")
      .select("interview_date, points_forts, axes_amelioration, commentaire_n1, commentaire_collaborateur")
      .eq("employee_id", employeeId)
      .eq("campaign_id", campaignId)
      .maybeSingle(),
    supabase.from("action_plans").select("id").eq("employee_id", employeeId),
  ]);

  if (scoresError) {
    return NextResponse.json({ error: scoresError.message }, { status: 403 });
  }

  const planIds = (plans ?? []).map((p) => p.id);
  const { data: actionItems } = planIds.length
    ? await supabase
        .from("action_items")
        .select("axe, objectif, action, status, date_cible")
        .in("action_plan_id", planIds)
    : { data: [] };

  const positionName = employee?.position_id
    ? positions?.find((p) => p.id === employee.position_id)?.name ?? "—"
    : "—";
  const siteName = employee?.site_id ? sites?.find((s) => s.id === employee.site_id)?.name ?? "—" : "—";

  const scoreRows = criteria ?? [];
  const validScores = scoreRows.map((r) => r.weighted_score).filter((s): s is number => s != null);
  const overallScore = validScores.length
    ? validScores.reduce((sum, s) => sum + s, 0) / validScores.length
    : null;
  const appreciation = overallScore != null && settings ? getAppreciation(overallScore, settings) : null;

  const buffer = await renderToBuffer(
    <EvaluationReportDocument
      employeeName={employee?.full_name ?? "—"}
      position={positionName}
      site={siteName}
      campaignName={campaign?.name ?? "—"}
      overallScore={overallScore}
      appreciationLabel={appreciation?.label ?? null}
      criteria={scoreRows}
      pointsForts={interview?.points_forts ?? null}
      axesAmelioration={interview?.axes_amelioration ?? null}
      commentaireN1={interview?.commentaire_n1 ?? null}
      commentaireCollaborateur={interview?.commentaire_collaborateur ?? null}
      interviewDate={interview?.interview_date ?? null}
      actionItems={(actionItems ?? []) as ReportActionItem[]}
      generatedAt={new Date().toLocaleDateString("fr-FR")}
    />
  );

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="evaluation-360-${(employee?.full_name ?? "rapport").replace(/\s+/g, "-")}.pdf"`,
    },
  });
}
