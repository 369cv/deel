# Deel landing page recreation

A responsive, static recreation of the supplied Deel homepage reference. The page uses HTML, CSS, and vanilla JavaScript; there are no runtime dependencies or build steps.

## Run locally

From the repository root:

```sh
python3 -m http.server 4173 --bind 0.0.0.0
```

Open <http://localhost:4173/>. The site uses relative asset URLs so the same files also work at a GitHub Pages project URL.

## Deploy with GitHub Pages

In **Settings → Pages**, select **Deploy from a branch** and publish `/ (root)` from `arena/c7c32d0b-deel`. The `.nojekyll` file tells GitHub to serve the static files as-is. The project URL is <https://369cv.github.io/deel/> once Pages reports a successful deployment.

## Assets and external services

The reference supplied for this project is the source for the brand marks, product artwork, Ramp hero imagery, and Revolut poster. Deel and other brand marks belong to their respective owners. The locally hosted Inter and Roboto font files are distributed under the licenses in `assets/fonts/`.

This is a recreation, not an official Deel service. Product, demo, and account links go to the official sites. The newsletter handoff does not send or store an email address. The Revolut video loads from YouTube only when a visitor chooses to play it.
