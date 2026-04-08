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

import React, { useEffect, useState, useRef } from "react";
import { TextField, IconButton, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import { debounce } from "lodash";
import { DEBOUNCE_WAIT } from "../../utils/constants";

const SearchInput = ({ term, onSearch, placeholder = "Search...", debounced }) => {
  const [searchTerm, setSearchTerm] = useState(term);

  const onSearchRef = useRef(onSearch);
  useEffect(() => {
    onSearchRef.current = onSearch;
  }, [onSearch]);

  const onSearchDebouncedRef = useRef(
    debounced
      ? debounce((value) => onSearchRef.current(value), DEBOUNCE_WAIT)
      : null
  );

  useEffect(() => {
    setSearchTerm(term || "");
  }, [term]);

  useEffect(() => () => onSearchDebouncedRef.current?.cancel(), []);

  const handleClear = () => {
    onSearchDebouncedRef.current?.cancel();
    setSearchTerm("");
    onSearch("");
  };

  const handleChange = (value) => {
    setSearchTerm(value);
    if (debounced) onSearchDebouncedRef.current?.(value);
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
          startAdornment: !debounced && (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: "#0000008F" }} />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              {searchTerm ? (
                <IconButton size="small" onClick={handleClear}>
                  <ClearIcon fontSize="small" sx={{ color: "#0000008F" }} />
                </IconButton>
              ) : (
                <SearchIcon
                  sx={{ mr: 1, color: "#0000008F", position: "absolute", right: 0 }}
                />
              )}
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
