# Make a Wish

An interactive greeting card with letters, candles, and a hidden gift.

`index.html` is the self-contained birthday card. All artwork and recipient-side logic are embedded. Share this file after configuring the gift. The cover and envelope are opposite faces of one hinged leaf; the candle page is the other leaf, and the gift is its outer back face.

## Preview and Build

Run `npm run build` to regenerate `index.html` from `build.mjs`, the assets, and `gift-payload.json`. Run `npm start` and open http://localhost:4173. No npm dependencies are required. The server does not cache files, so refresh after rebuilding.

On a Docker-equipped machine, run `docker build -t make-a-wish .`, then `docker run --rm -p 4173:4173 make-a-wish`. Docker was unavailable in the development environment, so the preview and browser checks used the existing Node and Chrome installations.

## Configure the Gift

1. Open http://localhost:4173/encrypt-gift.html or open `encrypt-gift.html` directly in a browser supporting Web Crypto for local files.
2. Enter the gift card details and the password in the helper. Click **Encrypt gift**. The helper does not make network requests or use browser storage, and it clears the input fields after encryption.
3. Copy only the encrypted JSON into `gift-payload.json`, replacing its contents, or use the helper's downloaded JSON. Never put plaintext gift details or the password in source files.
4. Run `npm run build`. Share only `index.html`. The helper is separate and is not embedded in the card.

An empty payload leaves the back page in a "still being wrapped" state. The helper uses AES-256-GCM with a fresh random 12-byte IV, a 128-bit authentication tag, and PBKDF2-SHA-256 with a fresh random 16-byte salt and 310,000 iterations. The card stores only three base64 fields: `salt`, `iv`, and `ciphertext`; it never stores a password or a derived key. The build validates the field names, encoding, and byte lengths. Gift details enter the recipient's DOM only after successful decryption, and are cleared on returning to the spread.

The recipient unlocks the back page through **one more thing...**, which appears after blowout. A wrong password shakes the tag and shows **Try again**. A correct password unseals the tag and enables copying. Return with **Back to the card**. On phones, arrow controls and horizontal swipes slide between the two inside pages without shrinking them. Inside interactions are disabled while the physical card is closed or moving.

Microphone and Web Crypto features require a browser-supported secure context; localhost works for preview, and a hosted card should use HTTPS. **Hold to blow** remains available when microphone access is unavailable.

API references: [Web Crypto key derivation](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/deriveKey) and [AES-GCM parameters](https://developer.mozilla.org/en-US/docs/Web/API/AesGcmParams).
