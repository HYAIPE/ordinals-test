import { FC } from "react";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import CheckIcon from "@mui/icons-material/CheckBoxOutlined";
import CrossIcon from "@mui/icons-material/CancelOutlined";
import NextImage from "next/image";

const RUG = "/images/rug.jpg";

export const AgreementModal: FC<{
  onClose: () => void;
  onAgree: () => void;
}> = ({ onAgree, onClose }) => {
  return (
    <Card>
      <CardHeader title="agreement" />
      <CardMedia component={NextImage} height="372" image={RUG} alt="" />
      <CardContent>
        <Typography variant="body2" color="text.secondary">
          before inscribing you agree this is a rug.
        </Typography>
      </CardContent>
      <CardActions>
        <Button size="small" endIcon={<CheckIcon />} onClick={onAgree}>
          agree
        </Button>
        <Button size="small" endIcon={<CrossIcon />} onClick={onClose}>
          disagree
        </Button>
      </CardActions>
    </Card>
  );
};
