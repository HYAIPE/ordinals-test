import { FC, useCallback, useEffect, useState } from "react";
import { useXverse } from "@/features/xverse";
import Snackbar from "@mui/material/Snackbar";
import { useRouter } from "next/navigation";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import CircularProgress from "@mui/material/CircularProgress";
import { Qr } from "../Qr";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CardActionArea from "@mui/material/CardActionArea";
import Button from "@mui/material/Button";
import { useFetchFundingQuery } from "./FetchFunding.generated";
import { AddressPurpose, BitcoinNetworkType } from "sats-connect";
import { CopyToClipboard } from "@/components/CopyToClipboard";

const Loading: FC = () => {
  return (
    <Card>
      <CardHeader title="loading" />
      <Box
        component={CardContent}
        sx={{ p: 4 }}
        height={400}
        display="flex"
        flexDirection="column"
        alignContent="center"
      >
        <CircularProgress />
      </Box>
    </Card>
  );
};

export const Pay: FC<{
  fundingId: string;
  network: BitcoinNetworkType;
}> = ({ fundingId, network }) => {
  const [doSend, setDoSend] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined
  );
  const [successMessage, setSuccessMessage] = useState<string | undefined>(
    undefined
  );
  const {
    sendBtc,
    isConnected,
    connect,
    state: { currentTarget },
    networkSelect,
  } = useXverse();
  const router = useRouter();
  const { data, loading } = useFetchFundingQuery({
    variables: {
      id: fundingId,
    },
  });

  useEffect(() => {
    if (
      doSend &&
      data?.inscriptionFunding?.fundingAddress &&
      data?.inscriptionFunding?.fundingAmountSats
    ) {
      setDoSend(false);
      sendBtc({
        paymentAddress: data?.inscriptionFunding?.fundingAddress,
        paymentAmountSats: data?.inscriptionFunding?.fundingAmountSats,
      })
        .then(() => {
          setSuccessMessage("Payment sent");
          setTimeout(() => {
            router.push(`/${network.toLowerCase()}/status/${fundingId}`);
          }, 2000);
        })
        .catch((e) => {
          console.error(e);
          setErrorMessage(e.message);
        });
    }
  }, [
    doSend,
    data?.inscriptionFunding?.fundingAddress,
    data?.inscriptionFunding?.fundingAmountSats,
    sendBtc,
  ]);

  const sendXverse = useCallback(() => {
    if (
      data?.inscriptionFunding?.fundingAmountSats &&
      (!isConnected ||
        currentTarget.purpose !== AddressPurpose.Payment ||
        currentTarget.network !== network)
    ) {
      networkSelect({
        network: currentTarget.network,
        purpose: AddressPurpose.Payment,
      });
      connect({
        message: "Please connect your wallet to continue",
      })
        .then(({ paymentAddress }) => {
          console.log("paymentAddress", paymentAddress);
          if (paymentAddress) {
            setDoSend(true);
          }
        })
        .catch((e) => {
          console.error(e);
          setErrorMessage(e.message);
        });
    } else if (
      data?.inscriptionFunding?.fundingAmountSats &&
      data?.inscriptionFunding?.fundingAddress &&
      isConnected
    ) {
      setDoSend(true);
    }
  }, [
    data?.inscriptionFunding?.fundingAmountSats,
    data?.inscriptionFunding?.fundingAddress,
    isConnected,
    currentTarget.purpose,
    currentTarget.network,
    network,
    networkSelect,
    connect,
    sendBtc,
    router,
    fundingId,
  ]);

  if (!data || loading) {
    return <Loading />;
  }

  const inscriptionData = data.inscriptionFunding;
  if (!inscriptionData) {
    return <Loading />;
  }

  const { qrSrc, fundingAddress, fundingAmountBtc } = inscriptionData;
  return (
    <>
      <Snackbar
        open={!!errorMessage}
        onClose={() => setErrorMessage(undefined)}
        autoHideDuration={2000}
        message={errorMessage}
        ContentProps={{ sx: { backgroundColor: "red" } }}
      />
      <Snackbar
        open={!!successMessage}
        onClose={() => setSuccessMessage(undefined)}
        autoHideDuration={2000}
        message={successMessage}
      />
      <Card
        sx={{
          width: "100%",
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
            send {fundingAmountBtc} BTC to:
          </Typography>
          <CopyToClipboard text={fundingAddress ?? ""} sx={{ mt: 1 }}>
            <Typography
              component="span"
              variant="body1"
              sx={{ mb: 1 }}
              noWrap
              textAlign="center"
            >
              {fundingAddress}
            </Typography>
          </CopyToClipboard>
        </CardContent>
        <CardActionArea
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
    </>
  );
};
