import { FC } from "react";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";

export const ClaimingModal: FC<{
  open: boolean;
}> = ({ open }) => {
  return (
    <Modal
      open={open}
      aria-labelledby="claiming-modal-title"
      aria-describedby="claiming-modal-description"
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: 400,
          bgcolor: "background.paper",
          border: "2px solid #000",
          boxShadow: 24,
          p: 4,
          transform: "translate(-50%, -50%)",
        }}
      >
        <Typography id="claiming-modal-title" variant="h6" component="h2">
          Claiming
        </Typography>
        <Typography id="claiming-modal-description" sx={{ mt: 2 }}>
          <CircularProgress />
        </Typography>
      </Box>
    </Modal>
  );
};
