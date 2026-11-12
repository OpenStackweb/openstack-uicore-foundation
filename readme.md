OpenStack UICore
====================

Lib for ReactJS/Redux common components for marketing site https://www.openstack.org

* https://www.npmjs.com/package/openstack-uicore-foundation
* https://docs.npmjs.com/getting-started/publishing-npm-packages

Include Styles:
import 'font-awesome/css/font-awesome.css';
import 'openstack-uicore-foundation/lib/css/components.css';
import 'sweetalert2/dist/sweetalert2.css';

## Importing Components

Prefer importing components from their individual paths rather than the
`openstack-uicore-foundation/lib/components` barrel:

```js
import UploadInputV3 from 'openstack-uicore-foundation/lib/components/inputs/upload-input-v3';
```

Components that pull in heavy 3rd-party dependencies (MUI, Stripe,
@hello-pangea/dnd, etc.) are intentionally commented out of
`src/components/index.js` (see the `// these include 3rd party deps` block)
so that consumers who don't use them aren't forced to install those peer
dependencies just to import something unrelated from the barrel. These
components are only reachable via their individual path — a barrel import
will not resolve them.

### Enviroment Variables

* TIMEINTERVALSINCE1970_API_URL                         = URL used on clock component to get server time   

## Migrating to 6.0

6.0 moves the library to MUI v9 and adds React 19 support. Update the app before bumping it.

### Peer dependencies

| Package | 5.x | 6.0 |
|---|---|---|
| `react`, `react-dom` | `^17` | `^18 \|\| ^19` |
| `@mui/material`, `@mui/icons-material`, `@mui/x-date-pickers` | `^6` / `^7` | `^9` |
| `react-select` | `^2` | `^5.10.2` |
| `react-final-form` / `final-form` | `^6` / `^4` | `^7` / `^5` |
| `react-datetime` | `^2` | `^3.3.1` |
| `react-redux` / `redux` | `^7` / `^3 \|\| ^4` | `^7 \|\| ^8 \|\| ^9` / `^3 \|\| ^4 \|\| ^5` |

New peers: `@hello-pangea/dnd` (replaces `react-beautiful-dnd`), `@vis.gl/react-google-maps` and `@googlemaps/markerclusterer` (replace `react-google-maps`). `react-bootstrap`, `react-rte` and `react-google-maps` are no longer used.

### Removed

- `inputs/editor-input` and `inputs/editor-input-v2`, and the `TextEditor` barrel export. Use `inputs/editor-input-v3` (`id`, `name`, `value`, `onChange`, `error`); its `onChange` gets the same `{ target: { id, value } }` event.
- The `inputProps` prop of `mui/addon-type-select` and `mui/formik-inputs/addon-type-select`; pass `error` / `helperText` instead.

### Behavior changes

- `google-map` (`GMap`) is now a function component: refs to the old class instance no longer work. It reuses the Maps script the app already loads.
- `inputs/datetimepicker` still accepts the react-datetime v2 prop names (`defaultValue`, `viewDate`, `viewMode`, `onBlur`, `onFocus`, …) and maps them to v3.
- Function components no longer read `defaultProps`; omitted props get the same defaults through default parameters.

### In the app

- If the app imports `react-select` directly, switch `react-select/lib/Async`, `lib/Creatable` and `lib/AsyncCreatable` to `react-select/async`, `react-select/creatable` and `react-select/async-creatable`.
- Follow the [MUI v7](https://mui.com/material-ui/migration/upgrade-to-v7/) and later migration guides for the app's own MUI code. Two changes no codemod covers:
  - System props on `Box`, `Stack` and `Typography` (`<Box display="flex" mt={2}>`, `<Typography color="text.secondary">`) are ignored; move them into `sx`.
  - In `sx`, a bare palette name no longer resolves to a color: use `color: "error.main"`, not `color: "error"`.
- `Grid2` is now `Grid`, and `Grid`'s legacy `item` / `xs` props are gone (use `size`).

## How to publish new version

Publishing is manual; CI only builds and tests, it never publishes.

Stable release, from an up-to-date `main`:

```bash
yarn build
yarn publish --new-version X.Y.Z   # bumps package.json, commits "vX.Y.Z", creates tag vX.Y.Z, publishes as `latest`
git push origin main               # the version-bump commit (open a PR instead if main is protected)
git push origin vX.Y.Z             # push only this tag
```

Beta release, from the feature branch:

```bash
yarn build
yarn publish --new-version X.Y.Z-beta.N --tag beta   # `--tag beta` keeps `latest` pointing at the stable version
git push origin vX.Y.Z-beta.N
```

Notes:
- Tags always carry the `v` prefix (`v5.0.73`, not `5.0.73`).
- `yarn publish --new-version` already creates the tag, so don't run `git tag` afterwards; it fails with "already exists".
- Avoid `git push origin --tags`: it pushes every local tag, including betas that were never meant to be on origin.


## React compatibility

`createExternalStore` (and the clock context built on it) uses the `use-sync-external-store` shim for React 16/17 compatibility. When React is upgraded to 18+, replace the shim with the native import from `react` and remove the `use-sync-external-store` dependency from package.json.

## Troubleshoot
For Python 3.13 and above, yarn install will not work until you install this lib: sudo apt install python3-setuptools
