"use client";
import { DefaultProvider } from "@/context/default";
import { AppBar } from "@/components/AppBar";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import NextImage from "next/image";
import { FC } from "react";
import { AppLink } from "@/components/AppLink";

// import Grid2 from "@mui/material/Unstable_Grid2";
// import Card from "@mui/material/Card";
// import CardContent from "@mui/material/CardContent";
// import CardActions from "@mui/material/CardActions";
// import Typography from "@mui/material/Typography";
// import { Connect } from "@/features/xverse/Connect";
// import { useXverse } from "@/features/xverse/Context";
// import { AsyncStatus } from "@/features/xverse/ducks";

// const TestConnectCard = () => {
//   const {
//     state: { ordinalsAddress, connectionStatus },
//   } = useXverse();
//   return (
//     <Card>
//       <CardContent>
//         <Typography variant="h5" component="div">
//           Connect
//         </Typography>
//         <Typography sx={{ mb: 1.5 }} color="text.secondary">
//           Connect to Xverse
//         </Typography>
//         <Typography variant="body2" textOverflow="ellipsis" overflow="hidden">
//           {connectionStatus === AsyncStatus.FULFILLED
//             ? ordinalsAddress
//             : "Connect to Xverse to get started"}
//         </Typography>
//       </CardContent>
//       <CardActions>
//         <Connect />
//       </CardActions>
//     </Card>
//   );
// };

export const Home: FC<{}> = () => {
  return (
    <DefaultProvider>
      <AppBar
        left={
          <AppLink href="/">
            <NextImage
              alt="thinking face"
              src="/images/flick.png"
              height={64}
              width={64}
            />
          </AppLink>
        }
      />
      <AppLink
        href="/start/7d33db3a-8d0f-4fe0-a781-74d314953aae"
        underline="none"
        sx={{ textDecoration: "none" }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{ mt: 16 }}
            display="flex"
            alignContent="center"
            justifyContent="center"
          >
            <NextImage
              alt="thinking face"
              src="/images/thinking.png"
              height={512}
              width={512}
            />
          </Box>
          <Box
            display="flex"
            alignContent="center"
            justifyContent="center"
            width="100%"
          >
            <Typography
              variant="h3"
              justifyContent="center"
              color="text.primary"
            >
              404 homepage not found
            </Typography>
          </Box>
        </Container>
      </AppLink>
    </DefaultProvider>
  );
};
