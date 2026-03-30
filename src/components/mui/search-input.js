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

import React, { useEffect, useState } from "react";
import { TextField, IconButton } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";

const SearchInput = ({ term, onSearch, placeholder = "Search..." }) => {
  const [searchTerm, setSearchTerm] = useState(term);

  useEffect(() => {
    setSearchTerm(term || "");
  }, [term]);

  const handleSearch = (ev) => {
    if (ev.key === "Enter") {
      onSearch(searchTerm);
    }
  };

  const handleClear = () => {
    setSearchTerm("");
    onSearch("");
  };

  return (
    <TextField
      variant="outlined"
      value={searchTerm}
      placeholder={placeholder}
      slotProps={{
        input: {
          endAdornment: term ? (
            <IconButton
              size="small"
              onClick={handleClear}
              sx={{ position: "absolute", right: 0 }}
            >
              <ClearIcon sx={{ color: "#0000008F" }} />
            </IconButton>
          ) : (
            <SearchIcon
              sx={{ mr: 1, color: "#0000008F", position: "absolute", right: 0 }}
            />
          )
        }
      }}
      onChange={(event) => setSearchTerm(event.target.value)}
      onKeyDown={handleSearch}
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
