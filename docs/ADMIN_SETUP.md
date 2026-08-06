# Netlify Admin Setup & Environment Configuration

This document provides the environment variable configuration required for the Oilganic admin system across Netlify deployment contexts.

---

## 1. Environment Variables by Deployment Context

### A. Deploy Preview Context (`feature/admin-owned-menu`)

Configure these variables in **Netlify Dashboard → Site configuration → Environment variables** for **Deploy Previews & Branch Deploys**:

| Environment Variable | Recommended Value | Description |
|---|---|---|
| `ADMIN_USERNAME` | `oilganic.admin` | Administrator login username |
| `ADMIN_PASSWORD_SCRYPT` | *(Generated Hash)* | Output from `node scripts/hash-admin-password.mjs` |
| `ADMIN_SESSION_SECRET` | *(64+ random chars)* | Secret key for signing session cookies and CSRF tokens |
| `GITHUB_TOKEN` | `ghp_...` | Fine-grained GitHub PAT with Contents Read/Write access |
| `GITHUB_REPOSITORY` | `oilganic-az/oilganic` | Target GitHub repository |
| `ADMIN_CONTENT_BRANCH` | `feature/admin-owned-menu` | Target content branch for admin commits |
| `ALLOWED_ORIGINS` | `https://oilganic.az` | Allowed CORS and request origins |

> [!IMPORTANT]
> **Do NOT set `ALLOW_MAIN_WRITE=true` in Deploy Preview context.** Admin content changes in Deploy Previews must be committed safely to `feature/admin-owned-menu`.

---

### B. Production Context (After PR Approval & Merge)

Configure these variables in **Netlify Dashboard → Site configuration → Environment variables** for the **Production Context**:

| Environment Variable | Value | Description |
|---|---|---|
| `ADMIN_USERNAME` | `oilganic.admin` | Administrator login username |
| `ADMIN_PASSWORD_SCRYPT` | *(Generated Hash)* | Scrypt hash generated locally |
| `ADMIN_SESSION_SECRET` | *(64+ random chars)* | Session HMAC and CSRF secret |
| `GITHUB_TOKEN` | `ghp_...` | GitHub PAT with Contents Read/Write access |
| `GITHUB_REPOSITORY` | `oilganic-az/oilganic` | Target repository |
| `ADMIN_CONTENT_BRANCH` | `main` | Production content branch |
| `ALLOW_MAIN_WRITE` | `true` | Explicit authorization required for production writes to `main` |
| `ALLOWED_ORIGINS` | `https://oilganic.az` | Production website origin |

> [!CAUTION]
> `ALLOW_MAIN_WRITE=true` is required **ONLY** for the Production context after the Pull Request is approved and merged into `main`.

---

## 2. Generating Admin Password Scrypt Hash

To generate the scrypt hash locally:

```powershell
node scripts/hash-admin-password.mjs "<YourSecurePassword>"
```

Example Output:
```text
ADMIN_PASSWORD_SCRYPT=83fe937f45fe374b5ab4bfcad56712c4:7c3c1359dbc18a7030bc6bacd00cc5fa39e1ca8e4a5dce8107dacc0e99af1049e49019b7f24c104f444c7524b1c32710bf08ab51bd366d67111cba85567925c2
```

> [!NOTE]
> The hash generator will fail with exit code 1 if no password argument is provided, and it will never print the plaintext password.

---

## 3. GitHub Fine-Grained Token Setup

1. Go to **GitHub Settings → Developer Settings → Personal Access Tokens → Fine-grained tokens**.
2. Click **Generate new token**.
3. **Repository access**: Select **Only select repositories** → choose `oilganic-az/oilganic`.
4. **Permissions**:
   - **Repository permissions → Contents**: **Read and write**
   - **Repository permissions → Metadata**: **Read-only**
5. Save the token and add it as `GITHUB_TOKEN` in Netlify.
