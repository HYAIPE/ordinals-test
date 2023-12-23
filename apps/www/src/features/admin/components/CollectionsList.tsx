import { FC, useMemo } from "react";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import Paper from "@mui/material/Paper";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemButton from "@mui/material/ListItemButton";
import CircularProgress from "@mui/material/CircularProgress";
import { TCollection } from "../hooks/useCollections";

export const CollectionsList: FC<{
  isLoading?: boolean;
  error?: Error;
  collections?: TCollection[];
}> = ({ isLoading = false, error, collections }) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      {isLoading && (
        <Paper sx={{ flexGrow: 1 }}>
          <CircularProgress />
        </Paper>
      )}
      {error && (
        <Paper sx={{ flexGrow: 1 }}>
          <Box sx={{ p: 2 }}>{error.message}</Box>
        </Paper>
      )}
      {!isLoading && !error && (
        <Paper sx={{ flexGrow: 1 }}>
          <List sx={{ overflow: "auto" }}>
            {collections?.map((collection) => (
              <ListItem key={collection.id}>
                <ListItemButton>
                  <ListItemText primary={collection.name} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
};
