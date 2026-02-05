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
 * createExternalStore - Factory for creating React-optimized external stores.
 *
 * Problem:
 *   When a frequently-updating data source (clock, WebSocket, polling, etc.)
 *   pushes its value into shared state (global store, lifted useState, or a
 *   context value), every consuming component re-renders on every update,
 *   even when they only care about a derived condition that rarely changes.
 *
 * Solution:
 *   createExternalStore() returns a Provider and hooks that store the value
 *   in a ref (no re-renders) and use useSyncExternalStore so components
 *   can opt in to updates selectively:
 *
 *   - useValue() → re-renders on every update
 *   - useSelector(compute, isEqual) → re-renders only when the computed result changes
 *
 *   Components that don't call either hook are never affected by updates.
 *
 * How it works:
 *   1. The Provider stores the value in a ref (writing to a ref never triggers
 *      a React re-render) and keeps a Set of listener callbacks.
 *   2. When emit(value) is called, the ref is updated and all listeners are
 *      notified. These listeners come from useSyncExternalStore.
 *   3. useSyncExternalStore (React 18, shimmed for 16/17) calls getSnapshot()
 *      to read the ref, compares with the previous value, and only re-renders
 *      the component if the value changed.
 *   4. useMemo adds a layer on top: it runs a compute function on the raw value
 *      and only re-renders if the computed result changed (checked via isEqual).
 *
 * API:
 *   createExternalStore(name) returns:
 *
 *   - Provider    Wraps your component tree. Pass children as a render function
 *                 to receive the emit callback: (emit) => JSX. Call emit(value)
 *                 each time your data source has a new value.
 *
 *   - useValue()  Returns the latest emitted value. The component re-renders
 *                 on every emit.
 *
 *   - useSelector(compute, isEqual?)
 *                 Returns a derived value. compute(rawValue) runs on every emit,
 *                 but the component only re-renders when isEqual returns false
 *                 (default: ===). Useful when you need to derive something that
 *                 changes less frequently than the raw value.
 *
 *   The name parameter is used in error messages. For example,
 *   createExternalStore('Clock') throws "Clock hooks must be used within
 *   their Provider" when a hook is called outside the Provider.
 *
 * For clock-specific usage:
 *   A pre-built clock store is available at:
 *   import { ClockProvider, useClock, useClockSelector } from 'openstack-uicore-foundation/lib/components/clock-context';
 *   This wires createExternalStore to the Clock component so projects don't
 *   have to repeat that boilerplate.
 *
 * Custom store example:
 *   import { createExternalStore } from 'openstack-uicore-foundation/lib/utils/external-store';
 *
 *   const { Provider, useValue, useSelector } = createExternalStore('WebSocket');
 *
 *   const WebSocketProvider = ({ url, children }) => (
 *       <Provider>
 *           {(emit) => (
 *               <>
 *                   <WebSocketSource url={url} onMessage={emit} />
 *                   {children}
 *               </>
 *           )}
 *       </Provider>
 *   );
 *
 *   // Re-renders on every message:
 *   const message = useValue();
 *
 *   // Re-renders only when the derived value changes:
 *   const isActive = useSelector((msg) => msg?.status === 'active');
 **/

import React, { createContext, useContext, useRef, useCallback, useMemo as reactUseMemo } from 'react';
// Shim for React 16/17 compatibility, falls back to native in React 18+
import { useSyncExternalStore } from 'use-sync-external-store/shim';

const strictEqual = (a, b) => a === b;

/**
 * Creates an external store with a Provider and subscription hooks.
 *
 * @param {string} name - Store name, used in error messages (e.g., "Clock", "WebSocket")
 * @returns {{ Provider, useValue, useSelector }}
 */
export function createExternalStore(name = 'ExternalStore') {
    const Context = createContext(null);

    const useStoreContext = () => {
        const context = useContext(Context);
        if (context === null) {
            throw new Error(`${name} hooks must be used within their Provider`);
        }
        return context;
    };

    /**
     * Provider - Wraps your component tree and provides the store.
     *
     * Pass children as a render function to receive the `emit` callback:
     *   <Provider>{(emit) => <Source onUpdate={emit} />}</Provider>
     *
     * Or pass children normally if you wire emit externally.
     */
    const Provider = ({ children }) => {
        const valueRef = useRef(null);
        const listenersRef = useRef(new Set());

        const subscribe = useCallback((callback) => {
            listenersRef.current.add(callback);
            return () => listenersRef.current.delete(callback);
        }, []);

        const getSnapshot = useCallback(() => valueRef.current, []);

        const emit = useCallback((value) => {
            valueRef.current = value;
            listenersRef.current.forEach(listener => listener());
        }, []);

        const contextValue = reactUseMemo(() => ({ subscribe, getSnapshot }), [subscribe, getSnapshot]);

        return (
            <Context.Provider value={contextValue}>
                {typeof children === 'function' ? children(emit) : children}
            </Context.Provider>
        );
    };

    /**
     * useValue - Subscribe to every update.
     * Component re-renders each time emit() is called.
     *
     * @returns {*} The current value, or null before first emit
     */
    const useValue = () => {
        const { subscribe, getSnapshot } = useStoreContext();
        return useSyncExternalStore(subscribe, getSnapshot);
    };

    /**
     * useSelector - Subscribe with a selector function.
     * Only re-renders when the selected/derived value changes.
     *
     * @param {Function} compute - (value) => derivedValue
     * @param {Function} isEqual - Optional equality function (default: ===)
     * @returns {*} The computed value
     */
    const useSelector = (compute, isEqual = strictEqual) => {
        const { subscribe, getSnapshot } = useStoreContext();

        const lastResultRef = useRef(null);
        const lastValueRef = useRef(null);
        const lastComputeRef = useRef(compute);

        // Invalidate cache when compute function changes
        if (lastComputeRef.current !== compute) {
            lastComputeRef.current = compute;
            lastValueRef.current = null;
        }

        const getComputedValue = useCallback(() => {
            const value = getSnapshot();

            if (value === lastValueRef.current) {
                return lastResultRef.current;
            }

            const newResult = compute(value);
            lastValueRef.current = value;

            if (lastResultRef.current !== null && isEqual(lastResultRef.current, newResult)) {
                return lastResultRef.current;
            }

            lastResultRef.current = newResult;
            return newResult;
        }, [getSnapshot, compute, isEqual]);

        return useSyncExternalStore(subscribe, getComputedValue);
    };

    return { Provider, useValue, useSelector };
}
