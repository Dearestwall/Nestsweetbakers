export interface Cake {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  imageUrl: string;
  category: string;
  orderCount: number;
  variants?: Array<{
    size: string;
    price: number;
  }>;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryPincode: string;
  items: Array<{
    cakeId: string;
    cakeName: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'baking' | 'out-for-delivery' | 'delivered';
  paymentMethod: 'cod' | 'whatsapp';
  createdAt: string;
  updatedAt: string;
}
