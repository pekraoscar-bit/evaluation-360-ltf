import { ClipboardCheck } from "lucide-react";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { createClient } from "@/lib/supabase/server";
import { LoginForm } from "./LoginForm";

export default async function LoginPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <Card className="max-w-sm w-full p-8 space-y-6">
        <div className="text-center space-y-3">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary">
            <ClipboardCheck size={28} />
          </div>
          <div>
            <p className="text-sm font-medium text-brand-primary">
              LA TULIPE FOOD
            </p>
            <h1 className="text-lg font-semibold text-foreground">
              Évaluation 360° des Responsables
            </h1>
          </div>
        </div>
        <LoginForm />
      </Card>
    </main>
  );
}
