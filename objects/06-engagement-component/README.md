# Columbia Study Space Poll

A responsive Firebase Realtime Database poll created for Columbia GSAPP Computational Design Workflows.

## Poll question

**Where do you usually study at Columbia University?**

Options: Butler Library, Avery Library, Campus Café, Dorm / Home, Outdoor Spaces, and Studio / Lab.

## Features

- Six campus study-space options
- Real-time synchronized counts
- Live percentages and result bars
- Total responses and leading response
- Firebase connection status
- One saved response per browser using `localStorage`
- A participant may change their response without creating an extra vote
- Responsive and keyboard-accessible interface
- Project-use, data-collection, and ethics statements

## Files

- `index.html` — page structure and project text
- `style.css` — responsive visual design
- `poll-app.js` — Firebase configuration, voting, and live updates

## Data structure

```text
studyPoll
  avery: 0
  butler: 0
  cafe: 0
  dorm: 0
  outdoor: 0
  studio: 0
```

## Important limitation

The browser-local response marker is a lightweight duplicate-vote safeguard, not secure authentication. Clearing browser storage or using another browser can bypass it. Production deployment should add authentication and stricter Firebase security rules.

## Run locally

Serve the folder through a local web server rather than opening it only as a `file://` URL. For example, use VS Code Live Server or:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.
