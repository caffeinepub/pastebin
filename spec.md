# PasteBin App

## Current State
New project, no existing code.

## Requested Changes (Diff)

### Add
- Public paste viewing (no account required)
- Authenticated paste creation (account required)
- Paste list/browse page showing all public pastes
- Individual paste view page with copy-to-clipboard button
- Create paste form with title and content fields
- User account system (login/logout)

### Modify
- N/A (new project)

### Remove
- N/A (new project)

## Implementation Plan

### Backend
- `createPaste(title: Text, content: Text) -> PasteId` (authenticated)
- `getPaste(id: PasteId) -> ?Paste` (public)
- `listPastes() -> [PasteSummary]` (public, returns id, title, author, timestamp)
- Paste record: id, title, content, authorId, createdAt
- No expiration logic
- No syntax highlighting

### Frontend
- Home page: list of recent pastes with title, author, date
- Create paste page: form with title input + textarea, submit button (only shown when logged in)
- Paste detail page: displays title, content, copy-to-clipboard button, author, date
- Auth: login/logout controls in nav
- Plain text display (no syntax highlighting)
