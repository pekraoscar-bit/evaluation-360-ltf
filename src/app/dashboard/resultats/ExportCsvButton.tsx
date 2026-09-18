"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/Button";

type Row = { name: string; position: string; score: number | null; appreciation: string };

export function ExportCsvButton({ rows, campaignName }: { rows: Row[]; campaignName: string }) {
  function download() {
    const header = "Collaborateur;Poste;Score;Appréciation\n";
    const body = rows
      .map((r) => `${r.name};${r.position};${r.score != null ? r.score.toFixed(2) : ""};${r.appreciation}`)
      .join("\n");
    const blob = new Blob(["\uFEFF" + header + body], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `resultats-${campaignName.replace(/\s+/g, "-").toLowerCase()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Button variant="secondary" onClick={download} className="text-xs px-2.5 py-1.5">
      <Download size={13} />
      Exporter en CSV
    </Button>
  );
}
