import { FC, useMemo, useState } from "react";
import { AddressPurpose, BitcoinNetwork } from "sats-connect";
import Menu from "@mui/material/Menu";
import Box from "@mui/material/Box";
import MenuList from "@mui/material/MenuList";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { BitcoinIcon } from "@/components/BitcoinIcon";
import { SxProps } from "@mui/material/styles";
import { useXverse } from "../Context";
import IconButton from "@mui/material/IconButton";
import Avatar from "@mui/material/Avatar";
import Backdrop from "@mui/material/Backdrop";

export interface INetworkPurpose {
  network: BitcoinNetwork["type"];
  purpose: AddressPurpose;
}
const ConnectedDropDownModal: FC<{
  anchorEl: Element | null;
  networks: readonly INetworkPurpose[];
  handleClose: () => void;
  handleSwitch: (network: INetworkPurpose) => void;
  currentNetwork?: INetworkPurpose;
}> = ({ anchorEl, handleClose, handleSwitch, networks, currentNetwork }) => {
  const open = Boolean(anchorEl);
  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right",
      }}
      onClose={(event) => {
        (event as MouseEvent).stopPropagation();
        handleClose();
      }}
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
          {networks.map((network) => (
            <MenuItem
              key={network.network + network.purpose}
              onClick={(event) => {
                event.stopPropagation();
                handleSwitch(network);
              }}
            >
              <ListItemIcon>
                {currentNetwork === network ? (
                  <CheckCircleIcon sx={{ fontSize: 40 }} />
                ) : (
                  <Avatar alt={network.network}>
                    {network.network.slice(0, 1)}
                  </Avatar>
                )}
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography textAlign="right">{`(${network.purpose.toLowerCase()}) ${network.network.toLowerCase()}`}</Typography>
                }
              />
            </MenuItem>
          ))}
        </MenuList>
      </Box>
    </Menu>
  );
};
export const BitcoinSwitchNetworks: FC<{
  sx?: SxProps;
}> = ({ sx }) => {
  const { networkSelect, network, purpose } = useXverse();

  const [anchorEl, setAnchorEl] = useState<Element | null>(null);
  const allNetworks = useMemo(() => {
    return [
      {
        network: "Mainnet" as const,
        purpose: AddressPurpose.Payment,
      },
      {
        network: "Mainnet" as const,
        purpose: AddressPurpose.Ordinals,
      },
      {
        network: "Testnet" as const,
        purpose: AddressPurpose.Payment,
      },

      {
        network: "Testnet" as const,
        purpose: AddressPurpose.Ordinals,
      },
    ];
  }, []);
  const currentNetwork = useMemo(
    () =>
      allNetworks.find((n) => n.network === network && n.purpose === purpose),
    [allNetworks, network, purpose]
  );
  return (
    <>
      <IconButton
        sx={sx}
        onClick={(event) => {
          event.stopPropagation();
          setAnchorEl(event.currentTarget);
        }}
      >
        <Avatar alt="change bitcoin network">{network.slice(0, 1)}</Avatar>
      </IconButton>
      <ConnectedDropDownModal
        anchorEl={anchorEl}
        handleClose={() => setAnchorEl(null)}
        handleSwitch={(network) => {
          networkSelect(network);
          setAnchorEl(null);
        }}
        networks={allNetworks}
        currentNetwork={currentNetwork}
      />
    </>
  );
};
