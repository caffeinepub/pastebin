import { useParams } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
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
    <section className="font-mono text-sm">
      {/* Back link */}
      <Link
        to="/"
        data-ocid="paste_detail.back_link"
        className="inline-block mb-6 text-muted-foreground hover:text-primary transition-colors"
      >
        &larr; [ALL PASTES]
      </Link>

      {/* Loading */}
      {isLoading && (
        <div
          data-ocid="paste_detail.loading_state"
          className="border border-border p-8 text-center text-muted-foreground"
        >
          [ LOADING... ]
        </div>
      )}

      {/* Error */}
      {isError && (
        <div
          data-ocid="paste_detail.error_state"
          className="border border-destructive/60 p-8 text-center text-destructive"
        >
          [ ERROR: FAILED TO LOAD PASTE ]<br />
          <span className="text-muted-foreground text-xs">
            THE PASTE MAY NOT EXIST OR THERE WAS A NETWORK ERROR.
          </span>
        </div>
      )}

      {/* Not found */}
      {!isLoading && !isError && paste === null && (
        <div
          data-ocid="paste_detail.error_state"
          className="border border-border p-8 text-center text-muted-foreground"
        >
          [ PASTE NOT FOUND ]<br />
          <span className="text-xs">THIS PASTE MAY HAVE BEEN REMOVED.</span>
        </div>
      )}

      {/* Paste content */}
      {!isLoading && paste && (
        <div>
          {/* TUI Window */}
          <div className="border border-border">
            {/* Title bar */}
            <div className="border-b border-border bg-card px-3 py-1.5 flex items-center justify-between">
              <span className="text-primary font-bold tracking-wide truncate">
                ┌── {(paste.title || "UNTITLED").toUpperCase()}{" "}
                {"─".repeat(
                  Math.max(0, 40 - (paste.title || "UNTITLED").length),
                )}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                data-ocid="paste_detail.copy_button"
                className="ml-4 shrink-0 text-foreground hover:text-primary border border-border hover:border-primary px-3 py-0.5 transition-colors text-xs"
              >
                {copied ? "[ COPIED! ]" : "[ COPY ]"}
              </button>
            </div>

            {/* Meta row */}
            <div className="border-b border-border px-3 py-1.5 flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground bg-card">
              <span>
                BY: {truncatePrincipal(paste.author.toString()).toUpperCase()}
              </span>
              <span>│</span>
              <span>DATE: {formatDate(paste.createdAt).toUpperCase()}</span>
              <span>│</span>
              <span>{paste.content.length.toLocaleString()} CHARS</span>
            </div>

            {/* Divider */}
            <div className="border-b border-border px-3 py-0 text-border text-xs">
              {"─".repeat(60)}
            </div>

            {/* Content */}
            <pre className="text-foreground px-3 py-4 overflow-x-auto whitespace-pre-wrap break-words leading-relaxed font-mono text-sm bg-background">
              {paste.content}
            </pre>

            {/* Bottom border */}
            <div className="border-t border-border px-3 py-1 text-xs text-muted-foreground bg-card">
              └{"─".repeat(58)}┘
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
