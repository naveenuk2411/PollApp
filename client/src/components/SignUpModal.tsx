import React from "react";
import Modal from "@mui/material/Modal";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import {
  Stack,
  Typography,
  Box,
  createTheme,
  ThemeProvider,
  Avatar,
  TextField,
  Button,
} from "@mui/material";
import * as yup from "yup";
import { useAuth } from "../customHooks/useAuth";
import { useFormik } from "formik";

const theme = createTheme({
  typography: {
    fontFamily: ["Poppins", "sans-serif"].join(","),
  },
});

interface SignUpModalProps {
  isOpen: boolean;
  closeModal?: () => void;
}
const validationSchema = yup.object({
  // name: yup.string().required("Name is required"),
  email: yup
    .string()
    .email("Enter a valid email")
    .required("Email is required"),
  password: yup
    .string()
    .min(8, "Password should be of minimum 8 characters length")
    .required("Password is required"),
});

const SignUpModal = (props: SignUpModalProps): JSX.Element => {
  const [signIn, setSignIn] = React.useState<boolean>(false);
  const {
    login,
    isAuthLoading,
    handleSwitchToSignInModal,
    switchToSignInModal,
    register,
  } = useAuth();

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      password: "",
    },
    validationSchema: validationSchema,
    onSubmit: (values, { resetForm }) => {
      if (switchToSignInModal === true) {
        login(values.email, values.password);
      } else {
        register(values.name, values.email, values.password);
      }
      resetForm();
    },
  });

  return (
    <>
      <ThemeProvider theme={theme}>
        {props.isOpen && (
          <Modal open={props.isOpen}>
            <div className="modal">
              <Box>
                <IconButton
                  onClick={() => {
                    handleSwitchToSignInModal(false);
                    if (props.closeModal) props.closeModal();
                  }}
                  sx={{ display: "flex", marginLeft: "auto" }}
                >
                  <CloseIcon />
                </IconButton>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="center"
                  columnGap={2}
                  margin="40px"
                >
                  <Avatar
                    src={require("../assets/pollapp.jpeg")}
                    alt="Pollx Logo"
                    variant="square"
                    sx={{ height: "60px", width: "60px" }}
                  />
                  <Typography variant="h4" className="typography">
                    {switchToSignInModal === true
                      ? "Sign in to VoteX"
                      : "Join VoteX Today"}
                  </Typography>
                </Stack>
                <form onSubmit={formik.handleSubmit}>
                  <Stack rowGap={3}>
                    {switchToSignInModal === false && (
                      <Stack rowGap={1}>
                        <Typography>Name</Typography>
                        <TextField
                          id="name"
                          label="Name"
                          name="name"
                          variant="outlined"
                          value={formik.values.name}
                          onChange={formik.handleChange}
                          error={
                            formik.touched.name && Boolean(formik.errors.name)
                          }
                          helperText={formik.touched.name && formik.errors.name}
                        />
                      </Stack>
                    )}
                    <Stack rowGap={1}>
                      <Typography>Email</Typography>
                      <TextField
                        id="email"
                        name="email"
                        label="Email"
                        variant="outlined"
                        value={formik.values.email}
                        onChange={formik.handleChange}
                        error={
                          formik.touched.email && Boolean(formik.errors.email)
                        }
                        helperText={formik.touched.email && formik.errors.email}
                      />
                    </Stack>
                    <Stack rowGap={1}>
                      <Typography>Password</Typography>
                      <TextField
                        id="password"
                        name="password"
                        label="Password"
                        variant="outlined"
                        type="password"
                        value={formik.values.password}
                        onChange={formik.handleChange}
                        error={
                          formik.touched.password &&
                          Boolean(formik.errors.password)
                        }
                        helperText={
                          formik.touched.password && formik.errors.password
                        }
                      />
                    </Stack>
                  </Stack>
                  <Button
                    color="primary"
                    variant="contained"
                    type="submit"
                    disableElevation
                    sx={{ margin: "24px 0px" }}
                  >
                    {switchToSignInModal === true ? "Sign in" : "Sign up"}
                  </Button>
                </form>
                {switchToSignInModal === false && (
                  <Typography variant="subtitle2">
                    Already have an account.{" "}
                    <Button onClick={() => handleSwitchToSignInModal(true)}>
                      Sign in
                    </Button>
                  </Typography>
                )}
              </Box>
            </div>
          </Modal>
        )}
      </ThemeProvider>
    </>
  );
};

export default SignUpModal;
