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
react-beautiful-dnd, etc.) are intentionally commented out of
`src/components/index.js` (see the `// these include 3rd party deps` block)
so that consumers who don't use them aren't forced to install those peer
dependencies just to import something unrelated from the barrel. These
components are only reachable via their individual path — a barrel import
will not resolve them.

### Enviroment Variables

* TIMEINTERVALSINCE1970_API_URL                         = URL used on clock component to get server time   

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
