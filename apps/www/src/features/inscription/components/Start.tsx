import { FC } from "react";
import Avatar from "@mui/material/Avatar";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import CardActionArea from "@mui/material/CardActionArea";
import Typography from "@mui/material/Typography";

import { AvatarUnrevealed } from "./AvatarUnrevealed";

export const Start: FC<{
  onInscribe: () => void;
}> = ({ onInscribe }) => {
  return (
    <Card>
      <CardActionArea onClick={onInscribe}>
        <CardHeader
          avatar={
            <Avatar>
              <AvatarUnrevealed />
            </Avatar>
          }
        />
        <CardContent>
          <Typography variant="body1" component="p">
            inscribe an axolotl
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};
