# NutriCheck — Maple Leaf Kitchen

A small responsive restaurant menu with a JSON Server API.

## Run locally

1. Install Node.js, then run `npm install` once.
2. In one terminal run `npm run api` to start the API at `http://localhost:3000`.
3. In another terminal run `npm start` and open `http://localhost:8080/menu.html`.
4. Run `npm test` for the JavaScript tests and coverage report.

Menu data is stored in `db.json`. JSON Server saves changes there while it runs locally.

## Deploy the API

The included `render.yaml` describes a Render web service and persistent disk. Push this project to a Git repository, create a new Blueprint on Render from that repository, then wait for the `nutricheck-api` service to deploy. Its `/meals` route is the menu API.

After deployment, copy the service URL into `api-config.js`, replacing `http://localhost:3000`, then redeploy the static site. The API URL should be the base URL only, without `/meals`.

## JavaScript modules

- `js/meals-api.js` handles validation and GET, POST, PUT, PATCH, and DELETE requests.
- `js/menu.js` renders and filters meals, adds meals to the cart, and provides menu editing actions.
