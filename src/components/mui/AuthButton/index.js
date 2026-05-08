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

import React, {useRef, useState} from "react";
import T from "i18n-react/dist/i18n-react";
import {useTheme} from "@mui/material/styles";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import SettingsIcon from "@mui/icons-material/Settings";
import styles from "./styles.module.scss";

const AuthButton = ({
                     isLoggedUser,
                     doLogin,
                     initLogOut,
                     profileEmail,
                     profileName
                   }) => {
  const theme = useTheme();
  const anchorRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const menuFontSize = theme?.custom?.menu?.fontSize || "1.4rem";
  const menuLineHeight = theme?.custom?.menu?.lineHeight || "2rem";
  const menuIconColor = theme?.custom?.menu?.icon || theme.palette.text.secondary;

  const openMenu = () => {
    setMenuOpen(true);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  if (isLoggedUser) {
    return (
      <Box className={styles.userMenu}>
        <IconButton
          aria-controls={menuOpen ? "user-menu" : undefined}
          aria-expanded={menuOpen ? "true" : undefined}
          aria-haspopup="true"
          onClick={openMenu}
          size="medium"
          data-testid="user-menu-button"
          sx={{
            color: theme.palette.text.primary,
            p: 0,
            width: 28,
            height: 28
          }}
          ref={anchorRef}
        >
          <AccountCircleIcon sx={{fontSize: 28}}/>
        </IconButton>
        <Menu
          id="user-menu"
          anchorEl={anchorRef.current}
          open={menuOpen}
          onClose={closeMenu}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right"
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right"
          }}
          slotProps={{
            paper: {
              sx: {
                mt: 1.5,
                minWidth: 260,
                borderRadius: 2,
                overflow: "hidden",
                boxShadow: "0 16px 40px rgba(0, 0, 0, 0.18)"
              }
            },
            list: {
              disablePadding: true,
              sx: {py: 0}
            }
          }}
        >
          <Box sx={{px: 3, py: 2.5}}>
            <Typography
              variant="body1"
              sx={{
                fontSize: menuFontSize,
                lineHeight: menuLineHeight,
                color: theme.palette.text.primary,
                mb: 0.5
              }}
            >
              {profileName || "User"}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontSize: menuFontSize,
                lineHeight: menuLineHeight,
                color: theme.palette.text.secondary
              }}
            >
              {profileEmail || ""}
            </Typography>
          </Box>
          <Divider/>
          <MenuItem onClick={closeMenu} sx={{py: 1.5, px: 3, gap: 1.5}}>
            <ListItemIcon sx={{minWidth: 32, color: menuIconColor}}>
              <SettingsIcon sx={{fontSize: 24}}/>
            </ListItemIcon>
            <ListItemText
              primary={T.translate("general.settings")}
              primaryTypographyProps={{
                sx: {
                  fontSize: menuFontSize,
                  color: theme.palette.text.primary
                }
              }}
            />
          </MenuItem>
          <MenuItem onClick={closeMenu} sx={{py: 1.5, px: 3, gap: 1.5}}>
            <ListItemIcon sx={{minWidth: 32, color: menuIconColor}}>
              <PersonIcon sx={{fontSize: 24}}/>
            </ListItemIcon>
            <ListItemText
              primary={T.translate("general.profile")}
              primaryTypographyProps={{
                sx: {
                  fontSize: menuFontSize,
                  color: theme.palette.text.primary
                }
              }}
            />
          </MenuItem>
          <Divider/>
          <MenuItem
            onClick={() => {
              closeMenu();
              initLogOut();
            }}
            sx={{py: 1.5, px: 3, gap: 1.5}}
          >
            <ListItemIcon sx={{minWidth: 32, color: menuIconColor}}>
              <LogoutIcon sx={{fontSize: 24}}/>
            </ListItemIcon>
            <ListItemText
              primary={T.translate("buttons.sign_out")}
              primaryTypographyProps={{
                sx: {
                  fontSize: menuFontSize,
                  color: theme.palette.text.primary
                }
              }}
            />
          </MenuItem>
        </Menu>
      </Box>
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
