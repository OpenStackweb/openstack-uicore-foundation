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

import React, {useState} from 'react';
import RichTextEditor, { createValueFromString, Button } from 'react-rte';

const CodeView = ({value, onSave}) => {
    const [codeValue, setCodeValue] = useState(value);

    return (
        <>
      <textarea
          style={{width: '100%'}}
          value={codeValue}
          onChange={ev => setCodeValue(ev.target.value)}
      />
            <button className="btn btn-xs btn-primary" onClick={() => onSave(codeValue)}>Save</button>
        </>
    );
}

const TextEditorV2 = ({id, value, onChange, error, className, ...rest}) => {
    const [view, setView] = useState('text');
    const [editorValue, setEditorValue] = useState(createValueFromString(value, 'html'));
    const has_error = error && error !== '';

    const handleChange = (editorValue) => {
        setEditorValue(editorValue);

        let stringValue = editorValue.toString('html');
        stringValue = stringValue === '<p><br></p>' ? '' : stringValue;

        const ev = {
            target: {
                id: id,
                value: stringValue,
                type: 'texteditor'
            }
        };
        onChange(ev);
    }

    const ViewCodeButton = (setValue, getValue, editorState) => {
        const onClick = ev => {
            ev.preventDefault();
            setView(view === 'text' ? 'code' : 'text');
        }

        return (<Button key="view-code-btn" onClick={onClick}>view code</Button>)
    };

    const onSaveCode = (html) => {
        const value = createValueFromString(html, 'html');
        handleChange(value);
        setView('text');
    };


    return (
        <div>
            {view === 'text' &&
                <RichTextEditor
                    id={id}
                    className={className + ' ' + (has_error ? 'error' : '')}
                    value={editorValue}
                    onChange={handleChange}
                    customControls={[ViewCodeButton]}
                    {...rest}
                />
            }
            {view === 'code' &&
                <CodeView value={editorValue.toString('html')} onSave={onSaveCode} />
            }
            {has_error &&
                <p className="error-label">{error}</p>
            }
        </div>
    );
};

export default TextEditorV2;
