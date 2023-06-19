import { FC, ReactNode } from "react";
import { AppBar as MuiAppBar, Toolbar, Box } from "@mui/material";

export const AppBar: FC<{
  title?: ReactNode;
}> = ({ title }) => {
  return (
    <>
      <MuiAppBar color="default">
        <Toolbar>
          {title}
          <Box sx={{ flexGrow: 1 }} component="span" />
        </Toolbar>
      </MuiAppBar>
    </>
  );
};
