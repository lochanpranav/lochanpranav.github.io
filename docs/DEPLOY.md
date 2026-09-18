# Putting the site online

What you end up with: a public GitHub repository named `lochanpranav.github.io`, the site live at https://lochanpranav.github.io a few minutes after publishing, and optionally the same site at https://lochanpranav.com. If the handle lochanpranav is taken, use the handle you chose wherever this guide says lochanpranav.

The repository on this Mac is already initialized with a first commit. Files listed in `.gitignore` (backups, preview, the .claude folder) never leave the machine.

## Step 1. Create a GitHub account

1. Go to https://github.com/signup and sign up with your personal email.
2. Choose the handle `lochanpranav` if it is free. It becomes your site address and goes on your resume.
3. Verify the email GitHub sends you.

## Step 2. Install GitHub Desktop

1. Download it from https://desktop.github.com and open it.
2. Choose Sign in to GitHub.com. It opens your browser; sign in there and allow the app.
3. When it asks for the name and email to put on commits, use your name and either the email you signed up with or the no-reply address GitHub shows at https://github.com/settings/emails.

## Step 3. Publish the site

1. In GitHub Desktop choose File, then Add Local Repository, then Choose, and pick the folder `Projects/lochan-portfolio` inside your home folder.
2. Click Publish repository. Name it exactly `lochanpranav.github.io`. Untick "Keep this code private". Click Publish repository.

## Step 4. Turn on GitHub Pages

1. Open https://github.com/lochanpranav/lochanpranav.github.io/settings/pages
2. Under Build and deployment set Source to "Deploy from a branch", Branch to `main`, folder to `/ (root)`, and click Save.
3. Wait one or two minutes, then open https://lochanpranav.github.io. If you see a 404, wait another minute and reload.

## Step 5. Updating the site later

Edit the files in the folder, or ask Claude Code to. Then in GitHub Desktop type a short summary of the change, click Commit to main, then Push origin. The live site updates within about a minute.

## Step 6. Your own domain

1. Buy `lochanpranav.com` from a registrar. Cloudflare Registrar sells at cost, about ten dollars a year: https://www.cloudflare.com/products/registrar/ . Porkbun (https://porkbun.com) and Namecheap (https://www.namecheap.com) are fine too. Decline any website builder, email or "premium DNS" upsell.
2. In the registrar's DNS settings add these records. The addresses come from GitHub's documentation.

   | Type  | Host | Value                    |
   |-------|------|--------------------------|
   | A     | @    | 185.199.108.153          |
   | A     | @    | 185.199.109.153          |
   | A     | @    | 185.199.110.153          |
   | A     | @    | 185.199.111.153          |
   | CNAME | www  | lochanpranav.github.io   |

   On Cloudflare, set each record to "DNS only" (the grey cloud), not proxied.
3. Back at https://github.com/lochanpranav/lochanpranav.github.io/settings/pages, under Custom domain type `lochanpranav.com` and click Save. GitHub adds a file named `CNAME` to the repository. In GitHub Desktop click Fetch origin, then Pull origin, so your Mac has it too.
4. Wait for the DNS check on that page to pass. It usually takes minutes, sometimes a few hours. Then tick Enforce HTTPS.
5. Recommended: verify the domain for your account at https://github.com/settings/pages so nobody else can point it at their Pages site.

## If something goes wrong

- 404 after enabling Pages: wait two minutes and hard refresh. Check the repository name is exactly your handle followed by `.github.io`.
- Missing images: the folder structure must be intact. GitHub Desktop publishes everything except what `.gitignore` lists, so do not move the `assets` folder.
- DNS check keeps failing: confirm the four A records and the www CNAME, then wait. DNS changes can take up to a day to spread.

GitHub's own guides: https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site and https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site
