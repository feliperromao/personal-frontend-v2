import { Card, CardActionArea, CardContent, CardMedia, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { ReactNode } from "react";

interface PageCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  image?: string;
  link: string;
}

const PageCard: React.FC<PageCardProps> = ({ title, description, icon, image, link }) => {
  return (
    <Card sx={{ maxWidth: 250, m: 2 }}>
      <CardActionArea component={Link} to={link} sx={{ textDecoration: "none" }}>
        {image && (<CardMedia component="img" height="140" image={image} alt={title} />)}
        <CardContent>
          <Typography variant="h5" component="div" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {icon} {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default PageCard;
