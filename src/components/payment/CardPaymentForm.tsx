
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface CardPaymentFormProps {
  nameOnCard: string;
  setNameOnCard: (value: string) => void;
  cardNumber: string;
  handleCardNumberChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  expiryDate: string;
  handleExpiryDateChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  cvv: string;
  setCvv: (value: string) => void;
}

const CardPaymentForm: React.FC<CardPaymentFormProps> = ({
  nameOnCard,
  setNameOnCard,
  cardNumber,
  handleCardNumberChange,
  expiryDate,
  handleExpiryDateChange,
  cvv,
  setCvv
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="nameOnCard">Name on Card</Label>
        <Input
          id="nameOnCard"
          placeholder="John Doe"
          value={nameOnCard}
          onChange={(e) => setNameOnCard(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="cardNumber">Card Number</Label>
        <Input
          id="cardNumber"
          placeholder="0000 0000 0000 0000"
          value={cardNumber}
          onChange={handleCardNumberChange}
          maxLength={19}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="expiryDate">Expiry Date</Label>
          <Input
            id="expiryDate"
            placeholder="MM/YY"
            value={expiryDate}
            onChange={handleExpiryDateChange}
            maxLength={5}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cvv">CVV</Label>
          <Input
            id="cvv"
            placeholder="123"
            value={cvv}
            onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
            maxLength={3}
            type="password"
          />
        </div>
      </div>
    </div>
  );
};

export default CardPaymentForm;
