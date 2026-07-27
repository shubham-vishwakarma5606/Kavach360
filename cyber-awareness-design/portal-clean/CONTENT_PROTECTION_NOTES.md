# Content Protection Notes

The clean portal prototype uses UI-level protection only. For production, enforce content protection server-side.

## Frontend controls

- Hide download buttons.
- Use video `controlsList="nodownload"` where native video is used.
- Disable right-click only as a deterrent, not a security control.
- Disable print/save shortcuts as a deterrent.
- Do not expose direct file URLs in HTML.

## Backend controls required

- Store content in private object storage.
- Generate short-lived signed streaming URLs.
- Authorize every content request by tenant, user, licence and assignment.
- Add visible or forensic watermarking for videos/PDFs.
- Use streaming/HLS for video where possible.
- Prevent public bucket access.
- Log content access events.
- Expire tokens quickly.
- Revoke access when licence expires or assignment is removed.

## Important reality

No web application can fully prevent screen recording or screenshots. The correct goal is to prevent casual downloading, control access, watermark content, and maintain audit logs.
