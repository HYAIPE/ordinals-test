import Container from "@mui/material/Container";
import { AppBar } from "@/components/AppBar";
import Button, { ButtonProps } from "@mui/material/Button";
import {
  FC,
  PropsWithChildren,
  useCallback,
  useReducer,
  MouseEvent,
  useState,
} from "react";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import Backdrop from "@mui/material/Backdrop";
import Box from "@mui/material/Box";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MenuList from "@mui/material/MenuList";
import Typography from "@mui/material/Typography";
import LoginIcon from "@mui/icons-material/Login";
import { Connect as XVerseConnect, useXverse } from "@/features/xverse";
import { MenuItemConnect as WagmiConnect, useWeb3 } from "@/features/web3";
import { AddressPurposes, BitcoinNetwork } from "sats-connect";
import { BitcoinIcon } from "@/components/BitcoinIcon";
import { MultiChainProvider } from "@/context/multiChain";
import { ConnectMenuItem as XverseConnectMenuItem } from "@/features/xverse";

interface IConnectedDropDownProps {
  anchorEl: Element | null;
  handleClose: () => void;
}

export const ConnectedDropDownModal: FC<IConnectedDropDownProps> = ({
  anchorEl,
  handleClose,
}) => {
  const open = Boolean(anchorEl);
  return (
    <>
      <Menu
        anchorEl={anchorEl}
        open={open}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        onClose={handleClose}
        keepMounted
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <Box sx={{ width: 320 }}>
          <MenuList disablePadding>
            <WagmiConnect />
            <XverseConnectMenuItem />
          </MenuList>
        </Box>
      </Menu>
    </>
  );
};

export const Connect: FC<{
  size?: ButtonProps["size"];
}> = ({ size }) => {
  const [menuAnchorEl, setMenuAnchorEl] = useState<Element | null>(null);
  const { isConnected: ethereumIsConnected } = useWeb3();
  const { network } = useXverse();

  const handleMenu = useCallback((event: MouseEvent) => {
    setMenuAnchorEl(event.currentTarget);
  }, []);

  return (
    <>
      <Button
        startIcon={ethereumIsConnected ? <CheckCircleIcon /> : null}
        variant="outlined"
        size={size}
        sx={{
          m: "0.5rem",
        }}
        onClick={handleMenu}
      >
        connect
      </Button>
      <ConnectedDropDownModal
        anchorEl={menuAnchorEl}
        handleClose={() => setMenuAnchorEl(null)}
      />
    </>
  );
};

export const SwitchableNetwork: FC<
  PropsWithChildren<{
    title: string;
    initialBitcoinNetwork: BitcoinNetwork["type"];
    initialBitcoinPurpose: AddressPurposes;
    ethereumAutoConnect?: boolean;
  }>
> = ({
  children,
  title,
  ethereumAutoConnect,
  initialBitcoinNetwork,
  initialBitcoinPurpose,
}) => {
  return (
    <MultiChainProvider
      bitcoinNetwork={initialBitcoinNetwork}
      bitcoinPurpose={initialBitcoinPurpose}
      ethereumAutoConnect={ethereumAutoConnect}
    >
      <AppBar left={title} right={<Connect />} />
      <Container
        sx={{
          mt: 8,
        }}
      >
        {children}
      </Container>
    </MultiChainProvider>
  );
};
