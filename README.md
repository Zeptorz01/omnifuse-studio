# OmniFuse — Document Workspace

A focused, responsive document-assembly tool built from the original **OmniFuse Studio** project. Import PDFs, images and text, organize the queue, preview pages, and export a combined document — in the browser, without creating an account.

![OmniFuse document workspace](assets/preview-desktop.png)

## What this version changes

- **Productivity-first interface:** four small project metrics, a practical file queue, a central viewer and an output inspector. No decorative landing screen or distracting floating character.
- **Optional first-run product tour:** short, contextual, six-step walkthrough. It can be skipped and reopened using the help button. No long manual.
- **Mobile layout:** stacked panels, touch-accessible controls and a fixed export button on phones.
- **Professional themes:** Light, Dark, Forest and Slate.
- **Project continuity:** save all source files and settings into an `.omnifuse` project; reopen it later.
- **Session workflow:** undo, redo, search, filters, sorting, presets and recent exported files.
- **Improved visual exports:** PDF pages and text are rendered into stitched image output rather than substituting placeholder cards when PDF.js is available.

## Features retained from the original

- Import multiple PDF, common image or text files; drag and drop, clipboard paste, file picker, demo files (maximum 50 source files).
- Reorder by drag and drop on desktop, or up/down controls on desktop and phone; rotate individual files; rename items; add private file notes.
- Set PDF page ranges such as `1-3,5` and choose image fit (contain, cover or original).
- Inspect selected file preview and enlarge it.
- Export PDF, stitched PNG/JPEG, or a ZIP containing merged PDF and original sources plus a manifest.
- Choose document filename, metadata, page sizes, orientations, margins, image spacing and layout, watermark, page numbers and contents page.
- Use preset profiles and persist output preferences in the browser.
- Keyboard shortcuts and responsive interface.

## Open on a phone or laptop

**Quick preview:** use `OmniFuse-Professional-Open.html` (the standalone download supplied separately with this project). It has the app, style and JSZip logic in one file, but still requires an internet connection for the PDF engines.

**Full project:** open `index.html` with a modern browser, or serve this folder with:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000` on your computer. Use GitHub Pages to make it available to others from anywhere.

> PDF-Lib and PDF.js are loaded from cdnjs and the optional fonts load from Google Fonts. Open the app with an internet connection to make PDF import/export/preview available. Text and basic image workflows can work without the PDF engines. The bundled JSZip library enables local project saving. There is no upload backend in this project.

## Publish with GitHub Pages

1. Create a repository in your GitHub account or submit a pull request to your friend's existing repository (see below).
2. Upload the **contents** of this folder to the repository root: `index.html`, `app.js`, `style.css`, `assets`, `vendor`, and the Markdown files.
3. In the repository, open **Settings → Pages → Build and deployment**.
4. Select **Deploy from a branch**, choose `main` and `/(root)`, and save.
5. When deployment finishes, GitHub shows the public URL. Test it on desktop and phone.

If your repository is called `omnifuse`, its GitHub Pages URL typically follows the pattern `https://YOUR-USERNAME.github.io/omnifuse/` after publishing. It is not published until you complete these steps.

## Work as a contributor in your friend's repository

To have your redesign represented in the **original repository** rather than just in a copy:

1. Ask the original creator for the repo URL and their agreement to accept the changes.
2. **Fork** that repo on GitHub (or request collaborator access).
3. Create a branch such as `feat/professional-workspace`.
4. Copy the redesigned files into the cloned branch; commit from an email verified with your GitHub account.
5. Push the branch and submit a **pull request** into your friend's original repository.
6. Your friend reviews and merges the change. Accepted changes are generally represented in the commit history, although GitHub contribution displays vary by account and branch settings.

**Important:** The user-provided original file is not necessarily open-source. Get the author's permission before publishing it publicly, and fill in actual names/handles in `CREDITS.md`.

## Shortcuts

| Shortcut | Action |
|---|---|
| `?` | Open the quick product tour |
| `R` | Rotate selected file |
| `Ctrl/Cmd + Z` | Undo |
| `Ctrl/Cmd + Shift + Z` or `Ctrl/Cmd + Y` | Redo |
| `Delete` / `Backspace` | Remove selected item |
| `Ctrl/Cmd + Enter` | Export |
| `Ctrl/Cmd + V` | Paste a file from clipboard (where supported) |

## Privacy and limits

- File processing is performed in your browser; there is no server upload or account feature.
- Your original files stay in the current session unless you intentionally download a `.omnifuse` project. Your output settings are stored in localStorage.
- Encrypted/password-protected PDFs are not supported.
- Browser memory limits may affect very large documents or stitched images, especially on phones.
- PDF text uses PDF-Lib's built-in fonts, which do not support full Unicode. Some scripts may be replaced in generated PDF notes; original PDF pages themselves are copied without retypesetting.
- ZIP, PDF and image output rely on underlying browser capabilities. Always inspect the final export before sharing an important document.

## Project layout

```text
index.html                 Main semantic workspace
style.css                  Responsive UI + four professional themes
app.js                     Document workflow, preview, exports, onboarding
assets/favicon.svg         App branding
assets/preview-desktop.png  Workspace screenshot
assets/preview-mobile.png   Mobile screenshot
vendor/jszip.min.js        JSZip distribution
vendor/LICENSE-JSZip.md    Third-party license
README.md                  Setup and usage
CONTRIBUTING.md            Contribution workflow
CREDITS.md                 Original creator and redesign credits
```

This is a redesign of a provided project, **not a claim of original authorship of all features**. See `CREDITS.md` and the JSZip license.
