import { FC } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";

// A loading box that takes up all vertical space, 100% width, and shows a loading spinner
export const Loading: FC<{}> = () => {
  return (
    <Paper
      sx={{
        flexGrow: 1,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
        overflow: "auto",
      }}
    >
      <Box sx={{ p: 2 }}>
        <CircularProgress />
      </Box>
    </Paper>
  );
};
