import { Grid } from '@mui/material'
import React, { ReactNode } from 'react'

interface ContainerProps {
  children: ReactNode,
  spacing?: number,
  mt?: number,
}

export const Container: React.FC<ContainerProps> = ({ children, spacing, mt }) => {
  return <Grid
    container
    spacing={spacing ?? 0}
    mt={mt}
  >{children}</Grid>
}

interface RowProps {
  children: ReactNode,
  xs?: number,
  md?: number,
  sm?: number,
}

export const Row: React.FC<RowProps> = ({ children, xs, md, sm }) => {
  return <Grid
    item
    sm={sm ?? 12}
    xs={xs ?? 12}
    md={md ?? 12}
  >{children}</Grid>
}