import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ size = 'lg', text = 'Carregando...', className = '' }) => {
  let iconSize = 'h-8 w-8';
  let textSize = 'text-lg';

  switch (size) {
    case 'sm':
      iconSize = 'h-4 w-4';
      textSize = 'text-sm';
      break;
    case 'md':
      iconSize = 'h-6 w-6';
      textSize = 'text-base';
      break;
    case 'lg':
    default:
      iconSize = 'h-8 w-8';
      textSize = 'text-lg';
      break;
  }

  return (
    <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
      <Loader2 className={`${iconSize} animate-spin text-blue-600`} />
      <p className={`mt-3 font-medium text-gray-600 ${textSize}`}>{text}</p>
    </div>
  );
};

export default LoadingSpinner;
