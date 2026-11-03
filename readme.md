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

1 - yarn build && yarn publish


## React compatibility

`createExternalStore` (and the clock context built on it) uses the `use-sync-external-store` shim for React 16/17 compatibility. When React is upgraded to 18+, replace the shim with the native import from `react` and remove the `use-sync-external-store` dependency from package.json.

## Troubleshoot
For Python 3.13 and above, yarn install will not work until you install this lib: sudo apt install python3-setuptools
