/**
 * Copyright 2017 OpenStack Foundation
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

import './editor-input.less';

export default class TextEditor extends React.Component {

    constructor(props) {
        super(props);
        this.RichTextEditor = null;
        this.getTextAlignClassName = null;
        this.getTextAlignStyles = null;

        // this is done bc due SSR issues
        // @see https://github.com/sstur/react-rte/issues/373
        if (typeof window !== 'undefined') {
            const { default: RichTextEditor, getTextAlignClassName, getTextAlignStyles } = require('react-rte');
            this.RichTextEditor = RichTextEditor;
            this.getTextAlignClassName = getTextAlignClassName;
            this.getTextAlignStyles = getTextAlignStyles;
        }

        this.state = {
            editorValue: this.RichTextEditor?.createEmptyValue(),
            currentValue: null
        };

        this.handleChange = this.handleChange.bind(this);
    }

    static getDerivedStateFromProps(props, state) {
        const {value} = props;
        const {editorValue, currentValue} = state;

        if (currentValue != null) {
            if (value === currentValue) {
                return state;
            }
        } 

        let newEditorValue = editorValue.setContentFromString(value, 'html');

        // this is done bc due SSR issues
        // @see https://github.com/sstur/react-rte/issues/373
        if (typeof window !== 'undefined') {
            const { getTextAlignBlockMetadata } = require('react-rte');
            newEditorValue = editorValue.setContentFromString(
                value, 
                'html',
                {
                    customBlockFn: getTextAlignBlockMetadata,
                }
            );
        }

        return {...state, editorValue: newEditorValue, currentValue: value}
    }

    handleChange(editorValue) {
        let oldEditorValue = this.state.editorValue;

        this.setState({editorValue});

        let oldContentState = oldEditorValue ? oldEditorValue.getEditorState().getCurrentContent() : null;
        let newContentState = editorValue.getEditorState().getCurrentContent();

        if (oldContentState !== newContentState) {
            let stringValue = editorValue.toString( 
                'html',
                {
                   blockStyleFn: this.getTextAlignStyles,
                }
            )
            stringValue = stringValue === '<p><br></p>' ? '' : stringValue;

            this.setState({currentValue: stringValue});

            if (stringValue !== this.props.value) {
                let ev = {target: {
                        id: this.props.id,
                        value: stringValue,
                        type: 'texteditor'
                    }};

                this.props.onChange(ev);
            }
        }
    }

    render() {
        const {onChange, value, error, className, id, maxLength, ...rest} = this.props;
        const {currentValue, editorValue} = this.state;
        const has_error = ( this.props.hasOwnProperty('error') && error !== '' );
        const charCountLeft = maxLength - currentValue.length;

        return (
            <div className='editor-input'>
                {this.RichTextEditor &&
                    <this.RichTextEditor
                        id={id}
                        className={className + ' ' + (has_error ? 'error' : '')}
                        value={editorValue}
                        onChange={this.handleChange}
                        blockStyleFn={this.getTextAlignClassName}
                        {...rest}
                    />
                }
                {!!maxLength &&
                    <p><i>characters left: {charCountLeft}</i></p>
                }
                {has_error &&
                <p className="error-label">{error}</p>
                }
            </div>
        );

    }
}
