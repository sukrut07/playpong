import React from 'react';
import { RouterProvider } from './router';

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <RouterProvider>{children}</RouterProvider>;
};
