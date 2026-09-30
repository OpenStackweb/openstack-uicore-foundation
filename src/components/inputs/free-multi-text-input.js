import React from 'react';
import PropTypes from 'prop-types';
import CreatableSelect from 'react-select/lib/Creatable';
import T from 'i18n-react/dist/i18n-react';


export default class FreeMultiTextInput extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            inputValue: ''
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
    }

    handleChange(value) {
        let limit = this.props.hasOwnProperty('limit') ? this.props.limit : false;

        if (!limit || limit >= value.length ) {
            let ev = {target: {
                    id: this.props.id,
                    value: value,
                    type: 'freetextlist'
                }};

            this.props.onChange(ev);
        }
    }

    handleInputChange(inputValue) {
        this.setState({ inputValue });
    }

    handleKeyDown(event) {
        const { inputValue } = this.state;
        let { value } = this.props;

        if (!inputValue) return;

        switch (event.key) {
            case 'Enter':
            case 'Tab':
                this.setState({
                    inputValue: '',
                });

                this.handleChange([...value, {label: inputValue, value: inputValue}])

                event.preventDefault();
        }
    }


    render() {
        const { inputValue } = this.state;
        let {id, value, onChange, ...rest} = this.props;

        return (
            <CreatableSelect
                components={{DropdownIndicator: null}}
                inputValue={inputValue}
                clearable
                isMulti
                menuContainerStyle={{display: 'none'}}
                onChange={this.handleChange}
                onInputChange={this.handleInputChange}
                onInputKeyDown={this.handleKeyDown}
                placeholder={T.translate("general.type_something")}
                value={value}
                {...rest}
            />
        );
    }
}

FreeMultiTextInput.propTypes = {
    id: PropTypes.string.isRequired,
    /** Current tags as react-select options. Destructured with no default and spread on Enter/Tab; effectively required. */
    value: PropTypes.array,
    /** Receives a synthetic { target: { id, value, type } }. */
    onChange: PropTypes.func.isRequired,
    /** Maximum number of entries; further input is rejected once reached. */
    limit: PropTypes.number
};
