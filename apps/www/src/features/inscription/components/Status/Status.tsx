import { FC, ReactNode, useCallback } from "react";
import { useRouter } from "next/navigation";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import CheckIcon from "@mui/icons-material/CheckOutlined";
import WaitingIcon from "@mui/icons-material/HourglassEmptyOutlined";
import { useFetchFundingStatusQuery } from "./FetchFundingStatus.generated";
import { Field } from "@/components/Field";
import { FundingStatus } from "@/graphql/types";
import { AppLink } from "@/components/AppLink";

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

const Row: FC<{
  label: string;
  status: ReactNode;
  inProgress: boolean;
  success: boolean;
}> = ({ label, status, inProgress, success }) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        mb: 2,
      }}
    >
      <Box width={16} height={16} sx={{ mr: 1 }}>
        {inProgress ? <CircularProgress size={16} /> : null}
        {success ? <CheckIcon fontSize="small" /> : null}
        {!(inProgress || success) ? <WaitingIcon /> : null}
      </Box>

      <Field
        label={
          <Typography variant="body1" fontWeight="bold">
            {label}
          </Typography>
        }
        value={status}
      />
    </Box>
  );
};

export const Status: FC<{
  fundingId: string;
}> = ({ fundingId }) => {
  const router = useRouter();
  const { data, loading } = useFetchFundingStatusQuery({
    variables: {
      id: fundingId,
    },
    pollInterval: 5000,
  });

  if (!data || loading) {
    return <Loading />;
  }

  const inscriptionData = data.inscriptionFunding;
  if (!inscriptionData) {
    return <Loading />;
  }

  const {
    status,
    fundingGenesisTxId,
    fundingRevealTxIds,
    fundingTxId,
    fundingGenesisTxUrl,
    fundingRevealTxUrls,
    fundingTxUrl,
    inscriptionTransaction,
  } = inscriptionData;
  const revealCount = inscriptionTransaction.count;
  const fundedSuccess = [
    FundingStatus.Funded,
    FundingStatus.Genesis,
    FundingStatus.Revealed,
  ].includes(status);
  const fundedInProgress = status === FundingStatus.Funding;
  const genesisSuccess = [
    FundingStatus.Genesis,
    FundingStatus.Revealed,
  ].includes(status);
  const genesisInProgress = status === FundingStatus.Funded;
  const revealInProgress = status === FundingStatus.Genesis;
  return (
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
        title="inscription status"
        titleTypographyProps={{
          variant: "h6",
        }}
        sx={{
          textAlign: "center",
        }}
      />
      <CardContent>
        <Row
          label="funding tx"
          status={
            fundedInProgress ? (
              <LinearProgress />
            ) : fundingTxUrl ? (
              <AppLink
                href={fundingTxUrl}
                target="_blank"
                rel="noopener noreferrer"
                noWrap
              >
                {fundingTxId}
              </AppLink>
            ) : (
              fundingTxId
            )
          }
          inProgress={fundedInProgress}
          success={fundedSuccess}
        />
        <Row
          label="genesis tx"
          status={
            genesisInProgress ? (
              <LinearProgress />
            ) : fundingGenesisTxUrl ? (
              <AppLink
                href={fundingGenesisTxUrl}
                target="_blank"
                rel="noopener noreferrer"
                noWrap
              >
                {fundingGenesisTxId}
              </AppLink>
            ) : (
              fundingGenesisTxId
            )
          }
          inProgress={genesisInProgress}
          success={genesisSuccess}
        />
        {new Array(revealCount).fill(null, 0, revealCount).map((_, index) => {
          return (
            <Row
              key={fundingRevealTxIds?.[index] ?? index}
              label="reveal tx"
              status={
                revealInProgress ? (
                  <LinearProgress />
                ) : fundingRevealTxUrls?.[index] ? (
                  <AppLink
                    href={fundingRevealTxUrls[index]}
                    target="_blank"
                    rel="noopener noreferrer"
                    noWrap
                  >
                    {fundingRevealTxIds?.[index]}
                  </AppLink>
                ) : (
                  fundingRevealTxIds?.[index]
                )
              }
              inProgress={revealInProgress && !fundingRevealTxIds?.[index]}
              success={!!fundingRevealTxIds?.[index]}
            />
          );
        })}
      </CardContent>
    </Card>
  );
};
