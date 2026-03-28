import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useCreatePaste } from "../hooks/useQueries";

export function CreatePastePage() {
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();
  const { mutateAsync, isPending } = useCreatePaste();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  // Redirect if not logged in
  if (!identity) {
    navigate({ to: "/" });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error("Title and content are required.");
      return;
    }
    try {
      const id = await mutateAsync({ title: title.trim(), content });
      toast.success("Paste created!");
      navigate({ to: "/paste/$id", params: { id: id.toString() } });
    } catch {
      toast.error("Failed to create paste. Please try again.");
    }
  };

  return (
    <section className="font-mono text-sm max-w-3xl">
      {/* Panel header */}
      <div className="mb-6 text-foreground">
        <div>┌── NEW PASTE {"─".repeat(46)}┐</div>
        <div className="flex">
          <span>│</span>
          <span className="flex-1 px-2 text-muted-foreground text-xs py-0.5">
            SHARE PLAIN TEXT WITH ANYONE. PASTES ARE PUBLIC AND PERMANENT.
          </span>
          <span>│</span>
        </div>
        <div>└{"─".repeat(58)}┘</div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title field */}
        <div className="border border-border">
          <div className="px-3 py-1.5 border-b border-border text-muted-foreground text-xs bg-card">
            TITLE &gt;
          </div>
          <input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="ENTER A DESCRIPTIVE TITLE..."
            disabled={isPending}
            data-ocid="create_paste.input"
            className="w-full bg-background text-foreground px-3 py-2.5 outline-none focus:bg-card placeholder:text-muted-foreground/50 disabled:opacity-50 font-mono text-sm transition-colors"
          />
        </div>

        {/* Content field */}
        <div className="border border-border">
          <div className="flex items-center justify-between px-3 py-1.5 border-b border-border text-muted-foreground text-xs bg-card">
            <span>CONTENT &gt;</span>
            <span className="tabular-nums">
              {content.length.toLocaleString()} CHARS
            </span>
          </div>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="PASTE YOUR TEXT HERE..."
            disabled={isPending}
            data-ocid="create_paste.textarea"
            rows={18}
            className="w-full bg-background text-foreground px-3 py-2.5 outline-none focus:bg-card placeholder:text-muted-foreground/50 disabled:opacity-50 font-mono text-sm resize-y transition-colors"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={isPending || !title.trim() || !content.trim()}
            data-ocid="create_paste.submit_button"
            className="text-primary border border-primary px-6 py-2 hover:bg-primary hover:text-primary-foreground transition-colors disabled:opacity-40 disabled:cursor-not-allowed font-mono text-sm tracking-widest"
          >
            {isPending ? "[ PUBLISHING... ]" : "[ PUBLISH ]"}
          </button>
          <button
            type="button"
            onClick={() => navigate({ to: "/" })}
            disabled={isPending}
            className="text-muted-foreground hover:text-foreground transition-colors font-mono text-sm"
          >
            [ CANCEL ]
          </button>
        </div>
      </form>
    </section>
  );
}
