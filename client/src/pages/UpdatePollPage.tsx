import { Alert, Box, Button, Snackbar, Stack, Typography } from "@mui/material";
import { PollInfo } from "./PollsPage";
import React from "react";
import axios from "axios";
import { useAuth } from "../customHooks/useAuth";

interface UpdatePollPageProps {
  poll: PollInfo;
}

interface PollOption {
  id: number;
  text: string;
}

const UpdatePollPage = (props: UpdatePollPageProps): JSX.Element => {
  const [pollOptions, setPollOptions] = React.useState<PollOption[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [hasError, setHasError] = React.useState<boolean>(false);
  const [errorMessage, setErrorMessage] = React.useState<string>("");
  const [snackbarOpen, setSnackbarOpen] = React.useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState<string>("");

  const { authToken, user } = useAuth();

  const fetchPollOptions = async (pollId: number) => {
    setIsLoading(true);
    setHasError(false);
    setErrorMessage("");
    try {
      const res = await axios.get(
        `http://localhost:8000/polls/${pollId}/options`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      let pollOptionsData: PollOption[] = [];
      pollOptionsData = res.data.pollOptions.map((pollOption: any) => {
        return {
          id: pollOption.id,
          text: pollOption.text,
        };
      });
      setPollOptions(pollOptionsData);
    } catch (error) {
      setHasError(true);
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const endPollClickHandler = async () => {
    setHasError(false);
    setErrorMessage("");
    try {
      const res = await axios.put(
        `http://localhost:8000/polls/${props.poll.id}`,
        {
          userId: user?.id,
          status: false,
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      setSnackbarMessage(res.data.message);
    } catch (error) {
      setHasError(true);
      setErrorMessage((error as Error).message);
      setSnackbarOpen(true);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  React.useEffect(() => {
    fetchPollOptions(props.poll.id);
  }, []);

  return (
    <>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
      >
        <Alert
          severity={hasError ? "error" : "success"}
          sx={{ width: "100%" }}
          onClose={handleSnackbarClose}
        >
          {hasError ? errorMessage : snackbarMessage}
        </Alert>
      </Snackbar>
      {isLoading ? (
        <Typography variant="h2">Fetching poll information</Typography>
      ) : hasError ? (
        <Typography variant="h2">Something went wrong from our end</Typography>
      ) : (
        <>
          <Stack rowGap={4}>
            <Stack>
              <Typography variant="h2">{props.poll.title}</Typography>
              <Typography variant="h6">{props.poll.description}</Typography>
            </Stack>
            {pollOptions.length === 0 ? (
              <Typography variant="body1">
                No poll options to show for the poll
              </Typography>
            ) : (
              <Stack>
                {pollOptions.map((pollOption) => (
                  <Typography variant="body1" key={pollOption.id}>
                    {pollOption.text}
                  </Typography>
                ))}
              </Stack>
            )}
            <Box display="inline-flex">
              <Button
                variant="contained"
                disableElevation
                onClick={endPollClickHandler}
              >
                End poll
              </Button>
            </Box>
          </Stack>
        </>
      )}
    </>
  );
};

export default UpdatePollPage;
