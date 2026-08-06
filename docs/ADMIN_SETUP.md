# Netlify Admin Setup & Configuration Guide

This guide documents the configuration steps required to enable secure server-side admin authentication, content persistence via GitHub API, and image uploads for the Oilganic website.

---

## 1. Required Netlify Environment Variables

Configure the following environment variables in **Netlify Dashboard → Site configuration → Environment variables**:

| Variable Name | Required | Description & Example |
|---|---|---|
| `ADMIN_USERNAME` | Yes | Username for admin login (e.g., `oilganic.admin`). |
| `ADMIN_PASSWORD_SCRYPT` | Yes | Scrypt hash in format `saltHex:keyHex` generated locally. |
| `ADMIN_SESSION_SECRET` | Yes | 64+ character random string used for HMAC session cookie signing and CSRF tokens. |
| `GITHUB_TOKEN` | Yes | Fine-grained GitHub Personal Access Token (PAT) with contents read/write permission. |
| `GITHUB_REPOSITORY` | Yes | GitHub repo slug (default: `oilganic-az/oilganic`). |
| `ADMIN_CONTENT_BRANCH` | Yes | Target branch for admin commits (default: `feature/admin-owned-menu` or `main`). |
| `ALLOWED_ORIGINS` | Yes | Comma-separated list of allowed origins (e.g., `https://oilganic.az,https://deploy-preview-123--oilganic.netlify.app`). |

---

## 2. Generating Admin Secrets & Hashes

### Generating `ADMIN_PASSWORD_SCRYPT`
Run the local helper script to hash your desired admin password using Node `crypto.scrypt`:

```powershell
node scripts/hash-admin-password.mjs "YourSecretPassword2026!"
```

Output format:
```text
ADMIN_PASSWORD_SCRYPT=7516df50defe619883e84cce4b12559f:2dd2fe13963979c07a2167454e9efbe9f48aa422338888756d06f482a661e1067d4b71afaf841bd6358605621c331346bc0d0ba20b409b85cefd8770ff25fcd3
```

### Generating `ADMIN_SESSION_SECRET` (PowerShell)
```powershell
[Convert]::ToBase64String((1..48 | ForEach-Object { Get-Random -Min 0 -Max 256 }))
```

---

## 3. GitHub Fine-Grained Token Permissions

To allow Netlify Functions to push content changes to GitHub without giving full repository access:

1. Go to **GitHub Settings → Developer Settings → Personal Access Tokens → Fine-grained tokens**.
2. Click **Generate new token**.
3. **Repository access**: Select **Only select repositories** → choose `oilganic-az/oilganic`.
4. **Permissions**:
   - **Repository permissions → Contents**: **Read and write**
   - **Repository permissions → Metadata**: **Read-only**
5. Generate token and copy it to `GITHUB_TOKEN` in Netlify environment variables.

> [!CAUTION]
> Never commit actual tokens, passwords, or `.env` files to the repository.

---

## 4. Local Testing & Netlify Dev CLI

To test authentication and Netlify Functions locally:

```powershell
# Set local test environment variables
$env:ADMIN_USERNAME="oilganic.admin"
$env:ADMIN_PASSWORD_SCRYPT="7516df50defe619883e84cce4b12559f:2dd2fe13963979c07a2167454e9efbe9f48aa422338888756d06f482a661e1067d4b71afaf841bd6358605621c331346bc0d0ba20b409b85cefd8770ff25fcd3"
$env:ADMIN_SESSION_SECRET="local-dev-secret-key-1234567890"

# Run Netlify Dev CLI
npx netlify dev
```

---

## 5. Security & Architecture Details

- **HttpOnly Cookies**: Session tokens are stored in signed `HttpOnly; SameSite=Strict; Path=/; Secure` cookies with a 30-minute expiration.
- **CSRF Tokens**: All mutation endpoints (`/api/admin-products`, `/api/admin-campaigns`, `/api/admin-upload-image`) require a matching `X-CSRF-Token` header.
- **Image Uploads**: Validates file magic bytes (JPEG, PNG, WebP only; maximum 2 MB) before committing binary files to `public/uploads/` via GitHub API.
- **Branch Safety**: Direct writes to `main` branch are blocked unless `ALLOW_MAIN_WRITE=true` is set explicitly.
