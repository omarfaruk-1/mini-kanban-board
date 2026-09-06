"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";
import Spinner from "@/components/common/Spinner";
import Button from "@/components/common/Button";

export default function VerifyEmailPage() {
  const params = useSearchParams(); const router = useRouter();
  const [state, setState] = useState({ loading: true, success: false, message: "Verifying your email..." });
  useEffect(() => {
    const token = params.get("token");
    if (!token) { setState({ loading: false, success: false, message: "Verification token is missing." }); return; }
    authService.verifyEmail(token).then((res) => setState({ loading: false, success: true, message: res.message || "Email verified successfully." })).catch((e) => setState({ loading: false, success: false, message: e.message }));
  }, [params]);
  return <main className="flex min-h-screen items-center justify-center bg-slate-950 p-6"><div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-2xl"><div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-2xl">✓</div><h1 className="text-2xl font-bold text-slate-900">Email verification</h1><div className="mt-5">{state.loading ? <Spinner size="lg" /> : <p className="text-sm text-slate-600">{state.message}</p>}</div>{!state.loading && <Button className="mt-7 w-full" onClick={() => router.push("/login")}>Continue to login</Button>}</div></main>;
}
