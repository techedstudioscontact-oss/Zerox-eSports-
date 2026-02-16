import React, { useState } from 'react';
import { X, Lock, ShieldCheck, CheckCircle } from 'lucide-react';
import { CURRENCY_SYMBOL, UROPAY_KEY_ID, UROPAY_BUTTON_ID_9, UROPAY_BUTTON_ID_500 } from '../constants';
import { getSessionUser } from '../services/authService';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  title: string;
  description: string;
  benefits: string[];
  onConfirm: () => Promise<void>;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen, onClose, amount, title, description, benefits, onConfirm
}) => {
  const [isSuccess, setIsSuccess] = useState(false);

  // Uropay Button Integration
  // Map amount to specific Button ID provided by user
  const buttonId = amount === 500 ? UROPAY_BUTTON_ID_500 : UROPAY_BUTTON_ID_9;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-surface border border-white/10 shadow-2xl animate-float">

        {/* Close Button */}
        {!isSuccess && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 text-gray-400 hover:text-white"
          >
            <X className="h-6 w-6" />
          </button>
        )}

        {/* Content */}
        <div className="p-8 flex flex-col items-center text-center">
          {isSuccess ? (
            <div className="py-10 flex flex-col items-center animate-pulse-slow">
              <CheckCircle className="h-20 w-20 text-green-500 mb-4" />
              <h3 className="text-2xl font-bold text-white">Payment Successful!</h3>
              <p className="text-gray-400 mt-2">Content Unlocked.</p>
            </div>
          ) : (
            <>
              <div className="mb-6 rounded-full bg-gradient-to-br from-purple-900 to-black p-4 border border-purple-500/30 shadow-[0_0_30px_rgba(168,85,247,0.2)]">
                {amount === 9 ? <Lock className="h-10 w-10 text-primary" /> : <ShieldCheck className="h-10 w-10 text-accent" />}
              </div>

              <h2 className="mb-2 text-2xl font-bold text-white">{title}</h2>
              <p className="mb-6 text-gray-400">{description}</p>

              <div className="mb-8 w-full rounded-xl bg-white/5 p-4 text-left">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Includes:</p>
                <ul className="space-y-2">
                  {benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-gray-300">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mb-6 flex w-full items-baseline justify-between border-t border-white/10 pt-4">
                <span className="text-sm text-gray-400">Total</span>
                <span className="text-3xl font-bold text-white">{CURRENCY_SYMBOL}{amount}</span>
              </div>

              {/* UROPAY EMBED BUTTON */}
              {/* This link is transformed by uropay-embed.min.js */}
              <div className="w-full relative group">
                <a
                  href="#"
                  className="uropay-btn block w-full py-4 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-all text-center uppercase tracking-widest shadow-[0_0_20px_rgba(217,70,239,0.4)]"
                  data-uropay-api-key={UROPAY_KEY_ID}
                  data-uropay-button-id={buttonId}
                  data-uropay-environment="LIVE"
                  data-uropay-amount={amount}
                >
                  PAY {CURRENCY_SYMBOL}{amount} NOW
                </a>

                <p className="mt-4 text-[10px] text-gray-500 max-w-xs mx-auto">
                  Secure Payment via Uropay. Click above to open gateway.
                </p>
              </div>

              {/* Fallback Manual Verification (Since Embed might not callback) */}
              <button
                onClick={async () => {
                  setIsSuccess(true);
                  await onConfirm();
                  setTimeout(() => onClose(), 2000);
                }}
                className="mt-6 text-xs text-gray-600 underline hover:text-white opacity-50 hover:opacity-100 transition-opacity"
              >
                I have completed the payment manually
              </button>

            </>
          )}
        </div>
      </div>
    </div>
  );
};