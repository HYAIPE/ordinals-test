import { BitcoinIcon } from "@/components/BitcoinIcon";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import { FC, useCallback } from "react";
import { useXverse } from "../Context";
import { BitcoinSwitchNetworks } from "./BitcoinSwitchNetworks";

import CheckCircleIcon from "@mui/icons-material/CheckCircle";

export const ConnectMenuItem: FC<{}> = () => {
  const {
    connect: xverseConnect,
    isConnected,
    isConnecting,
    address,
  } = useXverse();
  const handleBitcoinConnect = useCallback(() => {
    xverseConnect({
      message: "Connect to bitflick",
    });
  }, [xverseConnect]);
  return (
    <MenuItem onClick={handleBitcoinConnect}>
      <ListItemIcon>
        <BitcoinIcon />
      </ListItemIcon>
      <ListItemText
        primary={
          <Typography textAlign="right" noWrap>
            {!isConnected || isConnecting ? "connect" : address}
          </Typography>
        }
      />
      <CheckCircleIcon
        color={isConnected ? "success" : "disabled"}
        sx={{
          ml: 2,
        }}
      />
      <BitcoinSwitchNetworks
        sx={{
          ml: 1,
        }}
      />
    </MenuItem>
  );
};
