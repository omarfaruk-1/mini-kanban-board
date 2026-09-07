"use client";
import { useState } from "react";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
export default function BoardForm({ initialTitle = "", onSubmit, onCancel }) {
  const [title, setTitle] = useState(initialTitle);
  const [loading, setLoading] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    try {
      await onSubmit(title.trim());
    } finally {
      setLoading(false);
    }
  };
  return (
    <form onSubmit={submit} className="space-y-5">
      <Input
        label="Board title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="e.g. Product launch"
        autoFocus
        required
      />
      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button loading={loading}>
          {initialTitle ? "Save changes" : "Create board"}
        </Button>
      </div>
    </form>
  );
}
