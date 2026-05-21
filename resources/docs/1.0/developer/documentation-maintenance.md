# Developer - Documentation Maintenance

## LaRecipe

1. The published LaRecipe config is `config/larecipe.php`.
2. Manuals are served from `/manuals` because Swagger already uses `/docs`.
3. Source pages live under `resources/docs/1.0`.
4. Screenshots are stored under `public/docs/screenshots`.
5. The sidebar comes from `resources/docs/1.0/index.md`.

## Updating Screenshots

1. Sign in as the target user.
2. Change only the user role needed for the panel being captured.
3. Capture the page after loading finishes and save the PNG under the matching role folder.
4. Restore the original role after capture.
5. Replace the screenshot link in the page entry if the filename changes.
6. Open `/manuals/1.0/<page>` and confirm the image renders.
