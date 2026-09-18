# Lochan Pranav, portfolio site

A hand-written site: plain HTML and CSS, no build tools, no frameworks. Anyone with a text editor can change it, and it will still work in ten years.

## What is here

```
index.html                    home: intro, selected work, maps, visual work, about, contact
styles.css                    the only stylesheet
work/
  address-masters-dashboard.html
  tulsa-event-monitor.html
  savor.html
  spar-website.html
assets/                       images and the resume PDF (see assets/README.md)
.claude/launch.json           lets Claude Code open a local preview
```

## Preview it on your Mac

Open Terminal, then run:

```bash
cd ~/Projects/lochan-portfolio && python3 -m http.server 8766
```

Then open http://localhost:8766 in a browser. Press Control and C in Terminal to stop the server. The pages also open directly by double-clicking the HTML files, but the fonts and links behave best through the server.

## Editing

Every page is one HTML file. Text lives between tags like `<p>` and `</p>`. Change the words, save, and reload the browser.

Green boxes that read "Fill before publishing" are notes to you. Each is a `<div class="todo">` block. Delete the whole block when the page is done.

Square brackets mark facts only you know, such as `[number] rounds`. Replace them or delete the sentence. Never publish a bracket.

Dashed boxes are image slots. Each one names the file it expects, for example `assets/tulsa/hero.png`. Export the image, save it under that name, then replace the dashed `<div class="frame placeholder">...</div>` with `<img src="../assets/tulsa/hero.png" alt="describe the image">` inside the same `<div class="frame">`. On the home page the paths have no `../` in front.

## Before the site goes live

1. Every bracket replaced or removed. Search each file for `[`.
2. Every green note deleted. Search for `class="todo"`.
3. Every image slot filled or removed. Search for `placeholder`.
4. Resume PDF saved as `assets/Lochan_Pranav_Resume.pdf`.
5. The email address and links in the contact section are the ones you want public.
6. The Tulsa app made public in Streamlit, or its link replaced with a walkthrough video.

## Putting it online

The step-by-step guide is in [docs/DEPLOY.md](docs/DEPLOY.md). Short version:

The plan is GitHub Pages: free, no server, and it gives you a GitHub account for the rest of the job search.

1. Create a GitHub account. The handle goes on the resume.
2. Create a repository named `<your-handle>.github.io`.
3. Put these files in it (Claude Code will walk you through `git` step by step).
4. In the repository settings, under Pages, choose the main branch. The site appears at `https://<your-handle>.github.io` within a few minutes.
5. Optional custom domain. On 16 September 2026 a `whois` lookup showed `lochanpranav.com` with no registration. Buy it from a registrar, then follow GitHub's custom-domain guide to point it at Pages.

## Design notes

Paper background, near-black ink, one green borrowed from Brooklyn street signs. Display type is Bricolage Grotesque, body type is Hanken Grotesk, and dates, roles and numbers are set in JetBrains Mono. Fonts load from Google Fonts. The site is deliberately light-only.
