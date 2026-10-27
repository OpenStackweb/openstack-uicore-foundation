/**
 * Copyright 2019 OpenStack Foundation
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

import React from 'react'
import { getExclusiveSections } from '../utils/config';


export default class Exclusive extends React.Component {

    constructor(props) {
        super(props);

        this.showField = this.showField.bind(this);
    }

    showField() {
        let {name} = this.props;
        let exclusiveSections = getExclusiveSections();

        return exclusiveSections ? exclusiveSections.includes(name) : false;
    }

    render() {
        let {children} = this.props;

        if (this.showField()) {
            return children;
        }

        return null;

    }
}
