# PasteBin

## Current State
A pastebin app with TUI aesthetic (amber-on-black, box-drawing borders, JetBrains Mono). Users can create single pastes via a form. Backend has `createPaste(title, content)` and `listPastes()`. No bulk import exists.

## Requested Changes (Diff)

### Add
- `createPasteBatch(pastes: [{title, content}])` backend function that accepts an array of paste objects and creates them all, returning an array of IDs.
- A bulk import UI accessible from the Create page (a tab or toggle between "Single Paste" and "Import Archive").
- Frontend archive extraction: parse ZIP, RAR, TAR (including .tar.gz) files in-browser. Each file inside the archive becomes one paste; the filename (without extension) becomes the paste title; the file text content becomes the paste content.
- Files that cannot be read as text are skipped silently.
- Progress display showing: how many files found, how many processed, how many skipped.
- After import completes, show a summary (X pastes created, Y skipped) and navigate to home.

### Modify
- `CreatePastePage.tsx` -- add a second mode for archive import.
- `useQueries.ts` -- add `useCreatePasteBatch` mutation hook.

### Remove
- Nothing removed.

## Implementation Plan
1. Add `createPasteBatch` to backend Motoko.
2. Update `backend.d.ts` to include the new method.
3. Install `jszip` (ZIP), `js-untar` (TAR/TAR.GZ), and `@incodes/unrar` or `libarchivejs` (RAR) frontend npm packages.
4. Add `useCreatePasteBatch` hook in `useQueries.ts`.
5. Create `src/frontend/src/utils/archiveExtractor.ts` that handles all three formats and returns `{title, content}[]`.
6. Add `ImportArchivePage` or extend `CreatePastePage` with a toggle tab for archive import.
