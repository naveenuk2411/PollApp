import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import PollIcon from "@mui/icons-material/Poll";
import ManageSearchIcon from "@mui/icons-material/ManageSearch";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import CreateIcon from "@mui/icons-material/Create";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import {
  Avatar,
  Button,
  IconButton,
  MenuItem,
  Typography,
  Menu,
  MenuList,
  ListItemIcon,
  Stack,
  styled,
  StyledComponentProps,
} from "@mui/material";
import { useAuth } from "../customHooks/useAuth";

interface AnimatedUnderlineProps extends StyledComponentProps {
  colorHover?: string;
}

export const AnimatedUnderline = styled(Typography)<AnimatedUnderlineProps>(
  ({ colorHover }) => ({
    position: "relative",
    cursor: "pointer",
    "&:hover": {
      color: colorHover,
    },
    "&::after": {
      content: '""',
      position: "absolute",
      left: 0,
      bottom: -4,
      width: "100%",
      height: 2,
      backgroundColor: colorHover,
      transform: "scaleX(0)",
      transition: "transform 0.3s ease-in-out",
      transformOrigin: "left",
    },
    "&:hover::after": {
      transform: "scaleX(1)",
      backgroundColor: colorHover,
    },
  })
);

const Navbar = (): JSX.Element => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const navigate = useNavigate();
  const location = useLocation();

  const {
    isAuthenticated,
    handleModalOpen,
    user,
    logout,
    handleSwitchToSignInModal,
  } = useAuth();

  const handleProfileOpen = (event: React.MouseEvent<HTMLElement>): void => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileClose = (): void => {
    setAnchorEl(null);
  };

  const handleNavigation = (redirectPath: string) => {
    if (
      !isAuthenticated &&
      redirectPath !== "/" &&
      redirectPath !== "/past-polls"
    ) {
      handleModalOpen();
    } else {
      navigate(redirectPath);
    }
  };

  return (
    <nav style={{ marginBottom: "4%" }}>
      <Link
        to="/"
        className="navbar-logo"
        style={{
          textDecoration: "none",
          display: "block",
          color: "black",
        }}
      >
        <Stack direction="row" columnGap={2} alignItems="center">
          <Avatar
            src={require("../assets/pollapp.jpeg")}
            alt="Pollx Logo"
            variant="square"
            sx={{ height: "60px", width: "60px" }}
          />
          <Typography variant="h5">PollX</Typography>
        </Stack>
      </Link>
      <div className="navbar-actions">
        <Stack direction="row" columnGap={4} marginRight="3em">
          <AnimatedUnderline
            colorHover="#39d279"
            onClick={() => handleNavigation("/")}
          >
            <Stack direction="row" alignItems="center">
              <PollIcon />
              <Typography variant="h6">Active Polls</Typography>
            </Stack>
          </AnimatedUnderline>
          <AnimatedUnderline
            colorHover="#39d279"
            onClick={() => handleNavigation("/past-polls")}
          >
            <Stack direction="row" alignItems="center">
              <TaskAltIcon />
              <Typography variant="h6">Past Polls</Typography>
            </Stack>
          </AnimatedUnderline>
        </Stack>

        {!isAuthenticated && (
          <Button
            variant="contained"
            color="primary"
            disableElevation
            className="sign-up-button"
            onClick={handleModalOpen}
          >
            Sign up
          </Button>
        )}
        <IconButton size="small" onClick={handleProfileOpen}>
          <AccountCircleIcon fontSize="large" />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClick={handleProfileClose}
          onClose={handleProfileClose}
          elevation={1}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
        >
          {isAuthenticated ? (
            <MenuList>
              <MenuItem>
                <ListItemIcon>
                  <PersonIcon />
                </ListItemIcon>
                <Typography>{user?.name}</Typography>
              </MenuItem>
              <Link
                to="/manage-polls"
                style={{
                  textDecoration: "none",
                  display: "block",
                  color: "black",
                }}
              >
                <MenuItem>
                  <ListItemIcon>
                    <ManageSearchIcon />
                  </ListItemIcon>
                  <Typography>Manage polls</Typography>
                </MenuItem>
              </Link>
              <Link
                to="/create-poll"
                style={{
                  textDecoration: "none",
                  display: "block",
                  color: "black",
                }}
              >
                <MenuItem>
                  <ListItemIcon>
                    <CreateIcon />
                  </ListItemIcon>
                  <Typography>Create poll</Typography>
                </MenuItem>
              </Link>
              <MenuItem onClick={logout}>
                <ListItemIcon>
                  <LogoutIcon />
                </ListItemIcon>
                <Typography>Log out</Typography>
              </MenuItem>
            </MenuList>
          ) : (
            <MenuList>
              <MenuItem
                onClick={() => {
                  handleSwitchToSignInModal(true);
                  handleModalOpen();
                }}
              >
                <ListItemIcon>
                  <ExitToAppIcon />
                </ListItemIcon>
                <Typography>Sign in</Typography>
              </MenuItem>
            </MenuList>
          )}
        </Menu>
      </div>
    </nav>
  );
};

export default Navbar;
