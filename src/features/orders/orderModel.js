const mongoose = require('mongoose');
const Invoice = require('../invoice/invoiceModel');
const Counter = require('./counterModel');

const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  shippingAddress: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    country: { type: String, default: "India" },
  },
  products: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Products', required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
      color: { type: String, required: true },
      size: { type: String, required: true },
    },
  ],
  totalPrice: { type: Number, required: true, min: 0 },
  deliveryCharge: { type: Number },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['Cash on Delivery', 'Online'],
  },
  paymentStatus: {
    type: String,
    required: true,
    enum: ['Pending', 'Paid'],
  },
  TrackId: { type: String },
  status: {
    type: String,
    default: 'Pending',
    enum: [
      'Pending',
      'Processing',
      'In-Transist',
      'Delivered',
      'Cancelled',
      'Returned',
      'ReturnRequested',
      'ReturnApproved',
      'ReturnRejected'
    ],
  },
  isRefunded: { type: Boolean, default: false },
  cancelReason: { type: String, default: null },
  cancelledAt: { type: Date, default: null },
  returnReason: { type: String },
  returnRequestedAt: { type: Date },
  returnRemarks: { type: String },
  deliveryMail: { type: Boolean, default: false },
  dispatchMail: { type: Boolean, default: false },
  discountedAmount: { type: Number },
  finalPayableAmount: { type: Number },
  coupen: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon' },
  deliveryDate: {
    type: Date,
    validate: {
      validator: function (value) {
        return value >= this.createdAt;
      },
      message: 'Delivery date cannot be before order creation date.',
    },
  },
}, { timestamps: true });

// Pre-validate hook to auto-generate orderId
orderSchema.pre("validate", async function (next) {
  if (!this.orderId) {
    try {
      const counter = await Counter.findOneAndUpdate(
        { _id: "orderId" },
        { $inc: { sequenceValue: 1 } },
        { new: true, upsert: true }
      );
      const formattedNumber = String(counter.sequenceValue).padStart(3, '0');
      this.orderId = `BT${formattedNumber}`;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Function to generate unique invoice number
const generateUniqueInvoiceNumber = async () => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const nextYear = currentYear + 1;
  const startYearShort = now.getMonth() + 1 >= 4 ? String(currentYear).slice(2) : String(currentYear - 1).slice(2);
  const endYearShort = now.getMonth() + 1 >= 4 ? String(nextYear).slice(2) : String(currentYear).slice(2);
  const counterId = `invoice_${startYearShort}`;
  const prefix = `BTO-${startYearShort}`;
  const serialYear = endYearShort;

  const counter = await Counter.findOneAndUpdate(
    { _id: counterId },
    { $inc: { sequenceValue: 1 } },
    { new: true, upsert: true }
  );

  const formattedSerial = `${serialYear}${String(counter.sequenceValue).padStart(3, '0')}`;
  return `${prefix}/${formattedSerial}`;
};

// Invoice creation function to be called manually from controller
const createInvoiceForOrder = async (orderId) => {
  try {
    const updatedOrder = await Order.findById(orderId)
      .populate('userId', 'name phone')
      .lean();

    if (!updatedOrder) return;

    const existingInvoice = await Invoice.findOne({ order_id: updatedOrder._id });
    if (existingInvoice) return;

    const uniqueInvoiceNumber = await generateUniqueInvoiceNumber();

    const invoice = new Invoice({
      invoice_Number: uniqueInvoiceNumber,
      userId: updatedOrder.userId._id,
      order_id: updatedOrder._id,
      customerName: updatedOrder.userId.name,
      customerMobile: updatedOrder.shippingAddress?.phone || updatedOrder.userId?.phone,
      address: updatedOrder.shippingAddress,
      products: updatedOrder.products.map(p => ({
        productId: p.productId,
        size: p.size,
        price: p.price,
        quantity: p.quantity,
      })),
      SubTotalAmount: updatedOrder.totalPrice,
      Delivery_Charge: updatedOrder.deliveryCharge,
      Discounted_Amount: updatedOrder.discountedAmount,
      totalAmount: updatedOrder.finalPayableAmount,
      payment_method: updatedOrder.paymentMethod,
      status: updatedOrder.paymentStatus,
    });

    await invoice.save();
    console.log(`✅ Invoice created for Order ID: ${updatedOrder._id}`);
  } catch (error) {
    console.error(`❌ Error creating invoice:`, error);
  }
};

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;

// Export helper to call from controller
module.exports.createInvoiceForOrder = createInvoiceForOrder;
