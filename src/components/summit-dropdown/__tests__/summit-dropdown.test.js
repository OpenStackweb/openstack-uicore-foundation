/**
 * @jest-environment jsdom
 */
import React from 'react';
import "@testing-library/jest-dom";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SummitDropdown from '..';

jest.mock('i18n-react/dist/i18n-react', () => ({
    __esModule: true,
    default: { translate: (key) => key },
}));

const summits = [
    { id: 1, name: 'Summit A', start_date: 1000 },
    { id: 2, name: 'Summit B', start_date: 2000 },
];

const defaultProps = {
    summits,
    actionLabel: 'Go',
    actionClass: '',
    onClick: jest.fn(),
};

function renderComponent(props = {}) {
    return render(<SummitDropdown {...defaultProps} {...props} />);
}

describe('SummitDropdown summitValue state', () => {
    beforeEach(() => {
        defaultProps.onClick.mockClear();
        jest.clearAllMocks();
    });

    test('summitValue is null on initial render', () => {
        renderComponent();
        expect(screen.getByRole('button', { name: 'Go' })).toBeDisabled();
    });

    test('handleChange sets summitValue when given a valid object', async () => {
        const user = userEvent.setup();
        renderComponent();

        await user.click(screen.getByRole('textbox'));
        await user.click(screen.getByText('Summit A'));

        expect(screen.getByRole('button', { name: 'Go' })).toBeEnabled();
    });

    test('handleChange does not set summitValue when given a non-object', () => {
        const ref = React.createRef();
        render(<SummitDropdown {...defaultProps} ref={ref} />);

        const option = { label: 'Summit A', value: 1 };
        const invalidOption = 'not-an-object';

        act(() => { ref.current.handleChange(invalidOption); });
        expect(ref.current.state.summitValue).toBeNull();

        act(() => { ref.current.handleChange(option); });
        expect(ref.current.state.summitValue).toEqual(option);

        act(() => { ref.current.handleChange(invalidOption); });
        expect(ref.current.state.summitValue).toEqual(option);
    });

    test('handleChange does not set summitValue when given null', () => {
        const ref = React.createRef();
        render(<SummitDropdown {...defaultProps} ref={ref} />);

        const option = { label: 'Summit A', value: 1 };

        act(() => { ref.current.handleChange(null); });
        expect(ref.current.state.summitValue).toBeNull();

        act(() => { ref.current.handleChange(option); });
        expect(ref.current.state.summitValue).toEqual(option);

        act(() => { ref.current.handleChange(null); });
        expect(ref.current.state.summitValue).toEqual(option);
    });

    test('handleClick does not call onClick when summitValue is null', async () => {
        const user = userEvent.setup();
        renderComponent();

        // button is disabled — click is a no-op, onClick must NOT be called
        await user.click(screen.getByRole('button', { name: 'Go' }));

        expect(defaultProps.onClick).not.toHaveBeenCalled();
    });

    test('handleClick calls onClick with summit id when summitValue is set', async () => {
        const user = userEvent.setup();
        renderComponent();

        await user.click(screen.getByRole('textbox'));
        await user.click(screen.getByText('Summit A'));
        await user.click(screen.getByRole('button', { name: 'Go' }));

        expect(defaultProps.onClick).toHaveBeenCalledWith(1);
    });

    test('button is disabled when summitValue is null', () => {
        renderComponent();
        expect(screen.getByRole('button', { name: 'Go' })).toBeDisabled();
    });

    test('button is enabled after selecting a summit', async () => {
        const user = userEvent.setup();
        renderComponent();

        await user.click(screen.getByRole('textbox'));
        await user.click(screen.getByText('Summit A'));

        expect(screen.getByRole('button', { name: 'Go' })).toBeEnabled();
    });
});
