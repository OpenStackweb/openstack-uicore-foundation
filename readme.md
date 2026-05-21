OpenStack UICore
====================

Lib for ReactJS/Redux common components for marketing site https://www.openstack.org

* https://www.npmjs.com/package/openstack-uicore-foundation
* https://docs.npmjs.com/getting-started/publishing-npm-packages

Include Styles:
import 'font-awesome/css/font-awesome.css';
import 'openstack-uicore-foundation/lib/css/components.css';
import 'sweetalert2/dist/sweetalert2.css';

### Enviroment Variables

* TIMEINTERVALSINCE1970_API_URL                         = URL used on clock component to get server time   

1 - yarn build && yarn publish


## React compatibility

`createExternalStore` (and the clock context built on it) uses the `use-sync-external-store` shim for React 16/17 compatibility. When React is upgraded to 18+, replace the shim with the native import from `react` and remove the `use-sync-external-store` dependency from package.json.

## Troubleshoot
For Python 3.13 and above, yarn install will not work until you install this lib: sudo apt install python3-setuptools
