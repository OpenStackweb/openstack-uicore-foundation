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
import {
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  Typography
} from "@mui/material";
import Heading from "../components/Heading";
import Value from "../components/Value";

const InlineCard = ({ title, rows }) => (
  <Card
    sx={{ minWidth: 275, borderRadius: "10px", height: "100%" }}
    variant="outlined"
  >
    <CardContent>
      <Typography gutterBottom variant="h6">
        {title}
      </Typography>
      <List sx={{ display: "flex", marginTop: "20px" }}>
        {(rows ?? []).map((row, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <React.Fragment key={`row-${row.label}-${i}`}>
            <ListItem
              sx={{ display: "flex", flexDirection: "column", height: 50 }}
            >
              <Heading>{row.label}</Heading>
              <Value>{row.value}</Value>
            </ListItem>
            {i < rows.length - 1 && <Divider orientation="vertical" flexItem />}
          </React.Fragment>
        ))}
      </List>
    </CardContent>
  </Card>
);

export default InlineCard;
