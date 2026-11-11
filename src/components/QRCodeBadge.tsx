'use client';

import React, { useMemo, useState } from 'react';
import { generateQRCode } from '@/lib/qr-generator';
import { ShieldCheck, Maximize2, Minimize2, Copy, Check, RefreshCw } from 'lucide-react';

interface QRCodeBadgeProps {
  payload: string;
  pin?: string;
  size?: number;
  label?: string;
  sublabel?: string;
  showPin?: boolean;
  allowZoom?: boolean;
}

export const QRCodeBadge: React.FC<QRCodeBadgeProps> = ({
  payload,
  pin,
  size = 190,
  label = 'Dynamic Boarding Pass',
  sublabel = 'Present to Atharva Cab Driver for contactless boarding',
  showPin = true,
  allowZoom = true,
}) => {
  const [isZoomed, setIsZoomed] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Generate SVG QR Matrix
  const qrData = useMemo(() => {
    return generateQRCode(payload);
  }, [payload]);

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(payload);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      <div className="bg-white border-2 border-slate-900 p-4 shadow-md flex flex-col items-center text-center relative max-w-[280px] w-full">
        
        {/* Top Status Badge */}
        <div className="w-full flex items-center justify-between border-b border-slate-200 pb-2 mb-3">
          <div className="flex items-center space-x-1.5 text-emerald-700">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="text-[11px] font-black uppercase tracking-wider">
              {label}
            </span>
          </div>
          {allowZoom && (
            <button
              onClick={() => setIsZoomed(true)}
              title="Expand QR Code"
              className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* QR Code Container with Center Logo */}
        <div
          className="relative bg-white p-2 border border-slate-200 shadow-inner cursor-pointer group"
          onClick={() => allowZoom && setIsZoomed(true)}
        >
          {/* Render Vector SVG QR Code */}
          <div
            className="transition-transform group-hover:scale-[1.02]"
            style={{ width: size, height: size }}
            dangerouslySetInnerHTML={{ __html: qrData.svg }}
          />

          {/* Center Atharva Branding Shield */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-10 h-10 bg-white border-2 border-slate-900 shadow-md flex items-center justify-center p-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/car-logo.png"
                alt="Atharva"
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
          </div>
        </div>

        {/* Boarding PIN */}
        {showPin && pin && (
          <div className="mt-3 w-full bg-slate-900 text-white py-1.5 px-3 flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-300">
              BOARDING PIN:
            </span>
            <span className="font-mono font-black text-base tracking-widest text-amber-400">
              {pin}
            </span>
          </div>
        )}

        {/* Explanatory Subtext */}
        <p className="mt-2 text-[10px] text-slate-500 leading-tight">
          {sublabel}
        </p>

        {/* Action Bar */}
        <div className="mt-2.5 pt-2 border-t border-slate-100 w-full flex items-center justify-between text-[10px]">
          <span className="flex items-center space-x-1 text-emerald-600 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Encrypted & Verified</span>
          </span>
          <button
            onClick={handleCopy}
            className="text-slate-500 hover:text-blue-600 font-semibold flex items-center space-x-1"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Copied' : 'Copy Payload'}</span>
          </button>
        </div>
      </div>

      {/* Fullscreen Zoom Modal for Drivers / Nighttime */}
      {isZoomed && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4"
          onClick={() => setIsZoomed(false)}
        >
          <div
            className="bg-white p-6 max-w-sm w-full text-center relative border-4 border-slate-900 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-3">
              <div className="text-left">
                <h3 className="font-black text-base text-slate-900 uppercase tracking-wide">
                  High-Contrast Boarding Pass
                </h3>
                <p className="text-xs text-slate-500">Hold up directly to Driver&apos;s Scanner</p>
              </div>
              <button
                onClick={() => setIsZoomed(false)}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800"
              >
                <Minimize2 className="w-5 h-5" />
              </button>
            </div>

            <div className="relative mx-auto bg-white p-3 border-2 border-slate-900 shadow-md inline-block">
              <div
                style={{ width: 260, height: 260 }}
                dangerouslySetInnerHTML={{ __html: qrData.svg }}
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-12 h-12 bg-white border-2 border-slate-900 shadow-md flex items-center justify-center p-1">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/car-logo.png"
                    alt="Atharva"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            </div>

            {pin && (
              <div className="mt-4 bg-slate-900 text-white p-3">
                <span className="text-xs text-slate-300 block mb-0.5">MANUAL BOARDING PIN</span>
                <span className="font-mono text-2xl font-black tracking-widest text-amber-400">
                  {pin}
                </span>
              </div>
            )}

            <p className="text-[11px] text-slate-500 mt-3">
              Tap anywhere outside to close. Tap PIN to provide verbally if driver is using keypad.
            </p>
          </div>
        </div>
      )}
    </>
  );
};
