import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const MAX_AMOUNT_INR = 500000; // Razorpay test mode limit: ₹5,00,000

export const PaymentsService = {
  createRazorpayOrder: async (amount) => {
    if (!amount) throw new Error('Amount is required');

    // Cap amount for Razorpay test mode (max ₹5,00,000)
    const cappedAmount = Math.min(Number(amount), MAX_AMOUNT_INR);

    const options = {
      amount: Math.round(cappedAmount * 100), // amount in paise
      currency: 'INR',
      receipt: `sr_order_${Date.now()}`,
    };
    const order = await razorpay.orders.create(options);
    return order;
  },
};
