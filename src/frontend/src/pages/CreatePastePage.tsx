import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
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
    <section className="max-w-3xl">
      <div className="mb-6 pb-3 border-b-2 border-foreground">
        <h2 className="font-display text-2xl font-bold">New Paste</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Share plain text with anyone. Pastes are public and permanent.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label
            htmlFor="title"
            className="text-xs tracking-widest uppercase text-muted-foreground"
          >
            Title
          </Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Give your paste a descriptive title..."
            disabled={isPending}
            data-ocid="create_paste.input"
            className="font-sans border-foreground/30 focus:border-primary h-11 text-base"
          />
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="content"
            className="text-xs tracking-widest uppercase text-muted-foreground"
          >
            Content
          </Label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste your text here..."
            disabled={isPending}
            data-ocid="create_paste.textarea"
            rows={20}
            className="w-full font-mono text-sm border border-foreground/30 focus:border-primary bg-card text-foreground p-4 resize-y outline-none focus:ring-1 focus:ring-primary transition-colors placeholder:text-muted-foreground disabled:opacity-50"
          />
          <p className="text-xs font-mono text-muted-foreground tabular-nums">
            {content.length.toLocaleString()} character
            {content.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <Button
            type="submit"
            disabled={isPending || !title.trim() || !content.trim()}
            data-ocid="create_paste.submit_button"
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 h-11 text-sm tracking-wider uppercase"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Publishing...
              </>
            ) : (
              "Publish Paste"
            )}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate({ to: "/" })}
            disabled={isPending}
            className="text-sm text-muted-foreground"
          >
            Cancel
          </Button>
        </div>
      </form>
    </section>
  );
}
