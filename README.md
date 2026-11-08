# utility-bill-splitter

Split common utility bills in cases with a unit-based differential tariff where consumption data for individual users is only partially available.

## Example

Imagine people sharing an apartment where a few of them run heavy appliances (e.g. an AC). To divide the common utility bill fairly:

1. Each person reports how many units their appliances consumed (assuming smart appliances).
2. Those appliance units are priced slab-wise against the bill's total consumption, and each person pays for their own appliance usage.
3. The rest of the bill (common usage) is split equally among all users.

People who do **not** run any personal appliances are still included — they pay only their equal share of the common charges.

## Features

- **Dynamic person count**: set how many people share the bill (default: 4). Users without appliances pay only their common share.
- **Add/remove users**: dynamically add or remove household members with personal appliance readings.
- **Live calculation explanation**: a card below the inputs explains each step of the math using actual values.
- **Slab-wise tariff breakdown**: configurable tariff slabs priced from highest to lowest.
- **Settings screen**: rename users via the gear icon in the header (used to be a separate settings page).

## Tech stack

- [React 17](https://reactjs.org/) + [MUI](https://mui.com/) for the UI
- [Webpack 5](https://webpack.js.org/) + Babel for build and dev server
- [Module Federation](https://webpack.js.org/concepts/module-federation/) — built as a micro-frontend (remote)
- [Firebase Hosting](https://firebase.google.com/products/hosting) for deployment

## Project structure

```
├── config/
│   ├── webpack.common.js   # shared webpack rules (babel, css, html)
│   ├── webpack.dev.js      # dev server config (port 8080) + module federation
│   └── webpack.prod.js     # production config + module federation
├── public/
│   └── index.html          # template; mounts into #utility-bill-splitter
├── src/
│   ├── index.js            # entry — imports App
│   ├── App.js              # mounts Home (standalone in dev)
│   └── components/
│       ├── Home.js         # main UI + splitting logic (tariffs, calculation)
│       ├── Settings.js     # placeholder — settings are inline in Home.js now
│       └── table/Table.js  # reusable MUI Table wrapper
├── .github/workflows/      # Firebase Hosting CI (live deploy + PR previews)
├── firebase.json           # hosting config (publishes dist/)
└── .firebaserc             # Firebase project: utility-bill-splitter
```

## Getting started

### Prerequisites

- Node.js 16+ (build and dev server verified on Node 24)
- npm

### Install

```sh
npm install
```

### Development

```sh
npm start
```

Starts the webpack dev server with hot reload at **http://localhost:8080**. Open that URL in a browser to use the app standalone.



### Production build

```sh
npm run build
```

Emits a production build to `dist/` (ready for Firebase Hosting).

### Scripts

| Command               | What it does                                                        |
| --------------------- | ------------------------------------------------------------------- |
| `npm start`           | Dev server on port 8080 (`config/webpack.dev.js`)                   |
| `npm run build`       | Production build to `dist/` (`config/webpack.prod.js`)              |


## Using it as a micro-frontend (Module Federation)

This repo is built as a **webpack Module Federation remote**:

|            | Value                                                    |
| ---------- | -------------------------------------------------------- |
| Remote name | `utility_bill_splitter`                                 |
| Entry file | `remoteEntry.js`                                        |
| Exposes    | `./App`                                                  |
| Shared     | `react` and `react-dom` (singletons, required versions from `package.json`) |

**Development** — the dev server sets `publicPath: http://localhost:8080/`, so a host app can consume it like this:

```js
// host app webpack config
new ModuleFederationPlugin({
    name: 'host_app',
    remotes: {
        utility_bill_splitter: 'utility_bill_splitter@http://localhost:8080/remoteEntry.js',
    },
});
```

**Production** — `publicPath` is `https://utility-bill-splitter.web.app/`, so remote specs look like `utility_bill_splitter@https://utility-bill-splitter.web.app/remoteEntry.js`.

In the host app, load the exposed module:

```jsx
const App = React.lazy(() => import('utility_bill_splitter/App'));
```

A live host app is at <https://projects.hareram.dev/>.

## Deployment (Firebase Hosting)

`firebase.json` publishes the `dist/` folder; `.firebaserc` points at the Firebase project `utility-bill-splitter`.

**CI** (`.github/workflows/`):
- Push to `main` → deploy to the **live** channel (`https://utility-bill-splitter.web.app`)
- Pull requests → deploy to a **preview** channel

Both require the `FIREBASE_SERVICE_ACCOUNT_UTILITY_BILL_SPLITTER` secret (Firebase service-account JSON) in the repo's GitHub secrets.

**Deploy manually** with the [Firebase CLI](https://firebase.google.com/docs/cli):

```sh
npm install -g firebase-tools
firebase login
npm run build
firebase deploy --only hosting
```

## How the splitting math works

Inputs: total units on the bill, total charges, per-user appliance units.

1. **Appliance tariff** — the sum of all users' appliance units is priced slab-wise via `calculateTariff()`, which walks the tariff slabs (highest first) and charges each unit at the slab rate that applies at its position in the bill's total consumption. A slab-wise breakdown table is shown.
2. **Per-user appliance cost** — each user's appliance units are charged at the average rate of the appliance block: `userUnits × (applianceTariff ÷ totalApplianceUnits)`. Users with no appliance pay 0 for this part.
3. **Common charges** — the remainder of the bill (`totalCharges − totalApplianceTariff`) is divided equally among **all** people in the household (not just those with appliances), and added to their appliance cost.
4. **Person count** — the number of people sharing the bill is set via the "Total persons" field (default: 4). This replaces the old hardcoded value.
