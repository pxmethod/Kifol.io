import { redirect } from "next/navigation";
import { createClient } from "@kifolio/supabase/server";

export default async function OrgsHomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard/overview");
  }
  redirect("/login");
}
