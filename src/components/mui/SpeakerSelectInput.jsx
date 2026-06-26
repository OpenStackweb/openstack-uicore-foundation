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
 * */

import React from "react";
import PropTypes from "prop-types";
import T from "i18n-react/dist/i18n-react";
import AsyncSelectInput from "./AsyncSelectInput";
import { querySpeakers } from "../../utils/query-actions";

const defaultFormatOption = (speaker) => ({
  value: speaker.id,
  label: `${speaker.first_name} ${speaker.last_name} (${speaker.email || speaker.id})`
});

const SpeakerSelectInput = ({ summitId, queryFunction, placeholder, ...rest }) => (
  <AsyncSelectInput
    queryFunction={queryFunction || ((input, callback) => querySpeakers(summitId, input, callback))}
    placeholder={placeholder || T.translate("placeholders.speaker")}
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...rest}
  />
);

SpeakerSelectInput.propTypes = {
  summitId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  queryFunction: PropTypes.func,
  placeholder: PropTypes.string
};

SpeakerSelectInput.defaultProps = {
  summitId: null,
  queryFunction: null,
  formatOption: defaultFormatOption
};

export default SpeakerSelectInput;
