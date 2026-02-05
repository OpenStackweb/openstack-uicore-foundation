/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { createExternalStore } from '../external-store';

describe('createExternalStore', () => {
    let store;
    let emit;

    // Test component that captures emit from the render function
    const TestProvider = ({ children }) => (
        <store.Provider>
            {(emitFn) => {
                emit = emitFn;
                return children;
            }}
        </store.Provider>
    );

    // Test component that uses useValue
    const ValueDisplay = ({ onRender }) => {
        const value = store.useValue();
        onRender?.();
        return <div data-testid="value">{value}</div>;
    };

    // Test component that uses useSelector
    const SelectorDisplay = ({ compute, isEqual, onRender }) => {
        const value = store.useSelector(compute, isEqual);
        onRender?.();
        return <div data-testid="selector">{JSON.stringify(value)}</div>;
    };

    beforeEach(() => {
        store = createExternalStore('Test');
        emit = null;
    });

    describe('Provider', () => {
        it('renders children', () => {
            render(
                <TestProvider>
                    <div data-testid="child">hello</div>
                </TestProvider>
            );
            expect(screen.getByTestId('child')).toHaveTextContent('hello');
        });

        it('passes emit function to render prop', () => {
            render(<TestProvider><div /></TestProvider>);
            expect(typeof emit).toBe('function');
        });
    });

    describe('useValue', () => {
        it('throws when used outside Provider', () => {
            const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

            expect(() => {
                render(<ValueDisplay />);
            }).toThrow('Test hooks must be used within their Provider');

            consoleError.mockRestore();
        });

        it('returns null before first emit', () => {
            render(
                <TestProvider>
                    <ValueDisplay />
                </TestProvider>
            );
            expect(screen.getByTestId('value')).toHaveTextContent('');
        });

        it('returns current value after emit', () => {
            render(
                <TestProvider>
                    <ValueDisplay />
                </TestProvider>
            );

            act(() => emit(42));
            expect(screen.getByTestId('value')).toHaveTextContent('42');
        });

        it('re-renders on every emit', () => {
            const renderCount = jest.fn();

            render(
                <TestProvider>
                    <ValueDisplay onRender={renderCount} />
                </TestProvider>
            );

            const initial = renderCount.mock.calls.length;

            act(() => emit(1));
            act(() => emit(2));
            act(() => emit(3));

            expect(renderCount.mock.calls.length).toBe(initial + 3);
        });

        it('updates displayed value on each emit', () => {
            render(
                <TestProvider>
                    <ValueDisplay />
                </TestProvider>
            );

            act(() => emit('first'));
            expect(screen.getByTestId('value')).toHaveTextContent('first');

            act(() => emit('second'));
            expect(screen.getByTestId('value')).toHaveTextContent('second');
        });
    });

    describe('useSelector', () => {
        it('throws when used outside Provider', () => {
            const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

            expect(() => {
                render(<SelectorDisplay compute={(v) => v} />);
            }).toThrow('Test hooks must be used within their Provider');

            consoleError.mockRestore();
        });

        it('computes derived value', () => {
            const compute = (v) => v ? v * 2 : null;

            render(
                <TestProvider>
                    <SelectorDisplay compute={compute} />
                </TestProvider>
            );

            act(() => emit(50));
            expect(screen.getByTestId('selector')).toHaveTextContent('100');
        });

        it('only re-renders when computed value changes', () => {
            const renderCount = jest.fn();

            // Returns "low" or "high" based on threshold
            const compute = (v) => {
                if (!v) return null;
                return v < 100 ? 'low' : 'high';
            };

            render(
                <TestProvider>
                    <SelectorDisplay compute={compute} onRender={renderCount} />
                </TestProvider>
            );

            const initial = renderCount.mock.calls.length;

            // All "low" - only first causes re-render
            act(() => emit(10));
            act(() => emit(20));
            act(() => emit(30));
            expect(renderCount.mock.calls.length).toBe(initial + 1);
            expect(screen.getByTestId('selector')).toHaveTextContent('low');

            // Crosses to "high" - re-render
            act(() => emit(150));
            expect(renderCount.mock.calls.length).toBe(initial + 2);
            expect(screen.getByTestId('selector')).toHaveTextContent('high');

            // Still "high" - no re-render
            act(() => emit(200));
            expect(renderCount.mock.calls.length).toBe(initial + 2);
        });

        it('uses custom equality function', () => {
            const renderCount = jest.fn();

            const compute = (v) => {
                if (!v) return [];
                if (v < 100) return [{ id: 1 }, { id: 2 }];
                return [{ id: 1 }];
            };

            const isEqual = (a, b) => {
                if (a.length !== b.length) return false;
                return a.every((item, i) => item.id === b[i]?.id);
            };

            render(
                <TestProvider>
                    <SelectorDisplay compute={compute} isEqual={isEqual} onRender={renderCount} />
                </TestProvider>
            );

            const initial = renderCount.mock.calls.length;

            // Same result [1,2] - no re-render after first
            act(() => emit(10));
            act(() => emit(20));
            act(() => emit(30));
            expect(renderCount.mock.calls.length).toBe(initial + 1);

            // Result changes to [1] - re-render
            act(() => emit(150));
            expect(renderCount.mock.calls.length).toBe(initial + 2);
        });

        it('recomputes when compute function changes', () => {
            const { rerender } = render(
                <TestProvider>
                    <SelectorDisplay compute={(v) => v ? 'A' : null} />
                </TestProvider>
            );

            act(() => emit(1));
            expect(screen.getByTestId('selector')).toHaveTextContent('A');

            rerender(
                <TestProvider>
                    <SelectorDisplay compute={(v) => v ? 'B' : null} />
                </TestProvider>
            );

            expect(screen.getByTestId('selector')).toHaveTextContent('B');
        });
    });

    describe('multiple subscribers', () => {
        it('supports multiple useValue subscribers', () => {
            const render1 = jest.fn();
            const render2 = jest.fn();

            render(
                <TestProvider>
                    <ValueDisplay onRender={render1} />
                    <ValueDisplay onRender={render2} />
                </TestProvider>
            );

            act(() => emit(1));

            expect(render1).toHaveBeenCalled();
            expect(render2).toHaveBeenCalled();
        });

        it('mixed useValue and useSelector subscribers', () => {
            const valueRenders = jest.fn();
            const selectorRenders = jest.fn();

            // Selector only changes every 100
            const compute = (v) => v ? Math.floor(v / 100) : null;

            render(
                <TestProvider>
                    <ValueDisplay onRender={valueRenders} />
                    <SelectorDisplay compute={compute} onRender={selectorRenders} />
                </TestProvider>
            );

            const initialValue = valueRenders.mock.calls.length;
            const initialSelector = selectorRenders.mock.calls.length;

            // 3 emits within same "bucket"
            act(() => emit(10));
            act(() => emit(20));
            act(() => emit(30));

            // useValue re-renders every time
            expect(valueRenders.mock.calls.length).toBe(initialValue + 3);

            // useSelector only re-renders once (value stays 0)
            expect(selectorRenders.mock.calls.length).toBe(initialSelector + 1);
        });
    });

    describe('multiple independent stores', () => {
        it('stores are isolated from each other', () => {
            const store1 = createExternalStore('Store1');
            const store2 = createExternalStore('Store2');

            let emit1, emit2;

            const Display1 = () => {
                const v = store1.useValue();
                return <div data-testid="s1">{v}</div>;
            };

            const Display2 = () => {
                const v = store2.useValue();
                return <div data-testid="s2">{v}</div>;
            };

            render(
                <store1.Provider>
                    {(e) => {
                        emit1 = e;
                        return (
                            <store2.Provider>
                                {(e2) => {
                                    emit2 = e2;
                                    return (
                                        <>
                                            <Display1 />
                                            <Display2 />
                                        </>
                                    );
                                }}
                            </store2.Provider>
                        );
                    }}
                </store1.Provider>
            );

            act(() => emit1('hello'));
            expect(screen.getByTestId('s1')).toHaveTextContent('hello');
            expect(screen.getByTestId('s2')).toHaveTextContent('');

            act(() => emit2('world'));
            expect(screen.getByTestId('s1')).toHaveTextContent('hello');
            expect(screen.getByTestId('s2')).toHaveTextContent('world');
        });
    });

    describe('error messages', () => {
        it('includes store name in error message', () => {
            const namedStore = createExternalStore('MyCustomStore');
            const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

            const Component = () => {
                namedStore.useValue();
                return null;
            };

            expect(() => {
                render(<Component />);
            }).toThrow('MyCustomStore hooks must be used within their Provider');

            consoleError.mockRestore();
        });
    });
});
