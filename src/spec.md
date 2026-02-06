# Specification

## Summary
**Goal:** Add a Documents section where authorized users can store and manage PDF, Word, and Excel files with metadata, following existing auth and offline-first patterns.

**Planned changes:**
- Implement a backend Documents module to store document binaries plus metadata (id, fileName, fileType, uploadedAt, optional notes/description, fileSizeBytes) with auto-increment IDs, consistent authorization checks, and clear not-found errors.
- Expose backend APIs to upload/add a document, list documents (metadata), fetch a document by id (including binary), and delete a document.
- Add a new frontend route/page at `/documents` linked from the main navigation, with an upload form (file + optional note), file-type validation (PDF/Word/Excel only), and an English UI.
- Display a documents table/list showing at least name, type, upload date/time, and size, with actions to view/download and delete (with confirmation).
- Integrate Documents into the existing React Query + offline-first behavior: cache metadata locally, queue upload/delete while offline, auto-sync on reconnect, and show sync status/failure with retry consistent with existing patterns.

**User-visible outcome:** Authorized users can navigate to a Documents page to upload PDF/Word/Excel files, see a list of stored documents, download/view them, and delete them; the list works from cached metadata offline and changes sync when back online.
