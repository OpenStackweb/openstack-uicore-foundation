import NavBar from "../src/components/mui/NavBar";

export default {
  title: "MUI/Layout/NavBar",
  component: NavBar,
  argTypes: { onClickLogin: { action: "login" }, initLogOut: { action: "logout" } },
  parameters: { layout: "fullscreen" }
};

export const LoggedOut = { args: { title: "Sponsor Portal", isLoggedUser: false } };

export const LoggedIn = {
  args: {
    title: "Sponsor Portal",
    isLoggedUser: true,
    profileName: "Casey Locker",
    profileEmail: "casey@example.com"
  }
};

