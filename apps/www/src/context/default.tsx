import { FC, PropsWithChildren } from "react";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { Provider as XverseProvider } from "../features/xverse/Context";
import theme from "@/theme";
import { BitcoinNetwork } from "sats-connect";

export const DefaultProvider: FC<
  PropsWithChildren<{
    network?: BitcoinNetwork;
  }>
> = ({ children, network }) => {
  network = network ?? {
    type: "Mainnet",
  };
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <XverseProvider network={network}>{children}</XverseProvider>
    </ThemeProvider>
  );
};
