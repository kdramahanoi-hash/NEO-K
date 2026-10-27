# Host both websites with Porkbun

Repository: [kdramahanoi-hash/NEO-K](https://github.com/kdramahanoi-hash/NEO-K).

## What is ready and what still needs setup

Domain registration pays for the address. Website hosting serves the HTML and photos at that address. On 28 October 2026 both domains were registered in the inspected Porkbun account, but their Porkbun hosting plans were **Free Link In Bio – URL Forwarded**, not Static Hosting. Their existing websites were still served by Vercel and returned HTTP 200.

The repository transfer is complete. Porkbun account/domain ownership and hosting billing are separate; they have not been transferred to the restaurant owner. Do not share account passwords. The person who controls the Porkbun account must complete the hosting and billing steps or arrange a domain handover separately.

## 1. Choose hosting

Porkbun's **Secure Static Hosting** fits these HTML websites. The plan page inspected offered Starter at **$3/month per domain** or **$30/year per domain**, with a 15-day trial. Check the current currency, renewal terms and total before starting. Two separate Starter plans would be $6/month or $60/year at those listed prices, in addition to domain renewals.

In Domain Management, open each domain's Website settings. Review the existing free Link In Bio service and export any content you need before replacing it. Porkbun's setup guide says an existing hosting plan must be canceled before adding Static Hosting. Approve the subscription terms and select the intended billing interval before starting a trial or paid service.

Do not use **Fix DNS** on the Free Link In Bio page: that configures the link page rather than this website. Keep the current websites and DNS available until the replacement is ready; some activation steps may change DNS immediately, so record the current records first.

## 2. Connect the repository

After Static Hosting is active, open **GitHub Connect → connect** in the domain's hosting settings. Sign into GitHub as **kdramahanoi-hash**, review the Porkbun app permissions, and choose **Only select repositories → NEO-K**. Return to Porkbun and select:

| Domain | Repository | Branch | Homepage at publishing root |
| --- | --- | --- | --- |
| `neokculture.com` | `kdramahanoi-hash/NEO-K` | `main` | Root `index.html` |
| `kdramahanoi.com` | `kdramahanoi-hash/NEO-K` | `porkbun-kdrama` | Restaurant `index.html` |

There is no build or install command. The restaurant publishing branch places the files from `main:kdrama/` at the root so `/` opens the restaurant, with its photos under `/assets/`.

The workflow **Prepare K-Drama for Porkbun** runs after restaurant edits on `main`. It uses GitHub's built-in token to update the generated branch; no personal token, Porkbun password or secret needs to be saved. To refresh it manually, use **Actions → Prepare K-Drama for Porkbun → Run workflow** on `main`. A failed run means the restaurant branch has not updated; inspect its log before expecting a new publication.

If the branch is missing, first check that Actions is enabled and run the workflow. Use the workflow's declared repository contents permission rather than adding an account-wide token.

## 3. Connect the domains and verify

Use the DNS targets supplied by the **new Static Hosting** service. Configure both the bare domain and `www` for each site, including the desired redirect and HTTPS certificate. Keep unrelated email (MX), verification and TXT records intact. Do not invent an IP address or reuse a target from the old host.

Before considering the move finished, check all four HTTPS addresses:

- `https://kdramahanoi.com` and `https://www.kdramahanoi.com`: restaurant title, menu, photos, directions and contact links.
- `https://neokculture.com` and `https://www.neokculture.com`: culture center title, photos, navigation and contact/privacy/terms pages.

Then make a small intended content update on `main`. Verify the restaurant workflow succeeds, Porkbun reports a successful publication, and the update appears on the corresponding real website. This end-to-end check has **not yet been performed** for Porkbun. Keep the old hosting available until it passes.

## Manual upload fallback

Extract the website files before uploading with Porkbun's file editor or FTP. For Neo K, put root `index.html`, the other root HTML pages, root images and `assets/` in the hosting document root. For K-Drama, put the **contents** of `kdrama/` there: `index.html` and `assets/`, without an outer `kdrama` directory. A ZIP is a transport archive; uploading it alone does not guarantee extraction or publication. Manual uploads do not establish automatic GitHub publishing.

## DNS record reference before migration

These public answers were observed on 28 October 2026. Save the account's complete DNS records and TTLs before editing; these four entries are only a website rollback reference. Recheck them against the existing host if rollback is needed.

| Name | Type | Previous value |
| --- | --- | --- |
| `kdramahanoi.com` | A | `216.198.79.1` |
| `www.kdramahanoi.com` | CNAME | `68e3188a91b2daab.vercel-dns-017.com` |
| `neokculture.com` | A | `216.198.79.1` |
| `www.neokculture.com` | CNAME | `9fd878869d121745.vercel-dns-017.com` |

## Official instructions

- [Porkbun: set up Static Hosting](https://kb.porkbun.com/article/137-how-to-set-up-static-hosting)
- [Porkbun: connect Static Hosting to GitHub](https://kb.porkbun.com/article/145-how-to-connect-static-hosting-to-github)
- [Porkbun: upload using FTP](https://kb.porkbun.com/article/238-how-to-connect-to-porkbuns-static-hosting-with-an-ftp-client-like-filezilla)
- [GitHub: workflow token permissions](https://docs.github.com/en/actions/tutorials/authenticate-with-github_token)
