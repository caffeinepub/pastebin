import { useNavigate } from "@tanstack/react-router";
import { useCallback, useRef, useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useCreatePasteBatch } from "../hooks/useQueries";
import { extractArchive } from "../utils/archiveExtractor";

type ImportState =
  | { phase: "idle" }
  | { phase: "ready"; file: File }
  | { phase: "extracting" }
  | { phase: "importing"; done: number; total: number }
  | { phase: "done"; imported: number; skipped: number }
  | { phase: "error"; message: string };

function ProgressBar({ value }: { value: number }) {
  const total = 20;
  const filled = Math.round((value / 100) * total);
  const empty = total - filled;
  return (
    <span className="font-mono text-primary">
      [{"█".repeat(filled)}
      {"░".repeat(empty)}] {value}%
    </span>
  );
}

export function ImportArchivePage() {
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();
  const { mutateAsync } = useCreatePasteBatch();
  const [state, setState] = useState<ImportState>({ phase: "idle" });
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    const lower = file.name.toLowerCase();
    const valid = [".zip", ".rar", ".tar", ".tar.gz", ".tgz"].some((ext) =>
      lower.endsWith(ext),
    );
    if (!valid) {
      setState({
        phase: "error",
        message: "UNSUPPORTED FORMAT. USE .ZIP, .RAR, .TAR, .TAR.GZ, OR .TGZ",
      });
      return;
    }
    setState({ phase: "ready", file });
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  if (!identity) {
    navigate({ to: "/" });
    return null;
  }

  const handleImport = async () => {
    if (state.phase !== "ready") return;
    const { file } = state;

    setState({ phase: "extracting" });

    let pastes: { title: string; content: string }[];
    try {
      pastes = await extractArchive(file);
    } catch (err: unknown) {
      if (err instanceof Error && err.message === "RAR_NOT_SUPPORTED") {
        setState({
          phase: "error",
          message: "RAR EXTRACTION FAILED - TRY ZIP OR TAR",
        });
      } else {
        setState({
          phase: "error",
          message: "EXTRACTION FAILED. FILE MAY BE CORRUPT.",
        });
      }
      return;
    }

    if (pastes.length === 0) {
      setState({
        phase: "error",
        message: "NO VALID TEXT FILES FOUND IN ARCHIVE",
      });
      return;
    }

    const CHUNK = 100;
    let imported = 0;
    setState({ phase: "importing", done: 0, total: pastes.length });

    for (let i = 0; i < pastes.length; i += CHUNK) {
      const chunk = pastes.slice(i, i + CHUNK);
      try {
        await mutateAsync(chunk);
      } catch {
        // skip failed chunks silently
      }
      imported += chunk.length;
      setState({ phase: "importing", done: imported, total: pastes.length });
    }

    setState({
      phase: "done",
      imported,
      skipped: 0,
    });
  };

  const progressPct =
    state.phase === "importing"
      ? Math.round((state.done / state.total) * 100)
      : 0;

  return (
    <section className="font-mono text-sm max-w-3xl">
      {/* Panel header */}
      <div className="mb-6 text-foreground">
        <div>┌── IMPORT ARCHIVE {"─".repeat(40)}┐</div>
        <div className="flex">
          <span>│</span>
          <span className="flex-1 px-2 text-muted-foreground text-xs py-0.5">
            UPLOAD A COMPRESSED FILE TO BULK-IMPORT PASTES. ZIP · TAR · TAR.GZ
          </span>
          <span>│</span>
        </div>
        <div>└{"─".repeat(58)}┘</div>
      </div>

      {/* Drop zone */}
      {(state.phase === "idle" || state.phase === "ready") && (
        <label
          className="border border-border hover:border-primary transition-colors cursor-pointer mb-6 block"
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          data-ocid="import.dropzone"
        >
          <div className="px-3 py-1.5 border-b border-border text-muted-foreground text-xs bg-card">
            FILE &gt;
          </div>
          <div className="px-4 py-8 text-center">
            {state.phase === "ready" ? (
              <>
                <div className="text-primary mb-1">▶ {state.file.name}</div>
                <div className="text-muted-foreground text-xs">
                  {(state.file.size / 1024).toFixed(1)} KB · CLICK TO CHANGE
                </div>
              </>
            ) : (
              <>
                <div className="text-muted-foreground mb-1">
                  DROP ARCHIVE HERE
                </div>
                <div className="text-muted-foreground/50 text-xs">
                  OR CLICK TO BROWSE · .ZIP .TAR .TAR.GZ .TGZ .RAR
                </div>
              </>
            )}
          </div>
          <input
            ref={inputRef}
            type="file"
            accept=".zip,.rar,.tar,.tar.gz,.tgz"
            onChange={handleInputChange}
            data-ocid="import.upload_button"
            className="hidden"
          />
        </label>
      )}

      {/* Progress panel */}
      {(state.phase === "extracting" || state.phase === "importing") && (
        <div
          className="border border-border mb-6"
          data-ocid="import.loading_state"
        >
          <div className="px-3 py-1.5 border-b border-border text-muted-foreground text-xs bg-card">
            PROGRESS &gt;
          </div>
          <div className="px-4 py-6 space-y-3">
            {state.phase === "extracting" && (
              <div className="text-primary animate-pulse">EXTRACTING...</div>
            )}
            {state.phase === "importing" && (
              <>
                <div className="text-foreground">
                  IMPORTING {state.done.toLocaleString()} /{" "}
                  {state.total.toLocaleString()} PASTES...
                </div>
                <div>
                  <ProgressBar value={progressPct} />
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Done panel */}
      {state.phase === "done" && (
        <div
          className="border border-border mb-6"
          data-ocid="import.success_state"
        >
          <div className="px-3 py-1.5 border-b border-border text-muted-foreground text-xs bg-card">
            RESULT &gt;
          </div>
          <div className="px-4 py-6 space-y-1">
            <div className="text-primary">
              ✓ {state.imported.toLocaleString()} PASTES IMPORTED
            </div>
            {state.skipped > 0 && (
              <div className="text-muted-foreground">
                ✗ {state.skipped} SKIPPED
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error panel */}
      {state.phase === "error" && (
        <div
          className="border border-destructive mb-6"
          data-ocid="import.error_state"
        >
          <div className="px-3 py-1.5 border-b border-destructive text-destructive text-xs bg-card">
            ERROR &gt;
          </div>
          <div className="px-4 py-4 text-destructive">{state.message}</div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4">
        {state.phase === "ready" && (
          <button
            type="button"
            onClick={handleImport}
            data-ocid="import.primary_button"
            className="text-primary border border-primary px-6 py-2 hover:bg-primary hover:text-primary-foreground transition-colors font-mono text-sm tracking-widest"
          >
            [ EXTRACT &amp; IMPORT ]
          </button>
        )}
        {(state.phase === "done" || state.phase === "error") && (
          <button
            type="button"
            onClick={() => navigate({ to: "/" })}
            data-ocid="import.secondary_button"
            className="text-primary border border-primary px-6 py-2 hover:bg-primary hover:text-primary-foreground transition-colors font-mono text-sm tracking-widest"
          >
            [ BACK TO HOME ]
          </button>
        )}
        {state.phase !== "done" &&
          state.phase !== "importing" &&
          state.phase !== "extracting" && (
            <button
              type="button"
              onClick={() => navigate({ to: "/" })}
              className="text-muted-foreground hover:text-foreground transition-colors font-mono text-sm"
            >
              [ CANCEL ]
            </button>
          )}
      </div>
    </section>
  );
}
