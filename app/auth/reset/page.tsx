// app/auth/reset/page.tsx
export const dynamic = "force-dynamic";

import { createClient } from "@supabase/supabase-js";
import ResetClient from "./ResetClient";

import { notFound } from "next/navigation";

export default async function ResetPage({ searchParams }: { searchParams: { token?: string } }) {
  const token = searchParams.token || null;

  if (!token) {
    notFound();
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: resetRow } = await supabase
    .from("password_resets")
    .select("*")
    .eq("token", token)
    .single();

  if (!resetRow) {
    notFound();
  }

  const expiresAtString = resetRow.expires_at.endsWith("Z")
    ? resetRow.expires_at
    : `${resetRow.expires_at}Z`;

  if (new Date(expiresAtString) < new Date()) {
    notFound();
  }

  return <ResetClient token={token} />;
}
