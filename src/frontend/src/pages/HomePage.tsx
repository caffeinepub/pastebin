import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import { ArrowRight, FileText } from "lucide-react";
import { motion } from "motion/react";
import { useListPastes } from "../hooks/useQueries";
import { truncatePrincipal } from "../utils/format";
import { formatDistanceToNow } from "../utils/time";

export function HomePage() {
  const { data: pastes, isLoading, isError } = useListPastes();

  return (
    <section>
      {/* Section header */}
      <div className="mb-6 pb-3 border-b-2 border-foreground flex items-baseline justify-between">
        <h2 className="font-display text-2xl font-bold">Recent Pastes</h2>
        {pastes && (
          <span className="text-xs font-mono text-muted-foreground tabular-nums">
            {pastes.length} {pastes.length === 1 ? "entry" : "entries"}
          </span>
        )}
      </div>

      {/* Loading */}
      {isLoading && (
        <div data-ocid="paste_list.loading_state" className="space-y-0">
          {([1, 2, 3, 4, 5, 6] as const).map((n) => (
            <div
              key={n}
              className="border-b border-border py-4 flex items-center gap-4"
            >
              <Skeleton className="h-4 w-48 bg-muted" />
              <Skeleton className="h-4 w-24 ml-auto bg-muted" />
              <Skeleton className="h-4 w-20 bg-muted" />
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {isError && (
        <div
          data-ocid="paste_list.error_state"
          className="border border-destructive/30 bg-destructive/5 p-6 text-center"
        >
          <p className="text-sm text-destructive font-mono">
            Failed to load pastes. Please refresh.
          </p>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !isError && pastes?.length === 0 && (
        <div
          data-ocid="paste_list.empty_state"
          className="py-20 text-center border border-dashed border-border"
        >
          <FileText
            className="h-8 w-8 mx-auto mb-4 text-muted-foreground"
            strokeWidth={1}
          />
          <p className="font-display text-xl text-muted-foreground">
            No pastes yet.
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Sign in to create the first one.
          </p>
        </div>
      )}

      {/* Paste list */}
      {!isLoading && !isError && pastes && pastes.length > 0 && (
        <div className="divide-y divide-border" data-ocid="paste_list.table">
          {/* Column headers */}
          <div className="hidden md:grid grid-cols-[1fr_160px_140px_32px] gap-4 py-2 px-3 bg-muted">
            <span className="text-xs tracking-widest uppercase text-muted-foreground font-sans">
              Title
            </span>
            <span className="text-xs tracking-widest uppercase text-muted-foreground font-sans">
              Author
            </span>
            <span className="text-xs tracking-widest uppercase text-muted-foreground font-sans">
              Posted
            </span>
            <span />
          </div>

          {pastes.map((paste, index) => (
            <motion.div
              key={paste.id.toString()}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04, duration: 0.2 }}
              data-ocid={`paste_list.row.${index + 1}`}
            >
              <Link
                to="/paste/$id"
                params={{ id: paste.id.toString() }}
                className="grid grid-cols-1 md:grid-cols-[1fr_160px_140px_32px] gap-1 md:gap-4 py-4 px-3 hover:bg-accent transition-colors group items-center"
              >
                <span className="font-display text-base font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                  {paste.title || "Untitled"}
                </span>
                <span className="font-mono text-xs text-muted-foreground truncate">
                  {truncatePrincipal(paste.author.toString())}
                </span>
                <span className="font-mono text-xs text-muted-foreground">
                  {formatDistanceToNow(paste.createdAt)}
                </span>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all hidden md:block" />
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}
