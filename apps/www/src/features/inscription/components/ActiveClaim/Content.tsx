import { FC, useCallback, useState } from "react";
import { Address } from "@0xflick/tapscript";
import { FeeLevel } from "@/graphql/types";

import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ToggleButton from "@mui/material/ToggleButton";
import CircularProgress from "@mui/material/CircularProgress";

import { AvatarUnrevealed } from "../AvatarUnrevealed";
import { useCostEstimate } from "./hooks/useCostEstimate";
import { BitcoinNetworkType } from "sats-connect";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputAdornment from "@mui/material/InputAdornment";
import CheckIcon from "@mui/icons-material/CheckOutlined";
import { NumberInput } from "@/components/NumberInput";

type TFeeLevel = FeeLevel | "CUSTOM";

function satsToBitcoin(sats: number) {
  return (sats / 100000000).toFixed(8);
}

export const Content: FC<{
  network: BitcoinNetworkType;
  onClaim: (opts: {
    claimCount: number;
    destinationAddress?: string;
    feeLevel?: FeeLevel;
    feePerByte?: number;
  }) => void;
}> = ({ network, onClaim }) => {
  const [destinationAddress, setDestinationAddress] = useState<string | null>(
    null
  );
  const [feeType, setFeeType] = useState<TFeeLevel>(FeeLevel.Medium);
  const [claimCount, setClaimCount] = useState<number>(1);
  const [inputClaimError, setInputClaimError] = useState<string | null>(null);
  const [inputAddressError, setInputAddressError] = useState<string | null>(
    null
  );
  const [customFee, setCustomFee] = useState<number>(100);
  const { data: costEstimate, loading: costEstimateLoading } = useCostEstimate({
    count: claimCount,
    network,
    feeLevel: feeType !== "CUSTOM" ? (feeType as FeeLevel) : undefined,
    feePerByte: feeType === "CUSTOM" ? customFee : undefined,
    pollInterval: 5000,
    skip: inputClaimError !== null,
  });
  const doDestinationAddressChanged = useCallback(
    (address: string) => {
      if (!address) {
        setDestinationAddress(null);
        setInputAddressError(null);
        return false;
      }
      try {
        const { network: destinationNetwork, type } = Address.decode(address);
        if (
          destinationNetwork !== "main" &&
          network === BitcoinNetworkType.Mainnet
        ) {
          setDestinationAddress(null);
          setInputAddressError("must be a mainnet address");
          return false;
        }
        if (
          destinationNetwork !== "testnet" &&
          network === BitcoinNetworkType.Testnet
        ) {
          setDestinationAddress(null);
          setInputAddressError("must be a testnet address");
          return false;
        }
        if (type !== "p2tr") {
          setDestinationAddress(null);
          setInputAddressError("must be a taproot address");
          return false;
        }
      } catch (e) {
        setDestinationAddress(null);
        setInputAddressError("invalid address");
        return false;
      }
      setDestinationAddress(address);
      setInputAddressError(null);
      return true;
    },
    [network]
  );
  const doClaim = useCallback(() => {
    if (!doDestinationAddressChanged(destinationAddress ?? "")) {
      return;
    }
    onClaim({
      claimCount,
      destinationAddress: destinationAddress ?? undefined,
      feeLevel: feeType !== "CUSTOM" ? (feeType as FeeLevel) : undefined,
      feePerByte: feeType === "CUSTOM" ? customFee : undefined,
    });
  }, [
    doDestinationAddressChanged,
    destinationAddress,
    onClaim,
    claimCount,
    feeType,
    customFee,
  ]);
  const doXverseClaim = useCallback(() => {
    onClaim({
      claimCount,
      feeLevel: feeType !== "CUSTOM" ? (feeType as FeeLevel) : undefined,
      feePerByte: feeType === "CUSTOM" ? customFee : undefined,
    });
  }, [claimCount, feeType, customFee, onClaim]);

  return (
    <>
      <Paper
        sx={{
          flexGrow: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          height: "100%",
          overflow: "auto",
        }}
      >
        <Typography variant="h4" textAlign="center" sx={{ mt: 2 }}>
          axolotl valley open edition claim
        </Typography>
        <Box sx={{ mt: 2 }}>
          <AvatarUnrevealed size="large" />
        </Box>
        <Typography variant="body2" textAlign="center" sx={{ mt: 2 }}>
          {claimCount === 1 ? (
            "you will receive a random axolotl"
          ) : claimCount === 0 ? (
            <br />
          ) : (
            `you will receive ${claimCount} different random axolotls`
          )}
        </Typography>

        <Box sx={{ mt: 2 }}>
          <Typography variant="body1" textAlign="left">
            fee rate
          </Typography>
          <ToggleButtonGroup
            exclusive
            value={feeType}
            onChange={(e, v) => {
              if (typeof v === "string") {
                setFeeType(v as TFeeLevel);
              }
            }}
          >
            <ToggleButton value={FeeLevel.Low}>SLOW</ToggleButton>
            <ToggleButton value={FeeLevel.Medium}>MEDIUM</ToggleButton>
            <ToggleButton value={FeeLevel.High}>FAST</ToggleButton>
            <ToggleButton value="CUSTOM">CUSTOM</ToggleButton>
          </ToggleButtonGroup>
          {feeType === "CUSTOM" && (
            <NumberInput
              id="custom-fee"
              value={customFee}
              min={1}
              onChange={(_, value) => {
                setCustomFee(Number(value));
              }}
            />
          )}
          <Typography variant="body1" textAlign="left" sx={{ mt: 2 }}>
            claim count
          </Typography>
          <NumberInput
            value={claimCount}
            error={!!inputClaimError}
            min={1}
            max={100}
            onChange={(_, value) => {
              const count = Number(value);
              if (count < 1) {
                setInputClaimError("must be at least 1");
                setClaimCount(count);
                return;
              }
              if (count > 100) {
                setInputClaimError("must be at most 100");
                setClaimCount(count);
                return;
              }
              setClaimCount(count);
              setInputClaimError(null);
            }}
          />
          <Typography variant="body2" color="error">
            {inputClaimError ?? <br />}
          </Typography>
        </Box>
        {!costEstimate &&
          (costEstimateLoading || inputClaimError || inputAddressError) && (
            <Box
              sx={{ mt: 2 }}
              height={120}
              display="flex"
              flexDirection="column"
              justifyContent="center"
              alignItems="center"
            >
              {costEstimateLoading && <CircularProgress />}
            </Box>
          )}
        {costEstimate && (
          <Box sx={{ mt: 2, px: 4 }} width="100%">
            <Box display="flex">
              <Typography variant="body1" textAlign="left" component="span">
                fee rate
              </Typography>
              <Typography
                variant="body1"
                textAlign="right"
                component="span"
                sx={{ flexGrow: 1 }}
              >
                {`${costEstimate?.feePerByte} sat / vbyte`}
              </Typography>
            </Box>
            <Box display="flex">
              <Typography variant="body1" textAlign="left" component="span">
                total estimated cost
              </Typography>
              <Typography
                variant="body1"
                textAlign="right"
                component="span"
                sx={{ flexGrow: 1 }}
              >
                {`${costEstimate?.totalInscriptionBtc} BTC`}
              </Typography>
            </Box>
            <Box display="flex">
              <Typography variant="body1" textAlign="left" component="span">
                bitflick fee per token
              </Typography>
              <Typography
                variant="body1"
                textAlign="right"
                component="span"
                sx={{ flexGrow: 1 }}
              >
                {`${costEstimate?.tipPerTokenBtc} BTC`}
              </Typography>
            </Box>
            <Box display="flex">
              <Typography variant="body1" textAlign="left" component="span">
                total btc mining fee
              </Typography>
              <Typography
                variant="body1"
                textAlign="right"
                component="span"
                sx={{ flexGrow: 1 }}
              >
                {`${costEstimate?.totalFeeBtc} BTC`}
              </Typography>
            </Box>
            <Box display="flex">
              <Typography variant="body1" textAlign="left" component="span">
                cost per token
              </Typography>
              <Typography
                variant="body1"
                textAlign="right"
                component="span"
                sx={{ flexGrow: 1 }}
              >
                {`${satsToBitcoin(
                  costEstimate?.totalInscriptionSats / claimCount
                )} BTC`}
              </Typography>
            </Box>
          </Box>
        )}
        <FormControl sx={{ my: 2 }} variant="outlined" fullWidth>
          <InputLabel htmlFor="outlined-adornment-password">
            destination address
          </InputLabel>
          <OutlinedInput
            id="outlined-adornment-password"
            onChange={(e) => doDestinationAddressChanged(e.target.value)}
            onSubmit={doClaim}
            error={!!inputAddressError}
            endAdornment={
              <>
                {destinationAddress && !inputAddressError && <CheckIcon />}
                <InputAdornment position="end">
                  <Button onClick={doClaim}>claim</Button>
                </InputAdornment>
              </>
            }
            label="destination address"
          />
          <Typography variant="body2" color="error">
            {inputAddressError ?? <br />}
          </Typography>
        </FormControl>

        <Typography variant="body1" textAlign="center">
          or claim with
        </Typography>
        <Button
          variant="contained"
          onClick={doXverseClaim}
          sx={{
            mt: 2,
            mb: 4,
          }}
        >
          xverse
        </Button>
      </Paper>
    </>
  );
};

/*
<Typography variant="body1" textAlign="left">
{`claim count (${claimCount})`}
</Typography>
<Slider
value={claimCount}
onChange={(e, v) => {
  if (typeof v === "number") {
    setClaimCount(v);
  }
}}
aria-label="Default"
valueLabelDisplay="auto"
step={1}
marks
min={1}
max={20}
/>*/
