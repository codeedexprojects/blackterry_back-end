const Checkout = require('./checkoutModel');
const Address = require('.././address/addressModel');
const Cart = require('.././cart/cartModel');
const Product = require('.././product/productModel'); 
// const { checkout } = require('../../../Routes/Admin/Invoice/invoiceRoute');

// Create Checkout
exports.createCheckout = async (req, res) => {
  const { userId, addressId } = req.body;

  try {
    const cart = await Cart.findOne({ userId }).populate({
      path: "items.productId",
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty or not found" });
    }

    const address = await Address.findById(addressId);
    if (!address || address.userId.toString() !== userId) {
      return res.status(404).json({ message: "Invalid shipping address" });
    }

    let actualTotal = 0;

    const cartItems = cart.items.map((item) => {
      const actualPrice = item.productId.actualPrice || 0;
      const offerPrice = item.price || 0;

      actualTotal += actualPrice * item.quantity;

      return {
        productId: item.productId._id,
        quantity: item.quantity,
        price: offerPrice,
        color: item.color,
        size: item.size,
      };
    });

    const discountedPrice = actualTotal - cart.totalPrice;

    const checkout = new Checkout({
      userId,
      cartId: cart._id,
      cartItems,
      addressId: address._id,
      totalPrice: cart.totalPrice,
      discountedPrice, 
    });

    await checkout.save();

    res.status(201).json({
      message: "Checkout created successfully",
      checkout: {
        totalPrice: checkout.totalPrice,
        discountedPrice: checkout.discountedPrice,
      },
      checkoutId: checkout._id,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};






// Get Checkout by ID
exports.getCheckoutById = async (req, res) => {
  try {
    const checkout = await Checkout.findById(req.params.id)
      .populate('userId', 'name email') // Populate user info
      .populate('addressId', 'name number address landmark city landmark state addressType pincode ') // Populate address details
      .populate({
        path: 'cartItems.productId', 
        model: 'Products', 
        select: 'title  images color size freeDelivery actualPrice offerPrice', 
      })

    if (!checkout) {
      return res.status(404).json({ message: "Checkout not found" });
    }

    res.status(200).json({ checkout });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// delete checkout
exports.deletCheckout = async (req, res) => {
  try {
    const deletedCheckout = await Checkout.findByIdAndDelete(req.params.id);
    if (!deletedCheckout) {
      return res.status(404).json({ message: "checkout details not found" });
    }
    res.status(200).json({ message: "checkout deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};