import React from "react";
import { Card, CardMedia, CardContent, Typography } from "@mui/material";

interface VideoCardProps {
  videoId: string;
}

const VideoCard: React.FC<VideoCardProps> = ({ videoId }) => {
  return (
    <Card sx={{ maxWidth: 600, margin: "auto", boxShadow: 3 }}>
      <CardMedia
        component="iframe"
        height="315"
        src={`https://www.youtube.com/embed/${videoId}`}
        allowFullScreen
      />
    </Card>
  );
};

export default VideoCard;
