# Neo K Culture and K-Drama Hanoi

Both websites belong to this repository, now owned by **kdramahanoi-hash**.

| Website | Edit these files on `main` | Porkbun publishing branch |
| --- | --- | --- |
| [Neo K Culture](https://www.neokculture.com) | Root `index.html`, `contact.html`, `privacy.html`, `terms.html`, root images and `assets/` | `main` |
| [K-Drama Cafe & Beer Hanoi](https://www.kdramahanoi.com) | `kdrama/index.html` and `kdrama/assets/` | `porkbun-kdrama` (generated automatically) |

## Make an update

1. Open the file above in GitHub and choose the pencil icon to edit it.
2. Change the text, links or image references. Upload replacement photos into the matching assets folder.
3. Commit the change to `main`. A pull request can be used to review it first.
4. For restaurant edits, check **Actions → Prepare K-Drama for Porkbun**. A successful run copies the contents of `kdrama/` into the publishing branch.
5. **After Porkbun GitHub Connect is configured**, it will publish the selected branch. Check the real website after each update.

Edit the restaurant's `kdrama/index.html`, rather than the older root `k-drama.html` copy. Do not edit the generated `porkbun-kdrama` branch directly.

## Connect and host the websites

Follow **[the Porkbun hosting guide](docs/PORKBUN_HOSTING.md)** for the account setup, branch choices, domains, DNS and checks.

**Setup status, 28 October 2026:** GitHub ownership has been transferred. Both live sites still use the original Vercel hosting. Its Git connection needs repair or replacement before future edits can publish. The Porkbun account inspected has domain registrations and Free Link In Bio plans; Static Hosting has not been activated or connected. Repository preparation alone does not move the live sites.

No build command, Node.js server or database is required for these static HTML websites.
