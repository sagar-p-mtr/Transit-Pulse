import React from 'react';
import { Toaster } from 'react-hot-toast';

const Toast: React.FC = () => {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      containerClassName=""
      containerStyle={{}}
      toastOptions={{
        // Default options for all toasts
        duration: 5000,
        style: {
          background: '#363636',
          color: '#fff',
          borderRadius: '8px',
          padding: '12px 16px',
          fontSize: '14px',
        },
        
        // Specific options for each toast type
        success: {
          duration: 4000,
          style: {
            background: '#10b981',
            color: 'white',
          },
          iconTheme: {
            primary: 'white',
            secondary: '#10b981',
          },
        },
        
        error: {
          duration: 6000,
          style: {
            background: '#ef4444',
            color: 'white',
          },
          iconTheme: {
            primary: 'white',
            secondary: '#ef4444',
          },
        },
        
        loading: {
          style: {
            background: '#3b82f6',
            color: 'white',
          },
          iconTheme: {
            primary: 'white',
            secondary: '#3b82f6',
          },
        },
        
        custom: {
          duration: 5000,
        },
      }}
    />
  );
};

export default Toast;
