"use client";
import { useState } from "react";
import Input from "@/components/common/Input";
import Textarea from "@/components/common/Textarea";
import Button from "@/components/common/Button";
export default function TaskForm({ initialTask, onSubmit, onCancel }) { const [title,setTitle]=useState(initialTask?.title||"");const [description,setDescription]=useState(initialTask?.description||"");const [loading,setLoading]=useState(false);async function submit(e){e.preventDefault();if(!title.trim())return;setLoading(true);try{await onSubmit({title:title.trim(),description:description.trim()||null})}finally{setLoading(false)}}return <form onSubmit={submit} className="space-y-4"><Input label="Title" value={title} onChange={e=>setTitle(e.target.value)} placeholder="Task title" autoFocus required/><Textarea label="Description" value={description} onChange={e=>setDescription(e.target.value)} placeholder="Add details (optional)"/><div className="flex justify-end gap-2"><Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button><Button loading={loading}>{initialTask?"Save changes":"Add task"}</Button></div></form>; }
