# Jackie Studio

My personal website — art, fashion, videos, and vibes.

## Quick Start

Open `index.html` in your browser, or run a local server:

```bash
npx serve .
```

## Adding Content

### Gallery Images
Drop images into `assets/images/gallery/` and update the `<img>` tags in the Gallery section of `index.html`.

### Videos
Replace the video placeholders with YouTube embeds:
```html
<iframe src="https://www.youtube.com/embed/VIDEO_ID" ...></iframe>
```

For TikTok, update the `href` on `.video-link-overlay` with your video URL.

### Social Links
Update the `href` attributes in the footer social links with your actual profile URLs.

## Deployment

This site deploys on **Cloudflare Pages** with zero build step.

1. Push to GitHub
2. In Cloudflare: Workers & Pages > Create > Pages > Connect to Git
3. Build command: leave empty
4. Output directory: `/`
5. Every push to `main` auto-deploys

## Color Palette

| Name | Hex |
|------|-----|
| Sky | `#89CFF0` |
| Ocean Light | `#48CAE4` |
| Ocean | `#00B4D8` |
| Deep Ocean | `#0077B6` |
| Sand | `#FAEBD7` |
| Coral | `#FF8FA3` |
