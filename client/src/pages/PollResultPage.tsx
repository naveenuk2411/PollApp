import { Stack, Typography } from "@mui/material";
import { PollInfo } from "./PollsPage";
import React from "react";
import axios from "axios";
import { useAuth } from "../customHooks/useAuth";
import PollResult from "../components/PollResult";
import { calculateRelativeVotePercentage } from "../util/RelativeVotePercentage";

interface PollResultPageProps {
  poll: PollInfo;
}

interface PollOption {
  id: number;
  text: string;
}

const PollResultPage = (props: PollResultPageProps): JSX.Element => {
  const [pollOptions, setPollOptions] = React.useState<PollOption[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [hasError, setHasError] = React.useState<boolean>(false);
  const [errorMessage, setErrorMessage] = React.useState<string>("");
  const [pollVotesMap, setPollVotesMap] = React.useState<Map<number, number>>(
    new Map<number, number>()
  );
  const [totalVotes, setTotalVotes] = React.useState<number>(0);
  const [pollVotesPercentMap, setPollVotesPercentMap] = React.useState<
    Map<number, number>
  >(new Map<number, number>());
  const { authToken, user } = useAuth();

  const fetchPollOptions = async (pollId: number) => {
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
  };

  const fetchPollVotes = async (pollId: number) => {
    const res = await axios.get(
      `http://localhost:8000/polls/${pollId}/votes?user_id=${user?.id}`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );
    let pollVotesMapData: Map<number, number> = new Map<number, number>();
    res.data.pollVotes.forEach((vote: any) => {
      let prevCount = pollVotesMapData.get(vote.option.id);
      if (prevCount === undefined) prevCount = 0;
      pollVotesMapData.set(vote.option.id, prevCount + 1);
    });
    let [pollVotesMapPercentData, totalVotes] =
      calculateRelativeVotePercentage(pollVotesMapData);
    setPollVotesMap(pollVotesMapData);
    setTotalVotes(totalVotes);
    setPollVotesPercentMap(pollVotesMapPercentData);
  };

  React.useEffect(() => {
    setIsLoading(true);
    setHasError(false);
    setErrorMessage("");
    try {
      fetchPollOptions(props.poll.id);
      fetchPollVotes(props.poll.id);
    } catch (error) {
      setHasError(true);
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <>
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
              <Typography variant="body1">Total Votes: {totalVotes}</Typography>
            </Stack>
            {pollOptions.length === 0 ? (
              <Typography variant="body1">
                No poll options to show for the poll
              </Typography>
            ) : (
              <Stack rowGap={4}>
                {pollOptions.map((pollOption: any) => (
                  <PollResult
                    pollText={pollOption.text}
                    pollVotes={pollVotesMap.get(pollOption.id) || 0}
                    pollVotePercentage={
                      pollVotesPercentMap.get(pollOption.id) || 0
                    }
                  />
                ))}
              </Stack>
            )}
          </Stack>
        </>
      )}
    </>
  );
};

export default PollResultPage;
