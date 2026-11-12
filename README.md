# ISP Register

Daily Hisab Management System - static website (HTML + CSS + JavaScript, no build step, no external dependencies).

## Files
- `index.html` - main page
- `css/style.css` - all styles (fonts are bundled locally)
- `js/app.js` - all application logic
- `assets/` - fonts and favicon
- `.nojekyll` - tells GitHub Pages to serve files as they are

## Deploy on GitHub Pages
1. Create a new GitHub repository and upload **all files from this folder** (keep the folder structure).
2. Open **Settings > Pages**.
3. Under **Build and deployment** choose **Deploy from a branch**, branch **main**, folder **/ (root)**, then **Save**.
4. After a minute your site is live at `https://YOUR-USERNAME.github.io/REPOSITORY-NAME/`.

## Important notes
- **Data stays in the browser.** Records are stored in each browser's localStorage, not on GitHub. A new web address starts empty.
- **Move your old data:** in your old ISP_Register file click **Save** (JSON backup), then on the new site click **Load** and choose that file. Do this on every device/browser you use, and make backups regularly.
- **Password:** the password is set in `js/app.js` (`APP_PASSWORD`). GitHub Pages sites are public and the file is readable by anyone, so it only keeps casual visitors out. Do not rely on it for real security.
