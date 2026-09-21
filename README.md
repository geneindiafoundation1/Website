# GENE-INDIA Foundation — website

Six-page website with a blog, editable team page, contact form, and direct
bank/UPI donations, plus a password-protected admin panel for the foundation's
own team.

Built with **Next.js 15 (App Router)**, **Supabase** (database, image storage,
admin login) and **SMTP** (or optional Resend) for email. No CSS framework and no webfonts — the
whole design is a token system in `src/app/globals.css`, which is why pages are
around 100 kB of JS and paint immediately.

---

## Running it locally

Node 22 or newer is required.

```bash
npm install
npm run dev          # http://localhost:3000
```

The site runs **with no configuration at all** — it falls back to the seed
content in `src/lib/seed.ts`. Forms validate and respond, but nothing is stored
and no email is sent until the services below are connected.

Other scripts:

```bash
npm run build        # production build
npm start            # serve the production build
npm run typecheck    # TypeScript, no emit
```

---

## Connecting the services

Copy `.env.example` to `.env.local` and fill it in.

### 1. Supabase — database, images, admin login

1. Create a free project at [supabase.com](https://supabase.com).
2. **SQL Editor → New query** → paste and run `supabase/schema.sql`.
   This creates the tables, the row-level security rules, and the `media`
   storage bucket.
3. Run `supabase/seed.sql` the same way to load the launch content.
4. **Project Settings → API** → copy the URL and the `anon` key into
   `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
5. **Authentication → Users → Add user** for each foundation member who should
   be able to publish. Turn *off* public sign-ups under
   **Authentication → Providers → Email** so only invited people have accounts.

Restart the dev server. `/admin` now asks for a login instead of showing the
"not connected yet" screen.

### 2. Email — contact and donor emails

Prefer SMTP so mail is sent **as** the foundation mailbox, not a third-party
address.

1. Create the mailbox `info@geneindiafoundation.org` with the domain host
   (Hostinger, Google Workspace, etc.).
2. Put that mailbox's SMTP host, port, username, and password in `SMTP_*`.
3. Set `EMAIL_FROM` to the same address and `EMAIL_TO` to the inbox that should
   receive form alerts (usually the same mailbox).

The SMTP login email and the From address should be the same mailbox. Logging
in as a different address and faking `info@…` as the sender usually lands in
spam.

Resend remains an optional fallback: if `SMTP_HOST` is empty and
`RESEND_API_KEY` is set, mail still goes out through Resend.

What gets sent:

| Trigger | To the foundation | To the person |
| --- | --- | --- |
| Contact form | The message, reply-to set to the sender | Acknowledgement |
| Donor form | Amount, mode, UTR reference, plus a reminder to verify against the bank statement before issuing an 80G receipt | Thank-you |

### 3. Monthly database backup (free plan)

Supabase's free plan does not keep restore-able backups. Run this once a month,
or let GitHub Actions do it on the 1st:

```bash
npm run backup
```

It writes `backups/YYYY-MM-DD/database.json` (posts, team, messages, donations,
admins, activity log) and any files from the `media` bucket. That folder is
gitignored — it contains personal data, so keep the files somewhere private.

You need the **service_role** key in `.env.local` (`SUPABASE_SERVICE_ROLE_KEY`),
from **Supabase → Project Settings → API**. Never expose that key in the
browser.

If the repo is on GitHub, add the same two values as repository secrets
(`NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`). The workflow
`.github/workflows/backup.yml` then dumps on the 1st of each month and keeps
the file as an artifact for 90 days. You can also run it by hand from the
Actions tab.

---

## The admin panel

Sign in at `/admin`.

| Section | What the team can do |
| --- | --- |
| Overview | Counts of posts, team members, messages, donations to verify |
| Blog posts | Write, edit, upload a cover image, save as draft, publish, delete |
| Team members | Add or edit a member, upload a photo, reorder, hide, delete |
| Messages | Read everything sent through the contact form |
| Donations | See self-reported donations and mark each one verified |
| Trash | Restore anything deleted, or - owners only - delete it forever |

Deleting never destroys a record: it moves to **Trash**, where it can be
restored at any time. **Delete forever** on that screen is the one irreversible
action in the panel, so it asks for confirmation and is limited to owners.

Post content uses a deliberately simple format: a blank line starts a new
paragraph, and a line beginning with `## ` becomes a heading. Publishing
revalidates the affected pages, so changes appear on the website within seconds
without a redeploy.

---

## Deploying

Vercel is the natural host for a Next.js app and its free tier covers this
site's traffic.

1. Push this folder to a Git repository.
2. Import it at [vercel.com](https://vercel.com).
3. Add the same environment variables from `.env.local` in the project settings.
4. Point the foundation's domain at Vercel. HTTPS is issued automatically.

---

## Where to change things

| Change | File |
| --- | --- |
| Email, phone, address, social links, bank/UPI details | `src/lib/site.ts` |
| Colours, type scale, spacing | `src/app/globals.css` (`:root` tokens) |
| Home page copy and statistics | `src/app/(site)/page.tsx` |
| About page: story, objectives, aims | `src/app/(site)/about/page.tsx` |
| Fallback content used before Supabase is connected | `src/lib/seed.ts` |
| Email wording | `src/lib/email.ts` |

---

## Still needed from the foundation

Received so far: the logo artwork, director photographs, the official email
address, office hours, and all five social media URLs.

Still outstanding:

- **Bank account name, number, IFSC, branch, account type and UPI ID.** The
  account is not open yet, so `site.bank.ready` is `false` and the donate page
  shows a "coming shortly" notice instead. No placeholder account numbers are
  published anywhere. Set `ready: true` in `src/lib/site.ts` only once every
  character has been checked against the passbook.
- **The real UPI QR image** — replace `public/upi-qr.svg` (the current file is a
  visual placeholder and is **not** scannable).
- Home page highlights / impact numbers, programs, opening blog posts, event
  photographs, and testimonials.
- The domain name, registrar and DNS access.
- Names and email addresses of everyone who should receive an admin login
  (added under **Authentication → Users** in Supabase).

## Notes

- Light and dark themes are both designed; the toggle sits in the header and the
  choice is remembered.
- Contact and donor endpoints are rate-limited to 5 submissions per IP per 10
  minutes and carry a honeypot field against bots. The limiter is in-memory,
  which is right for a single instance; move it to Upstash Redis if the site is
  ever scaled to several.
- `robots.txt` and `sitemap.xml` are generated. `/admin` and `/api` are excluded
  from indexing.
- Row-level security is on for every table: the public can read published
  content and submit forms, but only signed-in staff can read messages or
  donations, or change content.
- The registered office address and a public phone number are deliberately not
  published, at the foundation's request. `site.showAddress` and `site.phone`
  control this.
