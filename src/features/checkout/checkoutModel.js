const mongoose = require('mongoose');

const checkoutSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  cartId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Cart', 
  },
  cartItems: [{
    productId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Products', 
      required: true 
    },
    quantity: { 
      type: Number, 
      required: true 
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
    },
  }],
  totalPrice: { 
    type: Number, 
    required: true 
  },
  discountedPrice:{
    type: Number,
  },
  expiresAt: { 
    type: Date, 
    default: function () {
      return new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // Set expiry 3 days later
    },
    index: { expires: 0 } // TTL index
  }
},
    {
    timestamps: true,
  });

const Checkout = mongoose.model('Checkout', checkoutSchema);

module.exports = Checkout;
