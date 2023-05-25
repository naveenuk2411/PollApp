import {
  Button,
  Card,
  CardActions,
  CardContent,
  Typography,
} from "@mui/material";
import { PollInfo } from "../pages/PollsPage";
import { useNavigate } from "react-router-dom";
import { PollPageType } from "../types/Poll";

interface PollCardProps {
  pollInfo: PollInfo;
  buttonText: string;
  pollType: PollPageType;
  onClickHandler: (poll: PollInfo) => void;
}

const PollCard = (props: PollCardProps): JSX.Element => {
  const navigate = useNavigate();

  return (
    <Card
      variant="outlined"
      sx={{
        width: "400px",
        maxHeight: "600px",
        display: "flex",
        justifyContent: "space-between",
        flexDirection: "column",
        backgroundColor: "#c3f0c8",
      }}
    >
      <CardContent>
        <Typography variant="h4">{props.pollInfo.title}</Typography>
        <Typography variant="subtitle1">
          {props.pollInfo.description}
        </Typography>
      </CardContent>
      <CardActions>
        <Button
          disableElevation
          onClick={() => {
            props.onClickHandler(props.pollInfo);
            props.pollType === PollPageType.PAST
              ? navigate("/poll-result")
              : props.pollType == PollPageType.ONGOING
              ? navigate("/view-poll")
              : navigate("/update-poll");
          }}
        >
          {props.buttonText}
        </Button>
      </CardActions>
    </Card>
  );
};

export default PollCard;
