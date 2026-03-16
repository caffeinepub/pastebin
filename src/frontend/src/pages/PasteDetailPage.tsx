import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useParams } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Check, Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useGetPaste } from "../hooks/useQueries";
import { truncatePrincipal } from "../utils/format";
import { formatDate } from "../utils/time";

export function PasteDetailPage() {
  const { id } = useParams({ from: "/paste/$id" });
  const pasteId = BigInt(id);
  const { data: paste, isLoading, isError } = useGetPaste(pasteId);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!paste?.content) return;
    try {
      await navigator.clipboard.writeText(paste.content);
      setCopied(true);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy.");
    }
  };

  return (
    <section>
      {/* Back link */}
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-xs tracking-widest uppercase text-muted-foreground hover:text-primary transition-colors mb-6"
      >
        <ArrowLeft className="h-3 w-3" />
        All Pastes
      </Link>

      {/* Loading */}
      {isLoading && (
        <div data-ocid="paste_detail.loading_state" className="space-y-4">
          <Skeleton className="h-8 w-2/3 bg-muted" />
          <div className="flex gap-6">
            <Skeleton className="h-4 w-40 bg-muted" />
            <Skeleton className="h-4 w-32 bg-muted" />
          </div>
          <Skeleton className="h-64 w-full bg-muted mt-4" />
        </div>
      )}

      {/* Error */}
      {isError && (
        <div
          data-ocid="paste_detail.error_state"
          className="border border-destructive/30 bg-destructive/5 p-8 text-center"
        >
          <p className="font-display text-lg text-destructive">
            Failed to load paste.
          </p>
          <p className="text-sm text-muted-foreground mt-1 font-mono">
            The paste may not exist or there was a network error.
          </p>
        </div>
      )}

      {/* Not found */}
      {!isLoading && !isError && paste === null && (
        <div
          data-ocid="paste_detail.error_state"
          className="border border-dashed border-border p-8 text-center"
        >
          <p className="font-display text-xl text-muted-foreground">
            Paste not found.
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            This paste may have been removed.
          </p>
        </div>
      )}

      {/* Paste content */}
      {!isLoading && paste && (
        <>
          {/* Header */}
          <div className="pb-4 mb-6 border-b-2 border-foreground">
            <h2 className="font-display text-3xl md:text-4xl font-bold leading-tight break-words">
              {paste.title || "Untitled"}
            </h2>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-1 mt-3">
              <span className="font-mono text-xs text-muted-foreground">
                <span className="uppercase tracking-wider mr-1">by</span>
                {truncatePrincipal(paste.author.toString())}
              </span>
              <span className="font-mono text-xs text-muted-foreground">
                {formatDate(paste.createdAt)}
              </span>
            </div>
          </div>

          {/* Actions bar */}
          <div className="flex justify-end mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              data-ocid="paste_detail.copy_button"
              className="text-xs tracking-wider uppercase border-foreground/30 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors h-8 px-4"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 mr-1.5" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 mr-1.5" />
                  Copy
                </>
              )}
            </Button>
          </div>

          {/* Content box */}
          <div className="border border-foreground/20 bg-card">
            <pre className="font-mono text-sm text-foreground p-6 overflow-x-auto whitespace-pre-wrap break-words leading-relaxed">
              {paste.content}
            </pre>
          </div>

          {/* Char count */}
          <p className="text-xs font-mono text-muted-foreground mt-3 text-right">
            {paste.content.length.toLocaleString()} character
            {paste.content.length !== 1 ? "s" : ""}
          </p>
        </>
      )}
    </section>
  );
}
