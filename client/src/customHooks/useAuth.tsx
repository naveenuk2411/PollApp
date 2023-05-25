import React from "react";
import { Snackbar, Alert, AlertProps } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import SignUpModal from "../components/SignUpModal";
import { User } from "../types/User";
import axios from "axios";
import {
  AUTH_SERVER_SIGN_IN_URL,
  AUTH_SERVER_SIGN_UP_URL,
} from "../constants/Routes";
import { getKey, removeKey, setKey } from "../util/sessionStorage";
import { AUTH_TOKEN } from "../constants/Auth";
import jwtDecode from "jwt-decode";

interface AuthenitcatorProviderProps {
  children: React.ReactElement;
}

type AuthStateManagement = {
  isAuthenticated: boolean;
  user: User | null;
  isAuthLoading: boolean;
  switchToSignInModal: boolean;
  authToken: string;
  login: (email: string, password: string) => void;
  register: (name: string, email: string, password: string) => void;
  logout: () => void;
  handleModalOpen: () => void;
  handleSwitchToSignInModal: (value: boolean) => void;
};

const AuthContext = React.createContext<AuthStateManagement | undefined>(
  undefined
);

const AuthenticatorProvider = (
  props: AuthenitcatorProviderProps
): JSX.Element => {
  const [isAuthenticated, setIsAuthenticated] = React.useState<boolean>(false);
  const [isAuthLoading, setIsAuthLoading] = React.useState<boolean>(false);
  const [hasAuthError, setHasAuthError] = React.useState<boolean>(false);
  const [authErrorMessage, setAuthErrorMessage] = React.useState<string>("");
  const [user, setUser] = React.useState<User | null>(null);

  const [signUpModalOpen, setSignUpModalOpen] = React.useState<boolean>(false);
  const [switchToSignInModal, setSwitchToSignInModal] =
    React.useState<boolean>(false);
  const [snackbarOpen, setSnackbarOpen] = React.useState<boolean>(false);
  const [snackbarSeverity, setSnackbarSeverity] =
    React.useState<AlertProps["severity"]>("success");
  const [snackbarMessage, setSnackbarMessage] = React.useState<string>("");
  const [authToken, setAuthToken] = React.useState<string>("");

  const navigate = useNavigate();
  const location = useLocation();

  React.useLayoutEffect(() => {
    if (authToken === "") {
      const authTokenFromStorage = getKey(AUTH_TOKEN);
      if (authTokenFromStorage != "") {
        const decodedToken: User = jwtDecode(authTokenFromStorage);
        setUser({
          id: decodedToken.id,
          name: decodedToken.name,
          email: decodedToken.email,
        });
        setAuthToken(authTokenFromStorage);
        setIsAuthenticated(true);
      }
    }
  }, []);

  const handleModalOpen = (): void => {
    setSignUpModalOpen(true);
  };

  const handleModalClose = (): void => {
    setSignUpModalOpen(false);
  };

  const handleSwitchToSignInModal = (value: boolean): void => {
    setSwitchToSignInModal(value);
  };

  const login = async (email: string, password: string) => {
    setIsAuthLoading(true);
    setHasAuthError(false);
    setAuthErrorMessage("");
    setIsAuthenticated(false);
    try {
      const res = await axios.post(AUTH_SERVER_SIGN_IN_URL, {
        login: {
          password: password,
          email: email,
        },
      });
      setAuthToken(res.data.token);
      const decodedToken: User = jwtDecode(res.data.token);
      setUser({
        id: decodedToken.id,
        name: decodedToken.name,
        email: decodedToken.email,
      });
      setKey(AUTH_TOKEN, res.data.token);
      setIsAuthenticated(true);
      setSnackbarOpen(true);
      setSnackbarMessage("Successfully logged in!");
      setSnackbarSeverity("success");
      handleModalClose();
    } catch (error) {
      setHasAuthError(true);
      setAuthErrorMessage((error as Error).message);
      setSnackbarOpen(true);
      setSnackbarMessage((error as Error).message);
      setSnackbarSeverity("error");
    } finally {
      setIsAuthLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setIsAuthLoading(true);
    setHasAuthError(false);
    setAuthErrorMessage("");
    setIsAuthenticated(false);

    axios
      .post(AUTH_SERVER_SIGN_UP_URL, {
        user: {
          name: name,
          password: password,
          email: email,
        },
      })
      .then((res) => {
        setSnackbarOpen(true);
        setSnackbarMessage("Successfully registered!, you can now login.");
        setSnackbarSeverity("success");
        handleModalClose();
      })
      .catch((err) => {
        setHasAuthError(true);
        setAuthErrorMessage(err.response.data);
        setSnackbarOpen(true);
        setSnackbarMessage(err.response.data);
        setSnackbarSeverity("error");
      })
      .finally(() => {
        setIsAuthLoading(false);
      });
  };

  const logout = (): void => {
    setUser({
      id: -1,
      name: "",
      email: "",
    });
    setIsAuthenticated(false);
    removeKey(AUTH_TOKEN);
    setAuthToken("");
  };

  const handleSnackbarClose = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        authToken,
        isAuthLoading,
        switchToSignInModal,
        login,
        register,
        logout,
        handleModalOpen,
        handleSwitchToSignInModal,
      }}
    >
      <>
        <SignUpModal isOpen={signUpModalOpen} closeModal={handleModalClose} />
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={4000}
          onClose={handleSnackbarClose}
        >
          <Alert
            severity={snackbarSeverity}
            sx={{ width: "100%" }}
            onClose={handleSnackbarClose}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
        {(location.pathname === "/" ||
          location.pathname === "/past-polls" ||
          isAuthenticated === true) && <>{props.children}</>}
      </>
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be within a Auth Provider");
  }
  return context;
};

export { AuthenticatorProvider, useAuth };
