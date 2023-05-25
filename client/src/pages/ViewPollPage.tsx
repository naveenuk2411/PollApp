import {
  Alert,
  Box,
  Button,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  Snackbar,
  Stack,
  Typography,
} from "@mui/material";
import { PollInfo } from "./PollsPage";
import React from "react";
import axios from "axios";
import { useAuth } from "../customHooks/useAuth";

interface ViewPollPageProps {
  poll: PollInfo;
}

interface PollOption {
  id: number;
  text: string;
}

const ViewPollPage = (props: ViewPollPageProps): JSX.Element => {
  const [pollOptions, setPollOptions] = React.useState<PollOption[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [hasError, setHasError] = React.useState<boolean>(false);
  const [selectedOption, setSelectedOption] = React.useState<string>("");
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
    } catch (error: any) {
      setHasError(true);
      setErrorMessage((error as Error).message);
      setSnackbarOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitClickHandler = async () => {
    setHasError(false);
    setErrorMessage("");
    try {
      const res = await axios.post(
        `http://localhost:8000/users/${user?.id}/votes`,
        {
          pollOptionId: Number(selectedOption),
          pollId: props.poll.id,
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      setSnackbarOpen(true);
      setSnackbarMessage(res.data.message);
    } catch (error) {
      setHasError(true);
      setErrorMessage((error as Error).message);
      setSnackbarOpen(true);
    }
  };

  const handleSelectedOptionChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSelectedOption((e.target as HTMLInputElement).value);
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
              <Stack rowGap={4}>
                <FormControl>
                  <FormLabel id="demo-controlled-radio-buttons-group">
                    Poll options:
                  </FormLabel>
                  <RadioGroup
                    aria-labelledby="demo-controlled-radio-buttons-group"
                    name="controlled-radio-buttons-group"
                    value={selectedOption}
                    onChange={handleSelectedOptionChange}
                  >
                    {pollOptions.map((pollOption) => (
                      <FormControlLabel
                        key={pollOption.id}
                        value={pollOption.id.toString()}
                        control={<Radio />}
                        label={pollOption.text}
                      />
                    ))}
                  </RadioGroup>
                </FormControl>
                <Box display="inline-flex">
                  <Button
                    variant="contained"
                    disableElevation
                    onClick={onSubmitClickHandler}
                    disabled={selectedOption == null}
                  >
                    Submit vote
                  </Button>
                </Box>
              </Stack>
            )}
          </Stack>
        </>
      )}
    </>
  );
};

export default ViewPollPage;
