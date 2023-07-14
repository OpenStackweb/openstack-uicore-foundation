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

const TextArea = ({ onChange, value, className, error, ...rest }) => {
    const has_error = error && error !== '';
    const class_name = className ? className : 'form-control';

    return (
        <div>
            <textarea
                className={class_name + ' ' + (has_error ? 'error' : '')}                
                value={value}
                onChange={onChange}
                {...rest}
            />
            {has_error &&
                <p className="error-label">{error}</p>
            }
        </div>
    );
}

export default TextArea;
