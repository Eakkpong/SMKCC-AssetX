'use client';

import React, { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';

interface SignaturePadProps {
  onSave: (signatureData: string) => void;
  onCancel: () => void;
  title: string;
}

export default function SignaturePad({ onSave, onCancel, title }: SignaturePadProps) {
  const sigCanvas = useRef<SignatureCanvas>(null);
  const [error, setError] = useState('');

  const handleSave = () => {
    if (sigCanvas.current?.isEmpty()) {
      setError('กรุณาวาดลายเซ็นก่อนบันทึก');
      return;
    }
    // Get base64 PNG
    const dataURL = sigCanvas.current?.getTrimmedCanvas().toDataURL('image/png');
    if (dataURL) {
      onSave(dataURL);
    }
  };

  const handleClear = () => {
    sigCanvas.current?.clear();
    setError('');
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200 max-w-2xl w-full mx-auto">
      <h3 className="text-xl font-bold text-gray-800 mb-4">{title}</h3>
      
      <div className="border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 mb-4 overflow-hidden" style={{ touchAction: 'none' }}>
        <SignatureCanvas
          ref={sigCanvas}
          canvasProps={{
            className: 'w-full h-64 md:h-80 cursor-crosshair',
          }}
          backgroundColor="rgba(0,0,0,0)"
          penColor="blue"
        />
      </div>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      <div className="flex justify-between items-center">
        <button 
          type="button" 
          onClick={handleClear} 
          className="text-sm text-gray-500 hover:text-gray-700 font-medium px-4 py-2"
        >
          ล้างลายเซ็น (Clear)
        </button>
        
        <div className="flex space-x-3">
          <button 
            type="button" 
            onClick={onCancel} 
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 font-medium transition"
          >
            ยกเลิก
          </button>
          <button 
            type="button" 
            onClick={handleSave} 
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium transition shadow-sm"
          >
            บันทึกลายเซ็น
          </button>
        </div>
      </div>
    </div>
  );
}
