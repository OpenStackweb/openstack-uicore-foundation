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
 *
 * Pre-built clock store using createExternalStore.
 *
 * Wires the Clock component (server-synced, ticks every second) into a
 * createExternalStore instance. Components choose their update strategy:
 *
 *   - useClock() re-renders every second (for countdowns, live displays)
 *   - useClockSelector(compute) only re-renders when the computed result changes
 *   - Components that use neither are never affected by clock ticks
 *
 * Usage:
 *   import { ClockProvider, useClock, useClockSelector } from 'openstack-uicore-foundation/lib/components/clock-context';
 *
 *   <ClockProvider timezone={summit.time_zone_id}>
 *     <App />
 *   </ClockProvider>
 *
 *   const nowUtc = useClock();
 *
 *   const phase = useClockSelector((nowUtc) => {
 *     if (nowUtc < event.start) return 'before';
 *     if (nowUtc <= event.end) return 'during';
 *     return 'after';
 *   });
 *
 * For custom (non-clock) stores, see createExternalStore in utils/external-store.js.
 **/

import React from 'react';
import { createExternalStore } from '../utils/external-store';
import Clock from './clock';

const { Provider, useValue: useClock, useSelector: useClockSelector } = createExternalStore('Clock');

/**
 * ClockProvider - Wraps your app with server-synced clock context.
 *
 * @param {string} timezone - Timezone for the clock (e.g., "America/New_York")
 * @param {number} now - Optional initial timestamp (for testing or manual override)
 * @param {React.ReactNode} children - Child components
 */
export const ClockProvider = ({ timezone, now, children }) => (
    <Provider>
        {(emit) => (
            <>
                <Clock onTick={emit} timezone={timezone} now={now} />
                {children}
            </>
        )}
    </Provider>
);

export { useClock, useClockSelector };
