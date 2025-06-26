const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Products',
        required: true
      },
      quantity: {
        type: Number,
        required: true,
        min: 1
      },
      price: {
        type: Number,
        required: true
      },
      color: {
        type: String,
        required: true
      },
      size: {
        type: String,
        required: true
      }
    }
  ],
  totalPrice: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// ✅ Always recalculate totalPrice before saving
cartSchema.pre('save', function (next) {
  if (!this.items || this.items.length === 0) {
    this.totalPrice = 0;
  } else {
    this.totalPrice = this.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  }
  next();
});

module.exports = mongoose.model('Cart', cartSchema);
