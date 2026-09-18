import AuthButton from "../src/components/mui/AuthButton";

export default {
  title: "MUI/Buttons/AuthButton",
  component: AuthButton,
  argTypes: { doLogin: { action: "login" }, initLogOut: { action: "logout" } }
};

export const LoggedOut = { args: { isLoggedUser: false } };
export const LoggedIn = {
  args: {
    isLoggedUser: true,
    profileName: "Casey Locker",
    profileEmail: "casey@example.com"
  }
};

