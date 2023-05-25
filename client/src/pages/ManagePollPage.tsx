import React from "react";
import { Box, Stack, Typography } from "@mui/material";
import PollCard from "../components/PollCard";
import { PollPageType } from "../types/Poll";
import axios from "axios";
import { POLL_SERVER_GET_ALL_POLLS } from "../constants/Routes";
import { useAuth } from "../customHooks/useAuth";
import { useLocation } from "react-router-dom";

export interface PollInfo {
  id: number;
  title: string;
  description: string;
}

interface ManagePollPageProps {
  pollPageType: PollPageType;
  pollCardButtonText: string;
  selectedPollHandler: (poll: PollInfo) => void;
}

const ManagePollPage = (props: ManagePollPageProps): JSX.Element => {
  const [polls, setPolls] = React.useState<PollInfo[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [hasError, setHasError] = React.useState<boolean>(false);
  const [errorMessage, setErrorMessage] = React.useState<string>("");

  const { authToken, user } = useAuth();

  const location = useLocation();
  const fetchPolls = async () => {
    setIsLoading(true);
    setHasError(false);
    setErrorMessage("");
    try {
      const res = await axios.get(
        `${POLL_SERVER_GET_ALL_POLLS}?user_id=${user?.id}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      let pollsData: PollInfo[] = [];
      pollsData = res.data.polls.filter((poll: any) => {
        if (poll.status === true) {
          return {
            id: poll.id,
            title: poll.title,
            description: poll.description,
          };
        }
      });
      setPolls(pollsData);
    } catch (error) {
      setHasError(true);
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchPolls();
  }, [location.pathname]);

  return (
    <>
      {isLoading ? (
        <Typography variant="h2">Fetching polls information</Typography>
      ) : hasError ? (
        <Typography variant="h2">Something went wrong from our end</Typography>
      ) : polls.length === 0 ? (
        <Typography variant="h2">No polls found</Typography>
      ) : (
        <>
          <Box>
            <Typography variant="h2">{props.pollPageType}</Typography>
            <Stack
              direction="row"
              marginTop="4em"
              columnGap="4em"
              rowGap="4em"
              display="flex"
              flexWrap="wrap"
            >
              {polls.map((poll) => (
                <PollCard
                  key={poll.id}
                  pollInfo={poll}
                  pollType={props.pollPageType}
                  buttonText={props.pollCardButtonText}
                  onClickHandler={props.selectedPollHandler}
                />
              ))}
            </Stack>
          </Box>
        </>
      )}
    </>
  );
};

export default ManagePollPage;
