import { Link } from "@tanstack/react-router";
import { useListPastes } from "../hooks/useQueries";
import { truncatePrincipal } from "../utils/format";
import { formatDistanceToNow } from "../utils/time";

export function HomePage() {
  const { data: pastes, isLoading, isError } = useListPastes();

  return (
    <section className="font-mono text-sm">
      {/* Section header */}
      <div className="mb-4 text-foreground">
        <div>┌── RECENT PASTES {"─".repeat(44)}┐</div>
        <div className="flex">
          <span>│</span>
          <span className="flex-1 px-2 text-muted-foreground text-xs py-0.5">
            {pastes
              ? `${pastes.length} ${pastes.length === 1 ? "ENTRY" : "ENTRIES"} IN ARCHIVE`
              : "QUERYING ARCHIVE..."}
          </span>
          <span>│</span>
        </div>
        <div>└{"─".repeat(58)}┘</div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div
          data-ocid="paste_list.loading_state"
          className="text-center py-8 text-muted-foreground border border-border"
        >
          [ LOADING... ]
        </div>
      )}

      {/* Error */}
      {isError && (
        <div
          data-ocid="paste_list.error_state"
          className="border border-destructive/60 p-6 text-center text-destructive"
        >
          [ ERROR: FAILED TO LOAD PASTES. PLEASE REFRESH. ]
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !isError && pastes?.length === 0 && (
        <div
          data-ocid="paste_list.empty_state"
          className="border border-border py-12 text-center"
        >
          <div className="text-muted-foreground">
            <div>┌{"─".repeat(28)}┐</div>
            <div>│ [ NO PASTES FOUND ] │</div>
            <div>│ SIGN IN TO CREATE ONE │</div>
            <div>└{"─".repeat(28)}┘</div>
          </div>
        </div>
      )}

      {/* Paste list */}
      {!isLoading && !isError && pastes && pastes.length > 0 && (
        <div data-ocid="paste_list.table" className="border border-border">
          {/* Column headers */}
          <div className="grid grid-cols-[1fr_180px_120px] border-b border-border bg-card">
            <div className="px-3 py-1.5 text-xs text-muted-foreground border-r border-border">
              TITLE
            </div>
            <div className="px-3 py-1.5 text-xs text-muted-foreground border-r border-border">
              AUTHOR
            </div>
            <div className="px-3 py-1.5 text-xs text-muted-foreground">AGE</div>
          </div>
          {pastes.map((paste, index) => (
            <Link
              key={paste.id.toString()}
              to="/paste/$id"
              params={{ id: paste.id.toString() }}
              data-ocid={`paste_list.item.${index + 1}`}
              className="grid grid-cols-[1fr_180px_120px] border-b border-border last:border-b-0 hover:bg-accent transition-colors group"
            >
              <div className="px-3 py-2 text-foreground group-hover:text-primary transition-colors truncate border-r border-border">
                &gt; {paste.title || "UNTITLED"}
              </div>
              <div className="px-3 py-2 text-muted-foreground truncate border-r border-border text-xs">
                {truncatePrincipal(paste.author.toString())}
              </div>
              <div className="px-3 py-2 text-muted-foreground text-xs">
                {formatDistanceToNow(paste.createdAt)}
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
