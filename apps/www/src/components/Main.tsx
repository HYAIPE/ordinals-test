"use client";

import { FC, PropsWithChildren, ReactNode } from "react";
import { Box, Toolbar } from "@mui/material";
import { AppBar } from "./AppBar";

export const Main: FC<
  PropsWithChildren<{
    title?: ReactNode;
  }>
> = ({ children, title }) => {
  return (
    <>
      <AppBar title={title} />
      <Box
        component="main"
        display="flex"
        sx={{ flexFlow: "column", height: "100%" }}
      >
        <Toolbar sx={{ flex: "0 1 auto" }} />
        <Box component="div" display="flex" sx={{ flex: "1 1 auto" }}>
          {children}
        </Box>
      </Box>
    </>
  );
};
