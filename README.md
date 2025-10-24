# Purifier Timer

A cross-platform React Native (Expo) app to track water purifier filter usage and lifecycle. Supports local persistence and optional cloud sync via TextDB.online.

## Features

- Track multiple filters with percentage and remaining days
- Cloud sync using a simple text-key (TextDB.online)
- Cross-platform: iOS, Android, Web (Expo)
- Auto-scaling UI for long labels
- Custom alert dialog for web compatibility
- Animated filter progress with flowing water effect

## Quick start (development)

Requirements:
- Node.js 20.19.4
- npm or Yarn
- Expo CLI (optional, recommended for native testing)

Install dependencies:

```bash
npm install
# or
# yarn
```

Run locally (web):

```bash
npm run web
# or with expo
# expo start --web
```

Run on device/emulator (iOS/Android):

```bash
npm start
# or
# expo start
```

## Build for web

Use your preferred build command depending on setup (e.g., `npm run build` or `expo build:web`). Deploy the produced static files to any static hosting platform.

## Deployment suggestions

- Vercel or Netlify for easy Git-based deployments
- Cloudflare Pages for high-performance, free bandwidth
- GitHub Pages for simple static hosting

## License

This project is licensed under the GNU General Public License v3.0 (GPL-3.0). See the `LICENSE` file for details.

## Notes

- The included `LICENSE` file contains a shortened placeholder. Replace it with the full GPLv3 text if you plan to publish this repository publicly.
