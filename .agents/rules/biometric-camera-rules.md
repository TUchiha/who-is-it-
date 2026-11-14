---
description: Non-negotiable design rules for Camera Identification Web App
globs: ["**/*"]
alwaysApply: true
---

# Non-Negotiable Design Rules

1. **Heavy ML in Web Worker**: Heavy ML must run in a Web Worker (OffscreenCanvas), never on the main thread.
2. **Server-Side Matching Only for Others**: Matching against OTHER people runs server-side only. Other users' embeddings must never reach any client.
3. **Face Data is Convenience Factor**: Face data is never the sole credential. A face match only unlocks a locally stored credential. The fallback chain is WebAuthn passkey, then password. Browser-side liveness can be bypassed (virtual cameras, tampered JS), so never treat it as proof of identity.
4. **Server-Enforced Consent & Visibility**: Consent and visibility must be enforced on the SERVER, not only in the UI.
5. **No Raw Face Images**: Store only embedding vectors, never raw face images. Frames are never persisted or uploaded.
6. **Privacy by Default**: "Allow others to identify me" is default OFF, with visibility options: Nobody / Approved contacts / All app users.
7. **Uniform No-Match Response**: A "no match" response must look identical for non-enrolled and non-visible people.
8. **Mandatory Liveness Challenge**: Liveness challenge (random blink / turn-left / turn-right) is mandatory for enrollment and face unlock.
9. **Zero PII/Embeddings in Logs**: No embeddings, tokens, or PII in logs, analytics, or error reports.
10. **Strict CSP & HTTPS**: Strict CSP, HTTPS only, no third-party scripts that can access or see the camera stream.
