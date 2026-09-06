"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Spinner from "@/components/common/Spinner";

export default function HomePage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  useEffect(() => { if (!loading) router.replace(user ? "/boards" : "/login"); }, [user, loading, router]);
  return <div className="flex min-h-screen items-center justify-center"><Spinner size="lg" /></div>;
}
