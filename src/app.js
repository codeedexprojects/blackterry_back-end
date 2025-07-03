const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const errorMiddleware = require('./middleware/errorMiddleware')

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const userRoutes = require('./features/user/userRoute')
const productRoutes = require('./features/product/productRoute')
const carouselRoutes = require('./features/carousel/carouselRoute') 
const addressRoutes = require('./features/address/addressRoute')
const wishlistRoutes = require('./features/wishlist/wishlistRoute')
const cartRoutes = require('./features/cart/cartRoute')
const sizeChartRoutes = require('./features/sizeChart/sizeChartRoute');
const profileRoutes = require('./features/profile/profileRoute');
const checkoutRoutes = require('./features/checkout/checkoutRoute')
const orderRoutes = require('./features/orders/orderRoute')
const reviewRoutes = require('./features/reveiws/reviewRoute')
const textSliderRoutes = require('./features/textSlider/textSliderRoute');
const invoiceRoutes = require('./features/invoice/invoiceRoute');

const adminAuthRoutes = require('./features/adminAuth/adminRoute')

// Routes 
app.use('/user-auth', userRoutes)
app.use('/products', productRoutes)
app.use('/carousel', carouselRoutes)
app.use('/addresses', addressRoutes)
app.use('/wishlist', wishlistRoutes)
app.use('/cart', cartRoutes)
app.use('/size-Charts', sizeChartRoutes)
app.use('/profile', profileRoutes)
app.use('/checkout', checkoutRoutes)
app.use('/orders', orderRoutes)
app.use('/reviews', reviewRoutes)
app.use('/text-sliders', textSliderRoutes)
app.use('/invoice', invoiceRoutes)

app.use('/admin-auth', adminAuthRoutes)

// Error handling middleware
app.use(errorMiddleware);

module.exports = app;