import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import "./App.css";
import { Box, Typography, createTheme } from "@mui/material";
import { ThemeProvider } from "@mui/material";
import PollsPage, { PollInfo } from "./pages/PollsPage";
import CreatePollPage from "./pages/CreatePollPage";
import { useAuth } from "./customHooks/useAuth";
import { PollPageType } from "./types/Poll";
import PollResultPage from "./pages/PollResultPage";
import ViewPollPage from "./pages/ViewPollPage";
import ManagePollPage from "./pages/ManagePollPage";
import UpdatePollPage from "./pages/UpdatePollPage";

const theme = createTheme({
  typography: {
    fontFamily: ["Poppins", "sans-serif"].join(","),

    button: {
      textTransform: "none",
    },
  },
});

function App() {
  const { authToken, user } = useAuth();
  const [selectedPoll, setSelectedPoll] = React.useState<PollInfo>({
    id: 0,
    title: "Dummy-Title",
    description: "Dummy-description",
  });

  const handleSelectedPoll = (poll: PollInfo) => {
    setSelectedPoll(poll);
  };

  const location = useLocation();

  return (
    <ThemeProvider theme={theme}>
      <>
        <Navbar />
        <Box marginLeft="5%" marginRight="5%">
          {authToken !== "" && user !== null ? (
            <>
              <Routes>
                <Route
                  path="/"
                  element={
                    <PollsPage
                      pollPageType={PollPageType.ONGOING}
                      pollCardButtonText="Vote"
                      selectedPollHandler={handleSelectedPoll}
                    />
                  }
                />
                <Route
                  path="/past-polls"
                  element={
                    <PollsPage
                      pollPageType={PollPageType.PAST}
                      pollCardButtonText="Show vote results"
                      selectedPollHandler={handleSelectedPoll}
                    />
                  }
                />
                <Route path="/create-poll" element={<CreatePollPage />} />
                <Route
                  path="/poll-result"
                  element={<PollResultPage poll={selectedPoll} />}
                />
                <Route
                  path="/view-poll"
                  element={<ViewPollPage poll={selectedPoll} />}
                />
                <Route
                  path="/update-poll"
                  element={<UpdatePollPage poll={selectedPoll} />}
                />
                <Route
                  path="/manage-polls"
                  element={
                    <ManagePollPage
                      pollPageType={PollPageType.MANAGE}
                      pollCardButtonText="Update poll"
                      selectedPollHandler={handleSelectedPoll}
                    />
                  }
                />
              </Routes>
            </>
          ) : (
            <Typography variant="h2">Please login or sign up</Typography>
          )}
        </Box>
      </>
    </ThemeProvider>
  );
}

export default App;
