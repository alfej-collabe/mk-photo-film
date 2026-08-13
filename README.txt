# MK Photo Films — New Netlify Project

## What is included
- Cream + brown photography website
- Public portfolio with category filters:
  Wedding, Pre-Wedding, Baby Shoot, Maternity, Engagement, Birthday, Other
- Studio/Admin login
- Edit all website text from Admin
- Founder photo upload
- Automatic client/media counters
- Add/delete client albums
- Change album category
- Upload multiple photos
- Add YouTube/Instagram/video links
- Delete individual media
- Client album lightbox/gallery
- Netlify Blobs persistence
- Netlify Functions for settings, clients and media

## Deploy
1. Create a new GitHub repository or use an empty repository.
2. Upload the complete contents of this folder. Keep `netlify/functions/` exactly as it is.
3. Connect the GitHub repository to Netlify.
4. Deploy.
5. In Netlify, open the project and use the website URL.
6. Open the website and click `Studio Admin` in the footer.
7. Default admin password: `mkphotofilm2026`

## Important
The password is currently checked in the browser, so this is a convenience admin panel, not production-grade authentication. For a real business deployment, move authentication to a server-side identity system.

## Netlify Blobs
The functions use the store name `mkphotofilms`. The project must have Netlify Blobs available to the deployed functions.

## If an old site has data
This is a fresh project. It intentionally starts with empty client albums and fresh default settings so old broken data/code does not interfere.
