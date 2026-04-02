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

import React, { useEffect, useState, useMemo } from "react";
import { TextField, IconButton, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import { debounce } from "lodash";
import { DEBOUNCE_WAIT } from "../../utils/constants";

const SearchInput = ({ term, onSearch, placeholder = "Search...", debounced }) => {
  const [searchTerm, setSearchTerm] = useState(term);

  useEffect(() => {
    setSearchTerm(term || "");
  }, [term]);

  const handleClear = () => {
    onSearchDebounced?.cancel();
    setSearchTerm("");
    onSearch("");
  };

  const onSearchDebounced = useMemo(
    () => debounced ? debounce((value) => onSearch(value), DEBOUNCE_WAIT) : null,
    [onSearch, debounced]
  );

  useEffect(() => () => onSearchDebounced?.cancel(), [onSearchDebounced]);

  const handleChange = (value) => {
    setSearchTerm(value);
    if (debounced) onSearchDebounced(value);
  };

  const handleKeyDown = (ev) => {
    if (!debounced && ev.key === "Enter") {
      onSearch(searchTerm);
    }
  };

  return (
    <TextField
      variant="outlined"
      value={searchTerm}
      placeholder={placeholder}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: "#0000008F" }} />
            </InputAdornment>
          ),
          endAdornment: term && (
            <InputAdornment position="end">
              <IconButton size="small" onClick={handleClear}>
                <ClearIcon fontSize="small" sx={{ color: "#0000008F" }} />
              </IconButton>
            </InputAdornment>
          )
        }
      }}
      onChange={(ev) => handleChange(ev.target.value)}
      onKeyDown={handleKeyDown}
      fullWidth
      sx={{
        "& .MuiOutlinedInput-root": {
          height: "36px"
        }
      }}
    />
  );
};

export default SearchInput;
