import { FC, useMemo } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Typography from "@mui/material/Typography";

import { useAuth } from "@/features/auth";
import { canSeeAdminPanel } from "@/features/auth/matchers";
import { useCollections } from "../hooks/useCollections";
import { CollectionsList } from "./CollectionsList";

const NotAdminPanelContent: FC<{}> = ({}) => (
  <Card sx={{ flexGrow: 1 }}>
    <CardHeader title="Collections" />
    <CardContent>
      <Typography variant="body1">
        You are not authorized to see this content.
      </Typography>
    </CardContent>
  </Card>
);

export const Panel: FC<{}> = ({}) => {
  const { allowedActions } = useAuth();
  const isAdmin = useMemo(
    () => canSeeAdminPanel(allowedActions),
    [allowedActions]
  );
  const {
    data: collections,
    loading: collectionsLoading,
    error: collectionsError,
  } = useCollections();

  if (!isAdmin) {
    return <NotAdminPanelContent />;
  }
  return (
    <Card sx={{ flexGrow: 1 }}>
      <CardHeader title="Collections" />
      <CardContent>
        <CollectionsList
          isLoading={collectionsLoading}
          error={collectionsError}
          collections={collections}
        />
      </CardContent>
    </Card>
  );
};
