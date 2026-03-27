/**
 * @jest-environment jsdom
 */
import React from 'react';
import Enzyme, { mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import SummitDropdown from '..';

Enzyme.configure({ adapter: new Adapter() });

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

function render(props = {}) {
    return mount(<SummitDropdown {...defaultProps} {...props} />);
}

describe('SummitDropdown summitValue state', () => {
    beforeEach(() => {
        defaultProps.onClick.mockClear();
    });

    test('summitValue is null on initial render', () => {
        const wrapper = render();
        expect(wrapper.instance().state.summitValue).toBeNull();
    });

    test('handleChange sets summitValue when given a valid object', () => {
        const wrapper = render();
        const option = { label: 'Summit A', value: 1 };

        wrapper.instance().handleChange(option);

        expect(wrapper.instance().state.summitValue).toEqual(option);
    });

    test('handleChange does not set summitValue when given a non-object', () => {
        const wrapper = render();
        const option = { label: 'Summit A', value: 1 };
        const invalidOption = 'not-an-object';

        wrapper.instance().handleChange(invalidOption);
        expect(wrapper.instance().state.summitValue).toBeNull();

        wrapper.instance().handleChange(option);
        expect(wrapper.instance().state.summitValue).toEqual(option);

        wrapper.instance().handleChange(invalidOption);
        expect(wrapper.instance().state.summitValue).toEqual(option);
    });

    test('handleChange does not set summitValue when given null', () => {
        const wrapper = render();
        const option = { label: 'Summit A', value: 1 };

        wrapper.instance().handleChange(null);
        expect(wrapper.instance().state.summitValue).toBeNull();

        wrapper.instance().handleChange(option);
        expect(wrapper.instance().state.summitValue).toEqual(option);

        wrapper.instance().handleChange(null);
        expect(wrapper.instance().state.summitValue).toEqual(option);
    });

    test('handleClick does not call onClick when summitValue is null', () => {
        const wrapper = render();
        const fakeEvent = { preventDefault: jest.fn() };

        // summitValue starts as null — onClick must NOT be called
        wrapper.instance().handleClick(fakeEvent);

        expect(defaultProps.onClick).not.toHaveBeenCalled();
    });

    test('handleClick calls onClick with summit id when summitValue is set', () => {
        const wrapper = render();
        const option = { label: 'Summit A', value: 1 };
        const fakeEvent = { preventDefault: jest.fn() };

        wrapper.instance().handleChange(option);
        wrapper.instance().handleClick(fakeEvent);

        expect(defaultProps.onClick).toHaveBeenCalledWith(1);
    });

    test('button is disabled when summitValue is null', () => {
        const wrapper = render();
        expect(wrapper.find('button').prop('disabled')).toBe(true);
    });

    test('button is enabled after selecting a summit', () => {
        const wrapper = render();
        wrapper.instance().handleChange({ label: 'Summit A', value: 1 });
        wrapper.update();

        expect(wrapper.find('button').prop('disabled')).toBe(false);
    });
});
