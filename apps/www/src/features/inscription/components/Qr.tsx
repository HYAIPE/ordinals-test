/* eslint-disable @next/next/no-img-element */
import { FC } from "react";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";

export const Qr: FC<{
  qrSrc: string;
}> = ({ qrSrc }) => {
  return (
    <Paper
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        height: "100%",
        bgcolor: "background.paper",
      }}
    >
      <Box
        sx={{
          width: "100%",
          height: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <img src={qrSrc} alt="Send bitcoin QR code" />
      </Box>
    </Paper>
  );
};
