import { FC } from "react";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import CardActionArea from "@mui/material/CardActionArea";
import Typography from "@mui/material/Typography";

import { AvatarUnrevealed } from "../AvatarUnrevealed";
import { useStatus } from "./useStatus";

export const Start: FC<{
  onInscribe: () => void;
  collectionId: string;
}> = ({ onInscribe, collectionId }) => {
  const { totalCount, revealedCount, maxSupply, success } =
    useStatus(collectionId);
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
          <Box display="flex">
            <Typography variant="body1" component="p" flexGrow="1">
              inscribe an axolotl
            </Typography>
            {success && typeof revealedCount === "number" && (
              <>
                <Typography variant="body1">{revealedCount}</Typography>
                {typeof maxSupply === "number" && (
                  <Typography variant="body1" ml={1}>
                    /
                  </Typography>
                )}
              </>
            )}
            {success && typeof maxSupply === "number" && (
              <Typography variant="body1" ml={1}>
                {maxSupply}
              </Typography>
            )}
            {success &&
              typeof totalCount === "number" &&
              typeof revealedCount === "number" && (
                <Typography variant="body1" ml={1}>
                  {`(${totalCount - revealedCount} pending claims)`}
                </Typography>
              )}
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};
