import React from "react";
import { useAuth } from "../customHooks/useAuth";
import axios from "axios";
import { POLL_SERVER_CREATE_POLL } from "../constants/Routes";
import {
  Alert,
  Box,
  Button,
  IconButton,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

const CreatePollPage = (): JSX.Element => {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [hasError, setHasError] = React.useState<boolean>(false);
  const [errorMessage, setErrorMessage] = React.useState<string>("");
  const [pollTitle, setPollTitle] = React.useState<string>("");
  const [pollDescription, setPollDescription] = React.useState<string>("");
  const [pollOptions, setPollOptions] = React.useState<string[]>([]);
  const [snackbarOpen, setSnackbarOpen] = React.useState<boolean>(false);

  const { authToken, user } = useAuth();

  const pollTitleChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPollTitle(e.target.value);
  };

  const pollDescriptionChangeHandler = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setPollDescription(e.target.value);
  };

  const pollOptionChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const prevPollOptions = pollOptions;
    const newPollOptions = [...prevPollOptions];
    newPollOptions[newPollOptions.length - 1] = e.target.value;
    setPollOptions(newPollOptions);
  };

  const addPollClickHandler = () => {
    const prevPollOptions = pollOptions;
    const newPollOptions = [...prevPollOptions, ""];
    setPollOptions(newPollOptions);
  };

  const deletePollClickHandler = (id: number) => {
    const prevPollOptions = pollOptions;
    prevPollOptions.splice(id, 1);
    const newPollOptions = [...prevPollOptions];
    setPollOptions(newPollOptions);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const createPoll = async () => {
    setIsLoading(true);
    setHasError(false);
    setErrorMessage("");
    try {
      const res = await axios.post(
        POLL_SERVER_CREATE_POLL,
        {
          poll: {
            title: pollTitle,
            description: pollDescription,
            status: true,
          },
          pollOptions: pollOptions,
          userId: user?.id,
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      setSnackbarOpen(true);
    } catch (error) {
      setHasError(true);
      setErrorMessage((error as Error).message);
      setSnackbarOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

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
          {hasError ? errorMessage : "Poll was created successfully"}
        </Alert>
      </Snackbar>
      <Stack rowGap={6} width="50%">
        <Typography variant="h2">Create a new poll</Typography>
        <Stack rowGap={2}>
          <Typography variant="h4">Poll title</Typography>
          <TextField
            variant="outlined"
            value={pollTitle}
            label={"Enter poll title"}
            onChange={pollTitleChangeHandler}
          />
        </Stack>
        <Stack>
          <Stack rowGap={2}>
            <Typography variant="h4">Poll description</Typography>
            <TextField
              variant="outlined"
              value={pollDescription}
              label={"Enter poll description"}
              onChange={pollDescriptionChangeHandler}
            />
          </Stack>
        </Stack>
        <Stack rowGap={2}>
          <Typography variant="h4">Poll Options</Typography>
          {pollOptions.map((pollOption, index) => (
            <Stack direction="row" columnGap={2}>
              <TextField
                key={index}
                variant="outlined"
                label="Enter poll option"
                fullWidth={true}
                value={pollOptions[index]}
                disabled={index != pollOptions.length - 1}
                onChange={pollOptionChangeHandler}
              />
              <IconButton onClick={() => deletePollClickHandler(index)}>
                <DeleteIcon />
              </IconButton>
            </Stack>
          ))}
          <Box display="inline-flex">
            <Button
              onClick={addPollClickHandler}
              variant="contained"
              disableElevation
            >
              Add option
            </Button>
          </Box>
        </Stack>
        <Box display="inline-flex">
          <Button
            variant="contained"
            disableElevation
            onClick={createPoll}
            color="primary"
            disabled={
              pollTitle === "" ||
              pollDescription === "" ||
              pollOptions.length === 0 ||
              pollOptions[0] === ""
            }
          >
            Create poll
          </Button>
        </Box>
      </Stack>
    </>
  );
};

export default CreatePollPage;
