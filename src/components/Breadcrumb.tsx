import { Breadcrumbs, Link, Typography } from "@mui/material";

interface BreadcrumbProps {
  uri: string;
  title: string
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ uri, title }) => {
  return (
    <Breadcrumbs aria-label="breadcrumb">
      <Link underline="hover" color="inherit" href="/">
        personal
      </Link>
      <Link underline="hover" color="inherit" href={`/${uri}`}>
        <Typography sx={{ color: 'text.primary' }}>{title}</Typography>
      </Link>
    </Breadcrumbs>
  )
}

export default Breadcrumb;