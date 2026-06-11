import React, { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { CreditCard, ShieldCheck } from 'lucide-react';

export interface CardDetails {
  cardNumber: string;
  expiry: string;
  cvc: string;
}

interface CardFormProps {
  onChange: (details: CardDetails, isValid: boolean) => void;
  error?: string;
}

export default function CardForm({ onChange, error }: CardFormProps) {
  const [cardDetails, setCardDetails] = useState<CardDetails>({
    cardNumber: '',
    expiry: '',
    cvc: '',
  });

  const [localErrors, setLocalErrors] = useState<Partial<CardDetails>>({});
  const [cardType, setCardType] = useState<'visa' | 'mastercard' | 'amex' | 'unknown'>('unknown');

  // Detect card brand based on initial numbers
  const detectCardType = (num: string) => {
    const cleanNum = num.replace(/\s+/g, '');
    if (cleanNum.startsWith('4')) return 'visa';
    if (/^5[1-5]/.test(cleanNum)) return 'mastercard';
    if (/^3[47]/.test(cleanNum)) return 'amex';
    return 'unknown';
  };

  // Format Card Number (adds spaces every 4 characters)
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = input.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardType(detectCardType(input));

    const newDetails = { ...cardDetails, cardNumber: formatted };
    setCardDetails(newDetails);
    validate(newDetails);
  };

  // Format Expiry Date (MM/YY)
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (input.length > 2) {
      input = `${input.slice(0, 2)}/${input.slice(2)}`;
    }
    const newDetails = { ...cardDetails, expiry: input };
    setCardDetails(newDetails);
    validate(newDetails);
  };

  // Format CVC
  const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value.replace(/\D/g, '').slice(0, 3);
    const newDetails = { ...cardDetails, cvc: input };
    setCardDetails(newDetails);
    validate(newDetails);
  };

  const validate = (details: CardDetails) => {
    const errors: Partial<CardDetails> = {};
    const cleanCard = details.cardNumber.replace(/\s+/g, '');

    if (cleanCard.length > 0 && cleanCard.length < 16) {
      errors.cardNumber = 'Card number must be 16 digits';
    }

    if (details.expiry.length > 0) {
      const parts = details.expiry.split('/');
      if (parts.length === 2) {
        const month = parseInt(parts[0], 10);
        const year = parseInt(parts[1], 10);
        const currentYear = new Date().getFullYear() % 100;
        const currentMonth = new Date().getMonth() + 1;

        if (month < 1 || month > 12) {
          errors.expiry = 'Invalid month';
        } else if (year < currentYear || (year === currentYear && month < currentMonth)) {
          errors.expiry = 'Card has expired';
        }
      } else {
        errors.expiry = 'Format MM/YY';
      }
    }

    if (details.cvc.length > 0 && details.cvc.length < 3) {
      errors.cvc = 'CVC must be 3 digits';
    }

    setLocalErrors(errors);

    // Form is valid if all fields have values and no errors exist
    const isCompleted = cleanCard.length === 16 && details.expiry.length === 5 && details.cvc.length === 3;
    const hasNoErrors = Object.keys(errors).length === 0;

    onChange(details, isCompleted && hasNoErrors);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center pb-2 border-b border-purple-900/10">
        <span className="text-sm font-semibold text-white flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-primary-400" /> Credit Card Details
        </span>
        <span className="text-xs text-emerald-400 flex items-center gap-1">
          <ShieldCheck className="h-3.5 w-3.5" /> PCI-Compliant
        </span>
      </div>

      <div className="relative">
        <Input
          label="Card Number"
          placeholder="4242 4242 4242 4242"
          value={cardDetails.cardNumber}
          onChange={handleCardNumberChange}
          error={localErrors.cardNumber || error}
          className="pr-12 font-mono"
        />
        {/* Dynamic Card Icon */}
        <div className="absolute right-4 top-[38px] text-gray-500 font-bold text-xs uppercase select-none tracking-wider">
          {cardType === 'visa' && <span className="text-blue-400">Visa</span>}
          {cardType === 'mastercard' && <span className="text-orange-400">MC</span>}
          {cardType === 'amex' && <span className="text-cyan-400">AMEX</span>}
          {cardType === 'unknown' && <CreditCard className="h-5 w-5 text-gray-600" />}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Expiration Date"
          placeholder="MM/YY"
          value={cardDetails.expiry}
          onChange={handleExpiryChange}
          error={localErrors.expiry}
          className="font-mono text-center"
        />
        <Input
          label="CVC / CVV"
          placeholder="123"
          type="password"
          value={cardDetails.cvc}
          onChange={handleCvcChange}
          error={localErrors.cvc}
          className="font-mono text-center"
        />
      </div>
    </div>
  );
}
