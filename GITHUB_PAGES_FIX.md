# GitHub Pages Frontend Fix

Your GitHub Pages URL is currently showing the README-style documentation page instead of the designed frontend.

This usually happens because GitHub Pages is serving the wrong `index.html` or Jekyll is rendering the README instead of the intended frontend file.

## Correct GitHub Pages Setup

Your repository root should have an `index.html` that loads the public website or redirects to the final portal/demo.

Recommended simple structure for GitHub Pages:

```text
Kavach360/
├── index.html                 <-- GitHub Pages entry file
├── final-release/
│   ├── public-website.html
│   ├── final-portal.html
│   └── phishing-redirect-page.html
├── portal-clean/
│   └── left-glass-portal.html
├── cyber-awareness-design/
├── kavach360-production-starter/
└── README.md
```

## Option 1: Show Public Website First

Replace the root `index.html` with a redirect to:

```text
final-release/public-website.html
```

Use this root `index.html`:

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Kavach360</title>
  <meta http-equiv="refresh" content="0; url=final-release/public-website.html" />
</head>
<body>
  <p>Redirecting to Kavach360 website...</p>
  <p><a href="final-release/public-website.html">Click here if you are not redirected.</a></p>
</body>
</html>
```

## Option 2: Show Final Portal First

Replace root `index.html` with:

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Kavach360 Portal</title>
  <meta http-equiv="refresh" content="0; url=final-release/final-portal.html" />
</head>
<body>
  <p>Redirecting to Kavach360 portal...</p>
  <p><a href="final-release/final-portal.html">Click here if you are not redirected.</a></p>
</body>
</html>
```

## Best Option

Use Option 1 for public visitors:

```text
/                         -> public website
/final-release/final-portal.html -> portal demo
/final-release/phishing-redirect-page.html -> phishing redirect demo
```

## Git Commands

After replacing root `index.html`:

```bash
git add index.html
git commit -m "Fix GitHub Pages frontend entry point"
git push
```

Then wait 1–3 minutes and refresh:

```text
https://shubham-vishwakarma5606.github.io/Kavach360/
```

If still cached, hard refresh:

```text
Ctrl + F5
```

## GitHub Pages Settings

Go to:

```text
GitHub Repo → Settings → Pages
```

Set:

```text
Source: Deploy from a branch
Branch: main
Folder: /root
```

Then save.
