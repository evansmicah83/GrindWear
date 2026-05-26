import type { Order, Address } from '../types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

interface PaymentDetails {
  method: 'mpesa' | 'card' | 'cash';
  phoneNumber?: string;
  cardNumber?: string;
  cardExpiry?: string;
  cardCVV?: string;
}

interface OrderDatabase {
  orders: Order[];
  payments: Array<{
    orderId: string;
    amount: number;
    status: 'pending' | 'completed' | 'failed';
    method: string;
    transactionId: string;
    timestamp: string;
  }>;
}

const database: OrderDatabase = {
  orders: [],
  payments: []
};

export const backendEmulator = {
  async processPayment(paymentDetails: PaymentDetails, amount: number): Promise<{
    success: boolean;
    transactionId?: string;
    error?: string;
  }> {
    console.log('[Backend] Processing payment...', { method: paymentDetails.method, amount });
    await delay(2000);

    if (paymentDetails.method === 'mpesa') {
      if (!paymentDetails.phoneNumber || paymentDetails.phoneNumber.length < 10) {
        return { success: false, error: 'Invalid phone number' };
      }

      const transactionId = `MPESA${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      console.log('[Backend] M-Pesa payment initiated');
      await delay(1500);

      console.log('[Backend] M-Pesa payment confirmed');

      return {
        success: true,
        transactionId
      };
    }

    if (paymentDetails.method === 'card') {
      if (!paymentDetails.cardNumber || !paymentDetails.cardExpiry || !paymentDetails.cardCVV) {
        return { success: false, error: 'Invalid card details' };
      }

      const transactionId = `CARD${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      console.log('[Backend] Card payment processing...');
      await delay(1500);

      console.log('[Backend] Card payment approved');

      return {
        success: true,
        transactionId
      };
    }

    if (paymentDetails.method === 'cash') {
      const transactionId = `CASH${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      return {
        success: true,
        transactionId
      };
    }

    return { success: false, error: 'Invalid payment method' };
  },

  async createOrder(orderData: {
    items: any[];
    total: number;
    shippingAddress: Address;
    paymentDetails: PaymentDetails;
  }): Promise<{ success: boolean; order?: Order; error?: string }> {
    console.log('[Backend] Creating order...', orderData);
    await delay(1000);

    const paymentResult = await this.processPayment(orderData.paymentDetails, orderData.total);

    if (!paymentResult.success) {
      return { success: false, error: paymentResult.error };
    }

    const order: Order = {
      id: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      userId: '1',
      items: orderData.items,
      total: orderData.total,
      status: 'pending',
      shippingAddress: orderData.shippingAddress,
      paymentMethod: orderData.paymentDetails.method,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    database.orders.push(order);
    database.payments.push({
      orderId: order.id,
      amount: orderData.total,
      status: 'completed',
      method: orderData.paymentDetails.method,
      transactionId: paymentResult.transactionId!,
      timestamp: new Date().toISOString()
    });

    console.log('[Backend] Order created successfully:', order.id);
    console.log('[Backend] Database state:', {
      totalOrders: database.orders.length,
      totalPayments: database.payments.length
    });

    setTimeout(() => {
      this.updateOrderStatus(order.id, 'processing');
    }, 3000);

    return { success: true, order };
  },

  async updateOrderStatus(orderId: string, status: Order['status']): Promise<void> {
    console.log(`[Backend] Updating order ${orderId} status to ${status}`);
    await delay(500);

    const order = database.orders.find(o => o.id === orderId);
    if (order) {
      order.status = status;
      order.updatedAt = new Date().toISOString();
      console.log(`[Backend] Order ${orderId} updated to ${status}`);
    }
  },

  async getOrder(orderId: string): Promise<Order | null> {
    console.log(`[Backend] Fetching order ${orderId}`);
    await delay(600);

    const order = database.orders.find(o => o.id === orderId);
    return order || null;
  },

  async getUserOrders(userId: string): Promise<Order[]> {
    console.log(`[Backend] Fetching orders for user ${userId}`);
    await delay(700);

    return database.orders.filter(o => o.userId === userId);
  },

  async validateMpesaNumber(phoneNumber: string): Promise<{ valid: boolean; message?: string }> {
    await delay(800);

    const cleaned = phoneNumber.replace(/\D/g, '');

    if (cleaned.length < 10) {
      return { valid: false, message: 'Phone number too short' };
    }

    if (cleaned.length > 13) {
      return { valid: false, message: 'Phone number too long' };
    }

    if (!cleaned.startsWith('254') && !cleaned.startsWith('0')) {
      return { valid: false, message: 'Invalid phone number format' };
    }

    return { valid: true };
  },

  getDatabaseStats() {
    return {
      orders: database.orders.length,
      payments: database.payments.length,
      totalRevenue: database.payments
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + p.amount, 0)
    };
  }
};
