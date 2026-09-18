import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const COLORS = {
  primary: "#0f3d5c",
  accent: "#2ea16d",
  border: "#e2e8f0",
  textMuted: "#64748b",
};

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 10, fontFamily: "Helvetica", color: "#0f172a" },
  headerBrand: { fontSize: 9, color: COLORS.primary, fontFamily: "Helvetica-Bold" },
  headerTitle: { fontSize: 16, fontFamily: "Helvetica-Bold", marginTop: 2, marginBottom: 12 },
  metaRow: { flexDirection: "row", flexWrap: "wrap", marginBottom: 16, gap: 16 },
  metaItem: { marginRight: 20 },
  metaLabel: { fontSize: 8, color: COLORS.textMuted },
  metaValue: { fontSize: 10, fontFamily: "Helvetica-Bold" },
  scoreBox: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    padding: 14,
    alignItems: "center",
    marginBottom: 18,
  },
  scoreValue: { fontSize: 28, fontFamily: "Helvetica-Bold", color: COLORS.primary },
  scoreAppreciation: { fontSize: 11, color: COLORS.accent, marginTop: 4, fontFamily: "Helvetica-Bold" },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    marginTop: 16,
    marginBottom: 6,
    color: COLORS.primary,
  },
  table: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 4 },
  tableRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: COLORS.border },
  tableRowLast: { flexDirection: "row" },
  tableHeaderCell: {
    padding: 6,
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: COLORS.textMuted,
    backgroundColor: "#f8fafc",
  },
  tableCell: { padding: 6, fontSize: 9 },
  colCriterion: { flex: 3 },
  colScore: { flex: 1, textAlign: "center" },
  paragraph: { fontSize: 9.5, lineHeight: 1.5, color: "#1e293b" },
  emptyText: { fontSize: 9, color: COLORS.textMuted, fontStyle: "italic" },
  actionRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: COLORS.border, padding: 6 },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 32,
    right: 32,
    fontSize: 7,
    color: COLORS.textMuted,
    textAlign: "center",
  },
});

export type ReportCriterion = {
  criterion_name: string;
  score_collaborateurs: number | null;
  score_pairs: number | null;
  score_n1: number | null;
  score_auto: number | null;
  weighted_score: number | null;
};

export type ReportActionItem = {
  axe: string;
  objectif: string | null;
  action: string | null;
  status: string;
  date_cible: string | null;
};

export type ReportProps = {
  employeeName: string;
  position: string;
  site: string;
  campaignName: string;
  overallScore: number | null;
  appreciationLabel: string | null;
  criteria: ReportCriterion[];
  pointsForts: string | null;
  axesAmelioration: string | null;
  commentaireN1: string | null;
  commentaireCollaborateur: string | null;
  interviewDate: string | null;
  actionItems: ReportActionItem[];
  generatedAt: string;
};

const fmt = (n: number | null) => (n != null ? n.toFixed(1) : "—");

export function EvaluationReportDocument(props: ReportProps) {
  return (
    <Document title={`Évaluation 360° — ${props.employeeName}`}>
      <Page size="A4" style={styles.page}>
        <Text style={styles.headerBrand}>LA TULIPE FOOD</Text>
        <Text style={styles.headerTitle}>Évaluation 360°</Text>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Collaborateur</Text>
            <Text style={styles.metaValue}>{props.employeeName}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Poste</Text>
            <Text style={styles.metaValue}>{props.position}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Site</Text>
            <Text style={styles.metaValue}>{props.site}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Campagne</Text>
            <Text style={styles.metaValue}>{props.campaignName}</Text>
          </View>
        </View>

        <View style={styles.scoreBox}>
          <Text style={styles.scoreValue}>
            {props.overallScore != null ? props.overallScore.toFixed(2) : "—"} / 5
          </Text>
          {props.appreciationLabel && (
            <Text style={styles.scoreAppreciation}>{props.appreciationLabel}</Text>
          )}
        </View>

        <Text style={styles.sectionTitle}>Résultats par critère</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={[styles.tableHeaderCell, styles.colCriterion]}>Critère</Text>
            <Text style={[styles.tableHeaderCell, styles.colScore]}>Collab.</Text>
            <Text style={[styles.tableHeaderCell, styles.colScore]}>Pairs</Text>
            <Text style={[styles.tableHeaderCell, styles.colScore]}>N+1</Text>
            <Text style={[styles.tableHeaderCell, styles.colScore]}>Auto</Text>
            <Text style={[styles.tableHeaderCell, styles.colScore]}>Pondéré</Text>
          </View>
          {props.criteria.map((c, i) => (
            <View
              key={i}
              style={i === props.criteria.length - 1 ? styles.tableRowLast : styles.tableRow}
            >
              <Text style={[styles.tableCell, styles.colCriterion]}>{c.criterion_name}</Text>
              <Text style={[styles.tableCell, styles.colScore]}>{fmt(c.score_collaborateurs)}</Text>
              <Text style={[styles.tableCell, styles.colScore]}>{fmt(c.score_pairs)}</Text>
              <Text style={[styles.tableCell, styles.colScore]}>{fmt(c.score_n1)}</Text>
              <Text style={[styles.tableCell, styles.colScore]}>{fmt(c.score_auto)}</Text>
              <Text style={[styles.tableCell, styles.colScore]}>{fmt(c.weighted_score)}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Points forts</Text>
        <Text style={props.pointsForts ? styles.paragraph : styles.emptyText}>
          {props.pointsForts || "Non renseigné."}
        </Text>

        <Text style={styles.sectionTitle}>Axes d&apos;amélioration</Text>
        <Text style={props.axesAmelioration ? styles.paragraph : styles.emptyText}>
          {props.axesAmelioration || "Non renseigné."}
        </Text>

        <Text style={styles.sectionTitle}>Plan d&apos;action</Text>
        {props.actionItems.length > 0 ? (
          <View style={styles.table}>
            {props.actionItems.map((a, i) => (
              <View key={i} style={styles.actionRow}>
                <Text style={{ flex: 1, fontSize: 9 }}>
                  {a.axe}
                  {a.objectif ? ` — ${a.objectif}` : ""}
                </Text>
                <Text style={{ width: 70, fontSize: 8, color: COLORS.textMuted }}>{a.status}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.emptyText}>Aucune action définie pour l&apos;instant.</Text>
        )}

        <Text style={styles.sectionTitle}>
          Entretien{props.interviewDate ? ` — ${props.interviewDate}` : ""}
        </Text>
        <Text style={{ ...styles.paragraph, marginBottom: 4 }}>
          Commentaire du N+1 : {props.commentaireN1 || "—"}
        </Text>
        <Text style={styles.paragraph}>
          Commentaire du collaborateur : {props.commentaireCollaborateur || "—"}
        </Text>

        <Text style={styles.footer} fixed>
          LA TULIPE FOOD — Évaluation 360° des Responsables · Document généré le {props.generatedAt} ·
          Confidentiel
        </Text>
      </Page>
    </Document>
  );
}
