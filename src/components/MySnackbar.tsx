import * as React from 'react';
import { enqueueSnackbar, SnackbarProvider, } from 'notistack';

export enum SNACKBAR_TYPES {
  error = "error",
  default = "default",
  success = "success",
  warning = "warning",
  info = "info",
}

export const handleOpenNotification = (message: string, variant: SNACKBAR_TYPES | undefined) => {
  if (variant) {
    enqueueSnackbar(message, { variant: variant });
    return
  }
  enqueueSnackbar(message);
};

export default function MySnackbar() {
  return (
    <SnackbarProvider autoHideDuration={3000} maxSnack={3}>
    </SnackbarProvider>
  );
}