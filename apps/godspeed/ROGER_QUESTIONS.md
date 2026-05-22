# Questions for Roger — kickoff sync

7 questions. Most are 1-line answers. The first one blocks the most downstream work.

## 1. Logo — vector source file?

Do you have the logo as a vector file (AI, SVG, PDF, EPS)? The Instagram profile pic is 320×320 px, which is too small for the desktop hero on the site.

- If **yes** → drop it in a Dropbox / Drive share, or send via email.
- If **no** → tell us who designed it (we can reach out for the source), or okay us to do a vector trace from the IG pic (the trace will look ~95% like the original but is not pixel-perfect).

**Why this matters:** without vector, the hero is capped at "mid". Single highest-leverage answer in this list.

## 2. Real menu — current items + prices?

A photo of the in-shop menu or a Google Doc list works. We need:

- Drink names
- Optional 1-line descriptions ("the nectar — coffee, milk, and a secret ingredient")
- Prices
- Anything you want to flag as seasonal / rotating
- Food / pastries — same structure

## 3. Team — who's on it?

Do you want an "our team" section on the `/our-story` page? If yes:

- Names + roles + 1-sentence bios for each person
- Optional headshots (a casual shop photo works fine)

If no, we skip the section entirely. Both are valid choices for V1.

## 4. Holiday hours — what's the pattern?

You're closed Mon + Tue regularly. What about:

- Federal holidays (July 4, Thanksgiving, Christmas, New Year's, etc.)?
- Local Columbia events (any USC home-game days closed early?)?

We can wire a `holidays` block in `content/hours.json` that shows "closed today (holiday)" on the open-now pill. Tell us the holidays you typically close and we'll seed it.

## 5. Vendors + collaborators — who gets credit?

You've shouted out @sparrowconstruction (buildout) and @ppjzz (collab drops) on Instagram. For the site:

- Whose beans / roaster do you use? (probably belongs in `/our-story`)
- Any pastry / treats supplier you want to credit?
- Any other long-running collaborators worth a permanent shoutout?

## 6. Newsletter — any existing list?

If you already collect emails (paper sheet at the shop, IG DMs, etc.), do you want to import them into a Buttondown list at launch? If yes, get them into a CSV (`name,email,date`) and we'll import on launch day.

If you don't have a list yet, the site will start one from zero. Either is fine.

## 7. Anything off-limits or sensitive?

Anything we should know not to put on the site? Examples:

- Family / personal info that shouldn't be public
- Vendor relationships that aren't public yet
- Drinks you're piloting but haven't named publicly
- Hours patterns you want flexible (e.g., "open later on Fridays during summer")

---

## Format

Reply however is easiest — voice memo, email, DM. We'll convert into the actual content files. **You don't need to write polished copy** — we'll handle the voice once we have the raw info.

Target: get these answers within a week so we can unblock content work (P2 in `PLAN.md`).
