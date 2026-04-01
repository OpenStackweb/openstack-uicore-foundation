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

import React, {useEffect, useState} from "react";
import {FormControl, InputLabel, MenuItem, Select} from "@mui/material";
import T from "i18n-react";
import {fetchAllSummits} from "../../utils/query-actions";

const SummitsDropdown = ({
                             onlyActive = false,
                             label = "Search by show",
                             onChange,
                             summits,
                             excludeSummitIds = []
                         }) => {
    const [summitOptions, setSummitOptions] = useState(summits);

    useEffect(() => {
        if (summits.length === 0) {
            fetchAllSummits(onlyActive).then((summits) => {
                const summitOptions = summits.filter(
                    (s) => excludeSummitIds.indexOf(s.id) === -1);
                setSummitOptions(summitOptions);
            });
        }
    }, []);


    return (
        <FormControl fullWidth>
            <InputLabel>{label}</InputLabel>
            <Select
                label={T.translate("general.select_summit")}
                fullWidth
                variant="outlined"
                onChange={(ev) => onChange(ev.target.value)}
            >
                {summitOptions.map((s) => (
                    <MenuItem key={`summits-ddl-${s.id}`} value={s.id}>
                        {s.name}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
};

export default SummitsDropdown;
