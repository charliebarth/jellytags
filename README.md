<p align="center">
  <img src="logo.png" alt="JellyTags Logo" width="150" />
</p>

# JellyTags
JellyTags is a lightweight, responsive web application for managing tags within your Jellyfin media library. Easily select multiple movies or shows and batch-apply tags.

![Screenshot](docs/screenshot.png)

> [!WARNING]
> **Early Version & Disclaimer**
> 
> This is an early-stage release. While it has been thoroughly tested, this application modifies your media metadata. We strongly recommend creating a backup of your Jellyfin database before use. Use it at your own risk.

## Features
- **Batch Editing:** Select multiple media items and apply **tags or genres** to all of them at once (append, replace, or remove).
- **Tag Suggestions:** View existing tags/genres across your selection and stage new or current ones.
- **Tag Filter:** Filter the grid by one or more tags with **Has all** / **Missing all** modes — e.g. quickly find everything *missing* a given tag. Backed by a searchable picker that scales to thousands of tags.
- **Responsive Design:** A mobile-friendly sliding drawer lets you manage metadata on the go.
- **Sorting & Filtering:** Find specific media quickly with the search bar, source-library and parental-rating filters, and sorting dropdown.

## Requirements
- A [Jellyfin](https://jellyfin.org/) server.
- An API Token from your Jellyfin server with **Administrator** privileges (needed to fetch the admin user's library context and update items).

## Running via Docker (Recommended)
You can easily spin up the JellyTags interface using Docker and Docker Compose. Environment variables are substituted at runtime.

### 1. Create a `docker-compose.yml`
Create a `docker-compose.yml` file anywhere on your server, or clone this repository and modify the existing one.

```yaml
services:
  jellytags:
    image: christt105/jellytags:latest
    container_name: jellytags
    restart: unless-stopped
    ports:
      - "8181:80"
    environment:
      - VITE_JELLYFIN_URL=http://your-jellyfin-server-ip:8096
      - VITE_JELLYFIN_TOKEN=your_admin_api_token
```

### 2. Start the container
Run the following command:
```bash
docker-compose up -d
```
Access the interface at `http://localhost:8181`.

## Installation (Local Development)

Built with **Vue 3 + Vuetify + Vite + TypeScript** (Pinia for state). The app is
pure frontend — it talks directly to the Jellyfin REST API via `@jellyfin/sdk`;
there is no backend.

### 1. Clone the repository
```bash
git clone https://github.com/charliebarth/jellytags.git
cd jellytags
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Variables
To run JellyTags locally, create a `.env` file at the root of the project:
```env
VITE_JELLYFIN_URL=http://localhost:8096
VITE_JELLYFIN_TOKEN=your_admin_api_token
```

### 4. Start the Development Server
```bash
npm run dev      # Vite dev server on http://localhost:8181
```

Other scripts: `npm run build` (type-checks with `vue-tsc`, then builds),
`npm run test` (Vitest), `npm run typecheck`.

> This is a fork of [`christt105/jellytags`](https://github.com/christt105/jellytags).
> The production Docker image is built from source (multi-stage → nginx); the
> Jellyfin URL/token are injected at container start by `docker-entrypoint.sh`,
> so the same image works against any server without rebuilding.

## Support / Sponsor
If you found this tool useful, consider buying me a coffee!

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/christt105)
