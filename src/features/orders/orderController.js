const Order = require('./orderModel');
const Address = require('.././address/addressModel');
const Product = require('.././product/productModel');
const Cart = require('.././cart/cartModel')
const Checkout = require('.././checkout/checkoutModel')
const User=require('.././user/userModel')
const mongoose=require('mongoose')
const { createInvoiceForOrder } = require('./orderModel');
const sendEmail = require('../../../config/mailService'); // Adjust path
const razorpay = require('../../../config/razorpayInstance');
const crypto = require("crypto");


// exports.initiateOrder = async (req, res) => {
//   const { deliveryCharge, checkoutId } = req.body;

//   try {
//     const checkout = await Checkout.findById(checkoutId)
//       .populate("cartItems.productId")

//     if (!checkout) return res.status(400).json({ message: "Checkout not found" });
//     if (!checkout.cartItems || checkout.cartItems.length === 0)
//       return res.status(400).json({ message: "No products found in checkout" });

//     let totalPrice = checkout.totalPrice + (deliveryCharge || 0);

//     // // Create Razorpay Order
//     // const razorpayOrder = await razorpay.orders.create({
//     //   amount: totalPrice * 100, // Convert to paisa
//     //   currency: "INR",
//     //   receipt: `order_rcptid_${Date.now()}`,
//     // });

//     return res.status(200).json({
//       message: "Payment initiated, proceed with Razorpay",
//     //   razorpayOrderId: razorpayOrder.id,
//       amount: totalPrice * 100,
//       currency: "INR",
//     });
//   } catch (err) {
//     console.error("Error initiating order:", err);
//     return res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

// place order

// exports.placeOrder = async (req, res) => {
//   const { userId, addressId, checkoutId,  } = req.body;

// //   const session = await mongoose.startSession();
// //   session.startTransaction();

//   try {
//     // // Verify Razorpay Payment Signature
//     // const generatedSignature = crypto
//     //   .createHmac("sha256", process.env.Razorpay_Secret)
//     //   .update(`${razorpayOrderId}|${razorpayPaymentId}`)
//     //   .digest("hex");

//     // if (generatedSignature !== razorpaySignature) {
//     //   throw new Error("Payment verification failed");
//     // }

//     const checkout = await Checkout.findById(checkoutId)
//       .populate("cartItems.productId")
      

//     const VerifiedUser=await User.findById(userId).populate()
//     console.log(VerifiedUser.email)

//     if (!checkout) throw new Error("Checkout not found");
//     if (!checkout.cartItems || checkout.cartItems.length === 0) throw new Error("No products found in checkout");

//     const validatedProducts = [];
//     let totalPrice = 0;

//     for (const cartItem of checkout.cartItems) {
//       const productData = cartItem.productId;
//       if (!productData) throw new Error(`Product with ID ${cartItem.productId} not found`);

//       const selectedColor = productData.colors.find((color) => color.color === cartItem.color);
//       if (!selectedColor) throw new Error(`Invalid color '${cartItem.color}' for product '${productData.title}'`);

//       const selectedSize = selectedColor.sizes.find((size) => size.size === cartItem.size);
//       if (!selectedSize) throw new Error(`Invalid size '${cartItem.size}' for product '${productData.title}'`);

//       if (selectedSize.stock < cartItem.quantity)
//         throw new Error(`Insufficient stock for product '${productData.title}'`);

//       selectedSize.stock -= cartItem.quantity;
//       productData.totalStock -= cartItem.quantity;
//       productData.orderCount += cartItem.quantity;

//       productData.markModified("colors");
//       validatedProducts.push({
//         productId: productData._id,
//         quantity: cartItem.quantity,
//         price: productData.offerPrice || productData.actualPrice,
//         color: cartItem.color,
//         size: cartItem.size,
//       });

//       totalPrice += cartItem.quantity * productData.offerPrice || productData.actualPrice;
//       await productData.save({  });
//     }

//     let finalPayableAmount = checkout.totalPrice ;

//     // Save order only after payment success
//     const order = new Order({
//       userId,
//       addressId,
//       products: validatedProducts,
//       totalPrice,
//       discountedAmount: checkout.discountedPrice,
      
//       finalPayableAmount,
//       paymentMethod: "UPI",
//       paymentStatus: "Paid",
//     //   razorpayOrderId,
//     //   razorpayPaymentId,
//     });

//     await order.save({  });
//     await Cart.deleteOne({ userId }).session(session);
//     await Checkout.deleteOne({ _id: checkoutId }).session(session);
//     // await session.commitTransaction();
//     // session.endSession();

//     // mail
//     const userEmail = VerifiedUser.email; 
//     const userName = VerifiedUser.name;
//     const subject = "Order Confirmation-URBAAN COLLECTIONS";
//     const text = `Your order #${order.orderId} has been placed successfully. We'll notify you when your order is on its way!`;

//     await sendEmail(userEmail, "order_created", {
//       subject: "Order Confirmation - URBAAN COLLECTIONS",
//       orderId: order.orderId,
//       customerName: userName,
//       totalAmount: finalPayableAmount,
//     });
//     return res.status(201).json({ message: "Order placed successfully", orderId: order._id });
//   } catch (err) {
//     // await session.abortTransaction();
//     // session.endSession();
//     console.error("Error placing order:", err);
//     return res.status(500).json({ message: "Server error", error: err.message });
//   }
// };



exports.initiateOrder = async (req, res) => {
  const { userId, checkoutId, addressId } = req.body;

  try {
    const checkout = await Checkout.findById(checkoutId).populate("cartItems.productId");
    const address = await Address.findById(addressId);
    const user = await User.findById(userId);

    if (!checkout || !address || !user) {
      return res.status(404).json({ message: "Invalid checkout, address or user" });
    }

    if (!checkout.cartItems || checkout.cartItems.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Calculate total price
    let totalAmount = 0;
    for (const cartItem of checkout.cartItems) {
      const product = cartItem.productId;
      const itemPrice = product.offerPrice || product.actualPrice;
      totalAmount += itemPrice * cartItem.quantity;
    }

    const amountInPaise = Math.round(checkout.totalPrice * 100);
    
    // Create Razorpay Order
    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
      notes: {
        userId,
        checkoutId,
        addressId,
      },
    });

    res.status(200).json({
      success: true,
      message: "Razorpay order created",
      orderId: razorpayOrder.id,
      amount: amountInPaise,
      currency: "INR",
      user: {
        name: user.name,
        email: user.email,
        contact: address.number,
      },
    });
  } catch (error) {
    console.error("Error initiating Razorpay order:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};




exports.placeOrder = async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    userId,
    checkoutId,
    addressId
  } = req.body;

  try {
    // Step 1: Verify signature
    const generated_signature = crypto
      .createHmac("sha256", process.env.Razorpay_Secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Payment verification failed" });
    }

    // Step 2: Fetch data again for safety
    const checkout = await Checkout.findById(checkoutId).populate("cartItems.productId");
    const address = await Address.findById(addressId);
    const user = await User.findById(userId);

    if (!checkout || !address || !user) {
      return res.status(404).json({ message: "Invalid checkout, address or user" });
    }

    // Step 3: Validate & reduce stock
    const validatedProducts = [];
    let totalPrice = 0;

    for (const item of checkout.cartItems) {
      const product = item.productId;

      const colorVariant = product.colors.find(c => c.color === item.color);
      if (!colorVariant) throw new Error("Invalid color");

      const sizeVariant = colorVariant.sizes.find(s => s.size === item.size);
      if (!sizeVariant || sizeVariant.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${product.title}`);
      }

      // Deduct stock
      sizeVariant.stock -= item.quantity;
      product.totalStock -= item.quantity;
      product.orderCount += item.quantity;
      product.markModified("colors");
      await product.save();

      const itemPrice = product.offerPrice || product.actualPrice;
      totalPrice += item.quantity * itemPrice;

      validatedProducts.push({
        productId: product._id,
        quantity: item.quantity,
        price: itemPrice,
        color: item.color,
        size: item.size,
      });
    }

    const shippingAddress = {
      name: `${address.firstName} ${address.lastName}`,
      phone: address.number,
      address: address.address,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      country: address.country,
    };

    // Step 4: Create final MongoDB order
    const newOrder = new Order({
      userId,
      products: validatedProducts,
      shippingAddress,
      totalPrice,
      discountedAmount: checkout.discountedPrice,
      finalPayableAmount: checkout.totalPrice,
      paymentMethod: "Online",
      paymentStatus: "Paid",
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
    });

    await newOrder.save();
    await createInvoiceForOrder(newOrder._id);
    await Cart.deleteOne({ userId });
    await Checkout.deleteOne({ _id: checkoutId });

    res.status(200).json({
      success: true,
      message: "Payment verified and order placed",
      orderId: newOrder._id,
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};

// exports.placeOrder = async (req, res) => {
//   const { userId, checkoutId , addressId} = req.body;

//   try {
//     // Fetch checkout data
//     const checkout = await Checkout.findById(checkoutId)
//       .populate("cartItems.productId")

//     const address = await Address.findById(addressId)

//     if (!checkout) throw new Error("Checkout not found");
//     if (!checkout.cartItems || checkout.cartItems.length === 0)
//       throw new Error("No products found in checkout");

//     // Validate user
//     const verifiedUser = await User.findById(userId);
//     if (!verifiedUser) throw new Error("User not found");

//     // Prepare products and validate stock
//     const validatedProducts = [];
//     let totalPrice = 0;

//     for (const cartItem of checkout.cartItems) {
//       const productData = cartItem.productId;
//       if (!productData) throw new Error(`Product with ID ${cartItem.productId} not found`);

//       const selectedColor = productData.colors.find(
//         (color) => color.color === cartItem.color
//       );
//       if (!selectedColor)
//         throw new Error(`Invalid color '${cartItem.color}' for product '${productData.title}'`);

//       const selectedSize = selectedColor.sizes.find(
//         (size) => size.size === cartItem.size
//       );
//       if (!selectedSize)
//         throw new Error(`Invalid size '${cartItem.size}' for product '${productData.title}'`);

//       if (selectedSize.stock < cartItem.quantity)
//         throw new Error(`Insufficient stock for product '${productData.title}'`);

//       // Update stock
//       selectedSize.stock -= cartItem.quantity;
//       productData.totalStock -= cartItem.quantity;
//       productData.orderCount += cartItem.quantity;
//       productData.markModified("colors");

//       await productData.save();

//       const itemPrice = productData.offerPrice || productData.actualPrice;

//       validatedProducts.push({
//         productId: productData._id,
//         quantity: cartItem.quantity,
//         price: itemPrice,
//         color: cartItem.color,
//         size: cartItem.size,
//       });

//       totalPrice += cartItem.quantity * itemPrice;
//     }
    
//     // Prepare embedded address snapshot
//     const shippingAddress = {
//       name: `${address.firstName} ${address.lastName}`,
//       phone: address.number,
//       address: address.address,
//       city: address.city,
//       state: address.state,
//       pincode: address.pincode,
//       country: address.country,
//     };

//     // Create Order
//     const order = new Order({
//       userId,
//       products: validatedProducts,
//       shippingAddress,
//       totalPrice,
//       discountedAmount: checkout.discountedPrice,
//       finalPayableAmount: checkout.totalPrice,
//       paymentMethod: "Cash on Delivery",
//       paymentStatus: "Pending",
//     });

//     await order.save();
//     await createInvoiceForOrder(order._id);
//     await Cart.deleteOne({ userId });
//     await Checkout.deleteOne({ _id: checkoutId });

//     // Optional: Send confirmation email
//     // await sendEmail(verifiedUser.email, "order_created", {
//     //   subject: "Order Confirmation - URBAAN COLLECTIONS",
//     //   orderId: order._id,
//     //   customerName: verifiedUser.name,
//     //   totalAmount: order.finalPayableAmount,
//     // });

//     res.status(201).json({
//       message: "Order placed successfully",
//       orderId: order._id,
//     });
//   } catch (err) {
//     console.error("Error placing order:", err);
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };



// Get orders by user
exports.getUserOrders = async (req, res) => {
  try {
    const { userId } = req.params;

    const orders = await Order.find({ userId })
      .sort({createdAt:-1})
      .populate({
        path: 'products.productId',
        model: 'Products',
        select: 'title offerPrice description images'
      });

    res.status(200).json({ orders });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get order details by ID
exports.getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await Order.findById(orderId)
      .populate({
        path: 'products.productId',
        model: 'Products',
        select: 'title offerPrice description images'
      });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({ order });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


exports.cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    

    // Allow cancellation only if status is Pending or Processing
    if (!['Pending', 'Processing'].includes(order.status)) {
      return res.status(403).json({ message: `Cannot cancel an order with status "${order.status}"` });
    }

    // Restore stock for each product in the order
    for (const item of order.products) {
      const product = await Product.findById(item.productId);
      if (!product) continue;

      const colorVariant = product.colors.find(c => c.color === item.color);
      if (!colorVariant) continue;

      const sizeVariant = colorVariant.sizes.find(s => s.size === item.size);
      if (!sizeVariant) continue;

      sizeVariant.stock += item.quantity;
      product.totalStock += item.quantity;
      product.orderCount = Math.max(0, product.orderCount - item.quantity);

      product.markModified('colors');
      await product.save();
    }

    // Update order status and cancellation details
    order.status = 'Cancelled';
    order.cancelReason = reason || null;
    order.cancelledAt = new Date();
    await order.save();

    res.status(200).json({ message: 'Order cancelled successfully and stock updated', order });
  } catch (err) {
    console.error('Cancel Order Error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// User initiates a return request
exports.requestReturn = async (req, res) => {
  const { orderId } = req.params;
  const { reason } = req.body;

  try {
    const order = await Order.findById(orderId);

    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.status !== 'Delivered') {
      return res.status(400).json({ message: "Return request allowed only for delivered orders" });
    }

    const oneWeekAfterDelivery = new Date(order.deliveryDate);
    oneWeekAfterDelivery.setDate(oneWeekAfterDelivery.getDate() + 7);

    if (new Date() > oneWeekAfterDelivery) {
      return res.status(400).json({ message: "Return period expired" });
    }

    order.status = "ReturnRequested";
    order.returnReason = reason;
    order.returnRequestedAt = new Date();

    await order.save();

    res.status(200).json({ message: "Return request submitted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate('userId', 'name email phone') // Populate user info
      .populate('products.productId', 'title') // Populate product info
      .lean();

    res.status(200).json({
      message: "Orders fetched successfully",
      count: orders.length,
      orders
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch orders", error: error.message });
  }
};




exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['Pending', 'Processing', 'In-Transist', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    )
      .populate('userId', 'name email')
      .populate('products.productId', 'title');

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Prepare email content only when status is Delivered
    if (status === "Delivered") {
      const productList = order.products
        .map(p => `<li>${p.productId.title} x ${p.quantity}</li>`)
        .join('');

      const html = `
        <h2>Hello ${order.userId.name},</h2>
        <p>Your order <strong>${order.orderId}</strong> has been <strong>delivered</strong>.</p>
        <h4>Order Summary:</h4>
        <ul>${productList}</ul>
        <p>Thank you for shopping with us at <strong>Black Terry</strong>.</p>
      `;

      await sendEmail(order.userId.email, `Your Order ${order.orderId} Has Been Delivered`, html);
    }

    res.status(200).json({ message: "Order status updated successfully", order });

  } catch (err) {
    res.status(500).json({ message: "Error updating order status", error: err.message });
  }
};


exports.deleteOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Optional: You can restrict deletion if status is not Cancelled
    if (!['Cancelled'].includes(order.status)) {
      return res.status(403).json({ message: "Only cancelled orders can be deleted" });
    }

    await Order.findByIdAndDelete(orderId);

    res.status(200).json({ message: "Order deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting order", error: err.message });
  }
};

