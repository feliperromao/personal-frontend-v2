import React from "react";
import { Card, CardMedia, CardContent, Typography, Button, Box } from "@mui/material";
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

interface VideoCardProps {
  url: string;
}

const VideoCard: React.FC<VideoCardProps> = ({ url }) => {
  // Determina se a URL é do YouTube, iCloud ou Google Drive
  const isYoutubeUrl = (url: string): boolean => {
    return url.includes('youtube.com') || url.includes('youtu.be');
  };

  const isICloudUrl = (url: string): boolean => {
    return url.includes('icloud.com');
  };

  const isGoogleDriveUrl = (url: string): boolean => {
    return url.includes('drive.google.com') || url.includes('docs.google.com');
  };

  // Extrai o ID do vídeo do YouTube
  const extractYouTubeVideoId = (url: string): string | null => {
    const regex =
      /(?:youtube\.com\/(?:.*v=|.*\/|.*embed\/|.*shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  }

  // Extrai o ID do arquivo do Google Drive
  const extractGoogleDriveFileId = (url: string): string | null => {
    // Para URLs tipo: https://drive.google.com/file/d/{FILE_ID}/view
    let regex = /\/file\/d\/([a-zA-Z0-9_-]+)(?:\/|$)/;
    let match = url.match(regex);
    
    if (match) {
      return match[1];
    }
    
    // Para URLs tipo: https://drive.google.com/open?id={FILE_ID}
    regex = /[?&]id=([a-zA-Z0-9_-]+)(?:&|$)/;
    match = url.match(regex);
    
    return match ? match[1] : null;
  }
  
  // Renderiza o conteúdo com base no tipo de URL
  const renderContent = () => {
    if (isYoutubeUrl(url)) {
      // Para YouTube, usar o embed padrão
      return (
        <CardMedia
          component="iframe"
          height="315"
          src={`https://www.youtube.com/embed/${extractYouTubeVideoId(url)}`}
          allowFullScreen
        />
      );
    } else if (isICloudUrl(url)) {
      // Para iCloud, mostrar uma visualização alternativa com botão
      return (
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Vídeo do iCloud
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            O conteúdo do iCloud não pode ser incorporado diretamente por motivos de segurança.
          </Typography>
          <Box 
            sx={{ 
              bgcolor: '#f5f5f7', 
              p: 2, 
              mb: 2, 
              borderRadius: 1,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '200px',
              border: '1px dashed #ccc',
              backgroundImage: 'url(https://www.apple.com/v/icloud/b/images/overview/icloud_icon__er1ur1j3rqee_large_2x.jpg)',
              backgroundSize: '64px',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center top 30px'
            }}
          >
            <Box textAlign="center" sx={{ mt: 5 }}>
              <Typography variant="body1" gutterBottom sx={{ fontWeight: 'medium', color: '#454545' }}>
                Clique abaixo para visualizar o vídeo
              </Typography>
              <Button
                variant="contained"
                color="primary"
                size="large"
                startIcon={<OpenInNewIcon />}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ mt: 1 }}
              >
                Abrir no iCloud
              </Button>
            </Box>
          </Box>
        </CardContent>
      );
    } else if (isGoogleDriveUrl(url)) {
      // Para Google Drive, usar o embed padrão
      return (
        <CardMedia
          component="iframe"
          height="315"
          src={`https://drive.google.com/file/d/${extractGoogleDriveFileId(url)}/preview`}
          allowFullScreen
        />
      );
    } else {
      // Para URLs não reconhecidas
      return (
        <CardContent>
          <Typography variant="body2" color="error">
            Formato de vídeo não suportado
          </Typography>
          <Box mt={1}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<OpenInNewIcon />}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
            >
              Abrir vídeo
            </Button>
          </Box>
        </CardContent>
      );
    }
  };

  return (
    <Card sx={{ maxWidth: 600, margin: "auto", boxShadow: 3 }}>
      {renderContent()}
    </Card>
  );
};

export default VideoCard;
