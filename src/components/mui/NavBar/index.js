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
import {AppBar, Box, Toolbar, Typography} from "@mui/material";
import AuthButton from "../AuthButton";
import styles from "./styles.module.scss";

const NavBar = ({title, profilePic, isLoggedUser, onClickLogin, initLogOut}) => {
  return (
    <AppBar
      position="relative"
      elevation={2}
      color="default"
      sx={{backgroundColor: "background.paper", color: "text.primary"}}
    >
      <Toolbar>
        <Typography
          className={styles.title}
          variant="h6"
          color="inherit"
          component="div"
        >
          {title}
        </Typography>
        <Box sx={{flexGrow: 1}}>
          <AuthButton
            isLoggedUser={isLoggedUser}
            picture={profilePic}
            doLogin={onClickLogin}
            initLogOut={initLogOut}
          />
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;
