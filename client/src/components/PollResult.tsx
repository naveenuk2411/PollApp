import {
  Box,
  LinearProgress,
  LinearProgressProps,
  Stack,
  Typography,
} from "@mui/material";

interface PollResultProps {
  pollText: string;
  pollVotes: number;
  pollVotePercentage?: number;
}

function LinearProgressWithLabel(
  props: LinearProgressProps & { value: number | undefined }
) {
  return (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <Box sx={{ width: "50%", mr: 1 }}>
        <LinearProgress variant="determinate" {...props} />
      </Box>
      <Box sx={{ minWidth: 35 }}>
        <Typography variant="body2" color="text.secondary">{`${Math.round(
          props.value || 0
        )}%`}</Typography>
      </Box>
    </Box>
  );
}

const PollResult = (props: PollResultProps): JSX.Element => {
  return (
    <Stack>
      <Typography variant="h6">{props.pollText}</Typography>
      <Typography variant="subtitle2">{props.pollVotes} Votes</Typography>
      <LinearProgressWithLabel value={props?.pollVotePercentage} />
    </Stack>
  );
};

export default PollResult;
