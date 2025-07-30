const Checkout = require('./checkoutModel');
const Cart = require('.././cart/cartModel');
const Product = require('.././product/productModel'); 
// const { checkout } = require('../../../Routes/Admin/Invoice/invoiceRoute');

// Create Checkout
exports.createCheckout = async (req, res) => {
  const { userId } = req.body;

  try {
    const cart = await Cart.findOne({ userId }).populate({
      path: "items.productId",
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty or not found" });
    }

    let actualTotal = 0;
    const cartItems = [];

    for (const item of cart.items) {
      const product = item.productId;
      const actualPrice = product.actualPrice || 0;
      const offerPrice = item.price || 0;

      // ✅ Check stock
      const selectedColor = product.colors.find(c => c.color === item.color);
      if (!selectedColor) {
        return res.status(400).json({ message: `Color '${item.color}' not found for product '${product.title}'` });
      }

      const selectedSize = selectedColor.sizes.find(s => s.size === item.size);
      if (!selectedSize) {
        return res.status(400).json({ message: `Size '${item.size}' not found for product '${product.title}'` });
      }

      if (selectedSize.stock < item.quantity) {
        return res.status(400).json({ 
          message: `Only ${selectedSize.stock} left in stock for '${product.title}' (Color: ${item.color}, Size: ${item.size})` 
        });
      }

      // Stock is valid, proceed
      actualTotal += actualPrice * item.quantity;
      cartItems.push({
        productId: product._id,
        quantity: item.quantity,
        price: offerPrice,
        color: item.color,
        size: item.size,
      });
    }

    const discountedPrice = actualTotal - cart.totalPrice;

    const checkout = new Checkout({
      userId,
      cartId: cart._id,
      cartItems,
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

exports.buyNowCheckout = async (req, res) => {
  const { userId, productId, quantity, color, size } = req.body;

  try {
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const selectedColor = product.colors.find((c) => c.color === color);
    const selectedSize = selectedColor?.sizes.find((s) => s.size === size);

    if (!selectedColor || !selectedSize || selectedSize.stock < quantity) {
      return res.status(400).json({ message: "Insufficient stock or invalid variant" });
    }

    const actualPrice = product.actualPrice;
    const offerPrice = product.offerPrice ?? actualPrice;
    const totalPrice = offerPrice * quantity;
    const discountedAmount = (actualPrice - offerPrice) * quantity;


    const checkout = new Checkout({
      userId,
      cartItems: [{
        productId,
        quantity,
        price: offerPrice,
        color,
        size
      }],
      totalPrice,
      discountedPrice: discountedAmount,
    });

    await checkout.save();

    res.status(201).json({
      message: "Buy Now checkout created",
      checkoutId: checkout._id,
      totalPrice,
      discountedAmount,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
