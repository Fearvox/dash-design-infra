# Contributing — godspeed.coffee

How to edit content on the site without writing code.

Everything you'd want to change as a non-engineer lives in `apps/godspeed/content/`:

```
content/
├── hours.json           # opening hours + holidays
├── menu.md              # menu
├── pages/
│   ├── home.md          # the front page body
│   └── our-story.md     # the our-story page
└── journal/
    └── YYYY-MM-DD-slug.md   # one file per journal post
```

To edit anything, open the file in GitHub's web editor (or your local editor if you're set up), change the text, save / commit. Vercel rebuilds automatically and the live site updates in ~30 seconds.

## How to add a journal post

1. Open the repo in GitHub: <https://github.com/Fearvox/dash-design-infra>.
2. Navigate: `apps/godspeed/content/journal/`.
3. Click **Add file → Create new file**.
4. Name the file `YYYY-MM-DD-short-title.md`, e.g. `2026-06-15-gdspd-x-ppjzz-3.md`.
5. Paste this template and edit it:
   ```markdown
   ---
   title: gdspd x ppjzz, round three
   date: 2026-06-15
   ---

   write the post here. lowercase, warm, like you talk.

   you can use **bold**, *italic*, [links](https://example.com), and lists:

   - thing one
   - thing two
   ```
6. Scroll down, write a short commit message ("new journal post: ppjzz 3"), click **Commit changes**.
7. Wait ~30 seconds. Visit `https://godspeed.coffee/journal/` to see it live.

**The first line `---` block is required.** It tells the site what the title and date are. Without it the build fails.

**The filename** matters: it must start with a date (`YYYY-MM-DD-`). The rest of the filename becomes the URL slug.

## How to change hours

1. Open `apps/godspeed/content/hours.json`.
2. Find the day you want to change.
3. Either set it to `null` (closed all day) or `{ "open": "08:00", "close": "15:00" }` (24-hour, two-digit numbers — `09:00`, not `9:00`).
4. Commit.

For a one-off closure (a holiday, a snow day), add a date under `holidays`:

```json
"holidays": {
  "2026-07-04": null,
  "2026-12-25": null
}
```

The site will show "closed today (holiday)" on the indicator on that day. Setting it to `null` means closed; you can also use an object to override hours (`{ "open": "10:00", "close": "14:00" }` for shorter hours).

## How to change the menu

`apps/godspeed/content/menu.md`. Edit, commit. Same flow.

## How to swap a photo

Photos live in `apps/godspeed/public/photos/`. Upload via GitHub's "Add file → Upload files" or replace one in place. Keep filenames simple (no spaces, no emoji): `2026-06-storefront.jpg`, not `the new storefront!!.jpg`.

Reference photos in markdown like this:

```markdown
![the storefront on a sunny saturday](/photos/2026-06-storefront.jpg)
```

The first part in brackets is alt-text for accessibility. It's not optional — describe what's in the photo. A blind reader on a screen reader will read this aloud.

## When the deploy fails

Vercel will email you within ~30 seconds if the build broke. Common causes:

1. **Missing frontmatter** — the `---` block at the top of a journal post is missing or malformed. Open the file, make sure it's there with both `title` and `date`.
2. **Bad date** — date must be exactly `YYYY-MM-DD` (e.g. `2026-06-15`, not `6/15/26`).
3. **Malformed hours.json** — usually a missing comma or a stray quote. Vercel's email links to the exact error.

If you can't figure it out, revert the bad commit (GitHub UI → commits list → "Revert"), and ping 0xvox.

## Brand voice

See `VOICE.md` in this directory before writing copy. Short version: lowercase, warm, no corporate vocab, "godspeed" can be an adjective.

## When you want a bigger change

For anything that touches design, layout, or new features — open a GitHub issue or DM 0xvox. The content workflow above is for "I want to say something new" or "the hours changed", not for "we should redesign the menu page."
