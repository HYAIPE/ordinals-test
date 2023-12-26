import { FC, useCallback } from "react";
import Modal from "@mui/material/Modal";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import CardActionArea from "@mui/material/CardActionArea";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { Qr } from "./Qr";
import { useXverse } from "@/features/xverse";

export const PaymentModal: FC<{
  open: boolean;
  handleClose: () => void;
  handleConfirm: () => void;
  qrSrc?: string;
  paymentAddress?: string;
  paymentAmount?: string;
  paymentAmountSats?: number;
}> = ({
  open,
  handleClose,
  handleConfirm,
  qrSrc,
  paymentAddress,
  paymentAmount,
  paymentAmountSats,
}) => {
  const { sendBtc, isConnected, connect } = useXverse();

  const sendXverse = useCallback(async () => {
    if (!paymentAddress || !paymentAmountSats) {
      return;
    }
    if (!isConnected) {
      await connect({
        message: "Connect to Xverse to fund inscription",
      });
    }
    await sendBtc({
      paymentAddress,
      paymentAmountSats,
    });
  }, [isConnected, connect, sendBtc, paymentAddress, paymentAmountSats]);

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-btc-payment-title"
      aria-describedby="Bitcoin payment request"
      slotProps={{
        backdrop: {
          sx: { backgroundColor: "rgba(0,0,0,0.5)" },
        },
      }}
    >
      <Card
        sx={{
          position: "absolute" as "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          bgcolor: "background.paper",
          border: "2px solid #000",
          boxShadow: 24,
          p: 4,
        }}
      >
        <CardHeader
          id="modal-btc-payment-title"
          title="payment request"
          titleTypographyProps={{
            variant: "h6",
          }}
          sx={{
            textAlign: "center",
          }}
        />
        <CardContent>
          <Qr qrSrc={qrSrc ?? ""} />
          <Typography variant="body1" sx={{ mb: 1, mt: 2 }} textAlign="center">
            send {paymentAmount} BTC to:
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }} noWrap textAlign="center">
            {paymentAddress}
          </Typography>
        </CardContent>
        <CardActionArea
          onClick={handleConfirm}
          sx={{
            textAlign: "center",
            py: 2,
          }}
        >
          <Typography variant="body1" sx={{ mb: 1, mr: 2 }} component="span">
            pay with
          </Typography>
          <Button variant="contained" onClick={sendXverse}>
            Xverse
          </Button>
        </CardActionArea>
      </Card>
    </Modal>
  );
};
