// Load environment variables first
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const Razorpay = require('razorpay');

// Add debug logs to check if env vars are loaded
console.log('RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID ? 'Loaded' : 'Not loaded');
console.log('RAZORPAY_KEY_SECRET:', process.env.RAZORPAY_KEY_SECRET ? 'Loaded' : 'Not loaded');

// Create and configure Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Test the Razorpay instance
console.log('Razorpay instance created successfully:', !!razorpay);

module.exports = {
  instance: razorpay,
  createOrder: async (options) => {
    try {
      console.log('Creating Razorpay order with options:', options);
      const order = await razorpay.orders.create(options);
      console.log('Razorpay order created:', { orderId: order.id });
      return order;
    } catch (error) {
      console.error('Error creating Razorpay order:', error);
      throw error;
    }
  }
};