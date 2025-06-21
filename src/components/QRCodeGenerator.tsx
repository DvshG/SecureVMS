import React from 'react';
import QRCode from 'qrcode';
import { useState, useEffect } from 'react';

interface QRCodeGeneratorProps {
  data: string;
  size?: number;
  className?: string;
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({ 
  data, 
  size = 200, 
  className = '' 
}) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  useEffect(() => {
    const generateQR = async () => {
      try {
        const url = await QRCode.toDataURL(data, {
          width: size,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
        setQrCodeUrl(url);
      } catch (error) {
        console.error('Error generating QR code:', error);
      }
    };

    if (data) {
      generateQR();
    }
  }, [data, size]);

  if (!qrCodeUrl) {
    return (
      <div 
        className={`bg-gray-200 flex items-center justify-center ${className}`}
        style={{ width: size, height: size }}
      >
        <span className="text-gray-500 text-sm">Generating QR...</span>
      </div>
    );
  }

  return (
    <img 
      src={qrCodeUrl} 
      alt="QR Code" 
      className={className}
      style={{ width: size, height: size }}
    />
  );
};

export default QRCodeGenerator;