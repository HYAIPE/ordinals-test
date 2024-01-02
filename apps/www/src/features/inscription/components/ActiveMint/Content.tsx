import { FC, useState } from "react";
import Avatar from "@mui/material/Avatar";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import IconButton from "@mui/material/IconButton";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import { ListAvailableFundingsQueryData } from "./types";
import { AvatarUnrevealed } from "../AvatarUnrevealed";
import { PaymentModal } from "../PaymentModal";

export const Content: FC<{
  fundings?: ListAvailableFundingsQueryData[];
}> = ({ fundings }) => {
  const [selectedIndex, setSelectedIndex] = useState<null | number>(null);

  return (
    <>
      <List sx={{ width: "100%", bgcolor: "background.paper" }}>
        {fundings?.map((funding, i) => (
          <ListItem
            key={funding.id}
            secondaryAction={
              <IconButton
                edge="end"
                aria-label="send"
                onClick={() => setSelectedIndex(i)}
              >
                <FileUploadIcon />
              </IconButton>
            }
          >
            <ListItemAvatar>
              <Avatar sx={{ width: 64, height: 64 }}>
                <AvatarUnrevealed />
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={funding.destinationAddress}
              primaryTypographyProps={{
                noWrap: true,
              }}
              sx={{
                ml: 2,
              }}
            />
          </ListItem>
        ))}
      </List>
      <PaymentModal
        open={selectedIndex !== null}
        handleClose={() => setSelectedIndex(null)}
        handleConfirm={() => {
          // TODO
        }}
        qrSrc={
          selectedIndex !== null ? fundings?.[selectedIndex].funding?.qrSrc : ""
        }
        paymentAddress={
          selectedIndex !== null
            ? fundings?.[selectedIndex].funding?.fundingAddress
            : ""
        }
        paymentAmount={
          selectedIndex !== null
            ? fundings?.[selectedIndex].funding?.fundingAmountBtc
            : "0"
        }
        paymentAmountSats={
          selectedIndex !== null
            ? fundings?.[selectedIndex].funding?.fundingAmountSats
            : 0
        }
      />
    </>
  );
};
