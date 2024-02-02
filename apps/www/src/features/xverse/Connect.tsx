import Button from "@mui/material/Button";
import { useXverse } from "./Context";
import { AsyncStatus } from "./ducks";
import { useCallback } from "react";

export const Connect = () => {
  const {
    connect,
    state: { connectionStatus },
  } = useXverse();

  const onClick = useCallback(async () => {
    connect({
      message: "Connect to Xverse",
    });
  }, [connect]);
  return (
    <Button variant="contained" color="primary" onClick={onClick}>
      {connectionStatus === AsyncStatus.FULFILLED ? "Connected" : "Connect"}
    </Button>
  );
};
