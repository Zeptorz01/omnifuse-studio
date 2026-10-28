# Contributing to OmniFuse

Thanks for helping improve OmniFuse. This professional-workspace redesign preserves and extends an existing app; please respect the original creator's rights and repository conventions.

## Working with the original repository

If your friend owns the source repository, agree on the scope before publishing changes. Work on a separate feature branch such as `feat/professional-workspace` and open a pull request rather than replacing the default branch without review.

A suggested pull request description:

> Redesign the existing OmniFuse Studio interface into a document-first workspace. Keep the original import, editing, preview and export workflows; add an accessible product tour, responsive settings inspector and updated desktop/mobile layout. Preserve credit for the original project.

## Contribution checklist

- Test with **PDF, image and text** inputs; check combined PDF, stitched PNG/JPEG, ZIP and `.omnifuse` project save/open.
- Check at 1440px and at a mobile viewport around 390px, including keyboard focus and touch targets.
- Confirm that all actions are operable without the tutorial and that the tutorial can be skipped.
- Avoid adding third-party document uploads, trackers or remote APIs without explicit review and a privacy update.
- Keep files working when the repository is served as a static site (GitHub Pages).
- Describe changes and limitations in the PR; add screenshots when the UI changes.

## Local testing

```bash
python -m http.server 8000
```

Open `http://localhost:8000` in your browser. Make sure the CDN-hosted PDF libraries loaded (internet required) before testing PDFs.

## Attribution

Fill in the original author, redesign contributor(s) and repository URLs in `CREDITS.md`. Commit with an email associated with your GitHub account if you want your work attributed correctly.
