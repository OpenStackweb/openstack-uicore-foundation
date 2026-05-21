/**
 * Copyright 2026 OpenStack Foundation
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

import React from "react";

// Returns a callback with a stable identity that always invokes the latest
// version of `fn`. Useful for calling props (like a parent's onChange) from
// inside an effect without listing them as deps, which would re-run the effect
// every time the consumer passes a new inline arrow function.
//
// Stable-identity wrapper over the latest-ref pattern; equivalent to React's
// still-experimental useEffectEvent. Replace with the native hook when it
// ships in a stable release.
const useEventCallback = (fn) => {
    const ref = React.useRef(fn);
    React.useLayoutEffect(() => {
        ref.current = fn;
    });
    return React.useCallback((...args) => ref.current(...args), []);
};

export default useEventCallback;
