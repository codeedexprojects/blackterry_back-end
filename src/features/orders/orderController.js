const Order = require('./orderModel');
const Address = require('.././address/addressModel');
const Product = require('.././product/productModel');
const Cart = require('.././cart/cartModel')
const Checkout = require('.././checkout/checkoutModel')
const User=require('.././user/userModel')
const mongoose=require('mongoose')
// const razorpay = require('../../../config/RazorpayInstance');
// const crypto = require("crypto");
// const { sendEmail } = require('../../../config/mailGun');  


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


exports.placeOrder = async (req, res) => {
  const { userId, checkoutId , addressId} = req.body;

  try {
    // Fetch checkout data
    const checkout = await Checkout.findById(checkoutId)
      .populate("cartItems.productId")

    const address = await Address.findById(addressId)

    if (!checkout) throw new Error("Checkout not found");
    if (!checkout.cartItems || checkout.cartItems.length === 0)
      throw new Error("No products found in checkout");

    // Validate user
    const verifiedUser = await User.findById(userId);
    if (!verifiedUser) throw new Error("User not found");

    // Prepare products and validate stock
    const validatedProducts = [];
    let totalPrice = 0;

    for (const cartItem of checkout.cartItems) {
      const productData = cartItem.productId;
      if (!productData) throw new Error(`Product with ID ${cartItem.productId} not found`);

      const selectedColor = productData.colors.find(
        (color) => color.color === cartItem.color
      );
      if (!selectedColor)
        throw new Error(`Invalid color '${cartItem.color}' for product '${productData.title}'`);

      const selectedSize = selectedColor.sizes.find(
        (size) => size.size === cartItem.size
      );
      if (!selectedSize)
        throw new Error(`Invalid size '${cartItem.size}' for product '${productData.title}'`);

      if (selectedSize.stock < cartItem.quantity)
        throw new Error(`Insufficient stock for product '${productData.title}'`);

      // Update stock
      selectedSize.stock -= cartItem.quantity;
      productData.totalStock -= cartItem.quantity;
      productData.orderCount += cartItem.quantity;
      productData.markModified("colors");

      await productData.save();

      const itemPrice = productData.offerPrice || productData.actualPrice;

      validatedProducts.push({
        productId: productData._id,
        quantity: cartItem.quantity,
        price: itemPrice,
        color: cartItem.color,
        size: cartItem.size,
      });

      totalPrice += cartItem.quantity * itemPrice;
    }
    
    // Prepare embedded address snapshot
    const shippingAddress = {
      name: `${address.firstName} ${address.lastName}`,
      phone: address.number,
      address: address.address,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      country: address.country,
    };

    // Create Order
    const order = new Order({
      userId,
      products: validatedProducts,
      shippingAddress,
      totalPrice,
      discountedAmount: checkout.discountedPrice,
      finalPayableAmount: checkout.totalPrice,
      paymentMethod: "Cash on Delivery",
      paymentStatus: "Pending",
    });

    await order.save();
    await Cart.deleteOne({ userId });
    await Checkout.deleteOne({ _id: checkoutId });

    // Optional: Send confirmation email
    // await sendEmail(verifiedUser.email, "order_created", {
    //   subject: "Order Confirmation - URBAAN COLLECTIONS",
    //   orderId: order._id,
    //   customerName: verifiedUser.name,
    //   totalAmount: order.finalPayableAmount,
    // });

    res.status(201).json({
      message: "Order placed successfully",
      orderId: order._id,
    });
  } catch (err) {
    console.error("Error placing order:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};



// Get orders by user
exports.getUserOrders = async (req, res) => {
  try {
    const { userId } = req.params;

    const orders = await Order.find({ userId })
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


