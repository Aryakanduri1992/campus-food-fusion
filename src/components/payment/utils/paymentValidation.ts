
export const formatCardNumber = (value: string): string => {
  const val = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
  const matches = val.match(/\d{4,16}/g);
  const match = matches && matches[0] || '';
  const parts = [];
  
  for (let i = 0, len = match.length; i < len; i += 4) {
    parts.push(match.substring(i, i + 4));
  }
  
  return parts.length ? parts.join(' ') : value;
};

export const formatExpiryDate = (value: string): string => {
  const numericValue = value.replace(/\D/g, '');
  if (numericValue.length <= 2) return numericValue;
  
  const month = numericValue.substring(0, 2);
  const year = numericValue.substring(2, 4);
  return `${month}/${year}`;
};

export const validatePaymentFields = (
  paymentMethod: 'card' | 'upi',
  cardDetails: {
    cardNumber: string;
    expiryDate: string;
    cvv: string;
    nameOnCard: string;
  }
): boolean => {
  if (paymentMethod === 'card' && (!cardDetails.cardNumber || !cardDetails.expiryDate || !cardDetails.cvv || !cardDetails.nameOnCard)) {
    return false;
  }
  return true;
};
