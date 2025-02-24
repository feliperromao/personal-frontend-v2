import React from "react";
import { Card, CardMedia, CardContent, Typography } from "@mui/material";

interface VideoCardProps {
  url: string;
}

const VideoCard: React.FC<VideoCardProps> = ({ url }) => {
  const extractYouTubeVideoId = (url: string): string | null => {
    const regex =
      /(?:youtube\.com\/(?:.*v=|.*\/|.*embed\/|.*shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  }
  
  return (
    <Card sx={{ maxWidth: 600, margin: "auto", boxShadow: 3 }}>
      <CardMedia
        component="iframe"
        height="315"
        src={`https://www.youtube.com/embed/${extractYouTubeVideoId(url)}`}
        allowFullScreen
      />
    </Card>
  );
};

export default VideoCard;
