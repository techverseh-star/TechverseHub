// app/auth/reset/page.tsx
export const dynamic = "force-dynamic";

import ResetClient from "./ResetClient";

export default function ResetPage({ searchParams }: { searchParams: { token?: string } }) {
  const token = searchParams.token || null;

  return <ResetClient token={token} />;
}
