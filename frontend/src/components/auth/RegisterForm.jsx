"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { authService } from "@/services/auth.service";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import AuthShell from "./AuthShell";
export default function RegisterForm() { const router=useRouter(); const [form,setForm]=useState({name:"",email:"",password:""}); const [loading,setLoading]=useState(false); const submit=async e=>{e.preventDefault();setLoading(true);try{await authService.register(form);toast.success("Verification email sent");router.replace("/login");}catch(e){toast.error(e.message)}finally{setLoading(false)}};return <AuthShell title="Create your account" subtitle="Start organizing your work in minutes." footer={<>Already have an account? <Link className="font-semibold text-indigo-600" href="/login">Sign in</Link></>}><form onSubmit={submit} className="space-y-5"><Input label="Name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Your name" required/><Input label="Email" type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="you@example.com" required/><Input label="Password" type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} placeholder="Create a password" minLength={6} required/><Button loading={loading} className="w-full">Create account</Button></form></AuthShell>; }
