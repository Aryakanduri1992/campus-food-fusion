
export interface LocationData {
  address: string;
  city: string;
  pincode: string;
  landmark?: string;
  instructions?: string;
  totalAmount?: number;
  coordinates?: { lat: number; lng: number };
}

export interface PaymentFormState {
  paymentMethod: 'card' | 'upi';
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  nameOnCard: string;
  processingPayment: boolean;
  progressValue: number;
  showDeliveryInfo: boolean;
}

export interface DeliveryPerson {
  name: string;
  phone: string;
  estimatedTime: string;
}
