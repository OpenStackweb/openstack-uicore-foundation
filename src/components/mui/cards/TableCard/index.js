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
import Value from "../components/Value";
import Heading from "../components/Heading";

const TableCard = ({ title, rows = [], columns = [] }) => (
  <Card
    sx={{ minWidth: 275, borderRadius: "10px", height: "100%" }}
    variant="outlined"
  >
    <CardContent>
      <Typography gutterBottom variant="h6">
        {title}
      </Typography>
      <List sx={{ marginTop: "20px" }}>
        <ListItem sx={{ display: "flex", height: 50 }}>
          {columns.map((col, i) => (
            // eslint-disable-next-line react/no-array-index-key
            <Heading key={`col-${col.key}-${i}`}>{col.label}</Heading>
          ))}
        </ListItem>
        <Divider component="li" role="presentation" />
        {rows.map((row, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <React.Fragment key={`row-${i}`}>
            <ListItem sx={{ display: "flex", minHeight: 60 }}>
              {columns.map((col, j) => (
                // eslint-disable-next-line react/no-array-index-key
                <Value key={`col-val-${col.key}-${j}`}>{row[col.key]}</Value>
              ))}
            </ListItem>
            {i < rows.length - 1 && (
              <Divider component="li" role="presentation" />
            )}
          </React.Fragment>
        ))}
      </List>
    </CardContent>
  </Card>
);

export default TableCard;
