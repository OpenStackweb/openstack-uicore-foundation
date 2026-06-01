/**
 * @jest-environment jsdom
 *
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

import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ClockProvider, useClock, useClockSelector } from '../clock-context';

// Capture the onTick prop the Clock component receives so tests can drive ticks
// without depending on Clock's real timer / server-sync behavior.
let lastOnTick = null;
jest.mock('../clock', () => ({
    __esModule: true,
    default: ({ onTick }) => {
        lastOnTick = onTick;
        return null;
    }
}));

beforeEach(() => { lastOnTick = null; });

const ClockReader = () => {
    const now = useClock();
    return <span data-testid="now">{now === null ? 'null' : String(now)}</span>;
};

const SelectorReader = ({ select, label = 'sel' }) => {
    const value = useClockSelector(select);
    return <span data-testid={label}>{value === null || value === undefined ? 'null' : String(value)}</span>;
};

describe('ClockProvider', () => {
    it('renders children', () => {
        render(<ClockProvider timezone="UTC"><div>child</div></ClockProvider>);
        expect(screen.getByText('child')).toBeInTheDocument();
    });

    it('mounts the Clock component and exposes its emit hook', () => {
        render(<ClockProvider timezone="UTC"><div /></ClockProvider>);
        expect(typeof lastOnTick).toBe('function');
    });
});

describe('useClock', () => {
    it('throws when used outside ClockProvider', () => {
        const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        try {
            expect(() => render(<ClockReader />)).toThrow();
        } finally {
            errorSpy.mockRestore();
        }
    });

    it('returns null before the first tick', () => {
        render(<ClockProvider timezone="UTC"><ClockReader /></ClockProvider>);
        expect(screen.getByTestId('now')).toHaveTextContent('null');
    });

    it('returns the latest emitted timestamp', () => {
        render(<ClockProvider timezone="UTC"><ClockReader /></ClockProvider>);
        act(() => lastOnTick(1700000000));
        expect(screen.getByTestId('now')).toHaveTextContent('1700000000');
        act(() => lastOnTick(1700000001));
        expect(screen.getByTestId('now')).toHaveTextContent('1700000001');
    });
});

describe('useClockSelector', () => {
    it('throws when used outside ClockProvider', () => {
        const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        try {
            expect(() => render(<SelectorReader select={(t) => t} />)).toThrow();
        } finally {
            errorSpy.mockRestore();
        }
    });

    it('computes derived value from the latest tick', () => {
        render(
            <ClockProvider timezone="UTC">
                <SelectorReader select={(t) => (t ? `tick:${t}` : null)} />
            </ClockProvider>
        );
        act(() => lastOnTick(1700000000));
        expect(screen.getByTestId('sel')).toHaveTextContent('tick:1700000000');
        act(() => lastOnTick(1700000001));
        expect(screen.getByTestId('sel')).toHaveTextContent('tick:1700000001');
    });

    it('only re-renders when the selected value changes across ticks', () => {
        let renders = 0;
        const Counted = () => {
            renders++;
            const phase = useClockSelector((t) => (t > 1700000000 ? 'after' : 'before'));
            return <span data-testid="phase">{phase ?? 'null'}</span>;
        };
        render(<ClockProvider timezone="UTC"><Counted /></ClockProvider>);

        // First tick: selector goes from null (initial cache) to 'before' — one re-render.
        act(() => lastOnTick(1699999999));
        const afterFirst = renders;
        expect(screen.getByTestId('phase')).toHaveTextContent('before');

        // Second tick: selected value is still 'before' — must NOT re-render.
        act(() => lastOnTick(1700000000));
        expect(screen.getByTestId('phase')).toHaveTextContent('before');
        expect(renders).toBe(afterFirst);

        // Third tick: selected value flips to 'after' — one re-render.
        act(() => lastOnTick(1700000001));
        expect(screen.getByTestId('phase')).toHaveTextContent('after');
        expect(renders).toBe(afterFirst + 1);
    });
});
