# Specification

## Summary
**Goal:** Fix the Android APK download link in Settings so it is always publicly reachable and downloads reliably on desktop and mobile, with an admin-editable URL and accurate link health status.

**Planned changes:**
- Update the Settings → Android App section to use a stable, direct-download APK URL that does not return 404 and works from both laptop and phone browsers.
- Ensure admins can edit and save the APK download URL and optional version label from Settings, with clear English validation, success, and error messages.
- Re-run and refresh the APK link health check status after an admin saves a new URL, and show clear English status messaging for reachable, 404/not found, or not configured states.

**User-visible outcome:** Authorized users can click “Download APK” from Settings → Android App and reliably start the download/open the direct link on desktop and mobile; admins can quickly update the APK URL/version and immediately see the updated health status and UI.
