import React from "react";
import ResetClient from "./ResetClient"; // client component

export default function Page({ searchParams }: { searchParams?: { token?: string } }) {
  const token = searchParams?.token || null;
  return <ResetClient token={token} />;
}
