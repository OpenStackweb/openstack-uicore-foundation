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

import React, { useState } from "react";
import T from "i18n-react";
import {Button, Box} from '@mui/material';
import styles from "./styles.module.scss"

const AuthButton = ({ isLoggedUser, doLogin, initLogOut, picture }) => {
  const [showLogOut, setShowLogOut] = useState(false);

  const toggleLogOut = () => {
    setShowLogOut(!showLogOut);
  };

  if (isLoggedUser) {
    return (
      <div className={styles.userMenu} onClick={toggleLogOut}>
        <div
          className={styles.profilePic}
          style={{ backgroundImage: `url(${picture})` }}
        />
        {showLogOut && (
          <Button
            className={styles.logout}
            variant="contained"
            size="small"
            color="secondary"
            onClick={() => {
              initLogOut();
            }}
          >
            {T.translate("buttons.sign_out")}
          </Button>
        )}
      </div>
    );
  }
    return (
      <Box className={styles.login}>
        <Button
          variant="contained"
          size="small"
          color="secondary"
          onClick={() => {
            doLogin();
          }}
        >
          {T.translate("buttons.log_in")}
        </Button>
      </Box>
    );

};

export default AuthButton;
