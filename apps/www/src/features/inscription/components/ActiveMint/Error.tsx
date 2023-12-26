import { FC } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardActionArea from "@mui/material/CardActionArea";
import RefreshIcon from "@mui/icons-material/Refresh";
import Typography from "@mui/material/Typography";

export const Error: FC<{
  message: string;
  onReload?: () => void;
}> = ({ message, onReload }) => {
  return (
    <Card sx={{ flexGrow: 1 }}>
      <CardActionArea onClick={onReload}>
        <CardHeader title="Error" action={onReload && <RefreshIcon />} />
        <Box sx={{ p: 2 }}>
          <Typography variant="body1">{message}</Typography>
        </Box>
      </CardActionArea>
    </Card>
  );
};
