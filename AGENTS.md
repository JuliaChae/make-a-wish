# Workspace Guidance

- Keep recipient artwork and logic embedded in the generated `index.html`.
- Never put plaintext gift card details or passwords in this repository, generated HTML, logs, or test fixtures. Only `gift-payload.json` ciphertext belongs here. Keep the encryption helper separate from the card.
- Build with `npm run build`; there are no third-party package dependencies or lint configuration.
- Prefer `docker build -t make-a-wish .` and `docker run --rm -p 4173:4173 make-a-wish` when Docker is available. The container uses Node 22 Alpine. Docker is unavailable in the current environment; use existing Node and Chrome without installing host packages.
- Verify viewport bounds, 3D face visibility, transition interaction locks, mobile page sliding, and encryption/decryption behavior after changes.
- Maintain `.agent/CONTINUITY.md`.
