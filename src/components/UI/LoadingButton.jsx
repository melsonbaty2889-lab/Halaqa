import React from 'react';
import Btn from './Btn';

export default function LoadingButton({ 
  children, 
  isLoading = false, 
  loading = false,
  variant = 'primary', 
  size = 'md',
  fullWidth = false,
  ...restProps 
}) {
  return (
    <Btn
      isLoading={isLoading || loading}
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      {...restProps}
    >
      {children}
    </Btn>
  );
}
