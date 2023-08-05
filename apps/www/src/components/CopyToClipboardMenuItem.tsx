import { FC, ReactNode, PropsWithChildren, useCallback } from "react";
import {
  Button,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Snackbar,
} from "@mui/material";
import { useState } from "react";
import { useLocale } from "@0xflick/feature-locale";

export const CopyToClipboardMenuItem: FC<
  PropsWithChildren<{
    text: string;
    icon?: ReactNode;
  }>
> = ({ children, text, icon }) => {
  const { t } = useLocale("common");
  const [open, setOpen] = useState(false);
  const handleClick = useCallback(() => {
    setOpen(true);
    if (navigator.share) {
      navigator.share({
        title: t("menu_navigator_share"),
        url: text,
      });
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
  }, [t, text]);
  return (
    <MenuItem onClick={handleClick}>
      {icon && <ListItemIcon>{icon}</ListItemIcon>}
      <ListItemText primary={children} />
      <Snackbar
        open={open}
        onClose={() => setOpen(false)}
        autoHideDuration={2000}
        message={t("copied_to_clipboard")}
      />
    </MenuItem>
  );
};
