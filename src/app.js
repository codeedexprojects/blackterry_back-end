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
const userManagementRoutes = require('./features/userManagement/userManagementRoute')
const dashboardRoutes = require('./features/dashboard/dashboardRoute')
const searchRoutes = require('./features/search/searchRoute')

// Routes 
app.use('/api/user-auth', userRoutes)
app.use('/api/products', productRoutes)
app.use('/api/carousel', carouselRoutes)
app.use('/api/addresses', addressRoutes)
app.use('/api/wishlist', wishlistRoutes)
app.use('/api/cart', cartRoutes)
app.use('/api/size-Charts', sizeChartRoutes)
app.use('/api/profile', profileRoutes)
app.use('/api/checkout', checkoutRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/reviews', reviewRoutes)
app.use('/api/text-sliders', textSliderRoutes)
app.use('/api/invoice', invoiceRoutes)

app.use('/api/admin-auth', adminAuthRoutes)
app.use('/api/user-management', userManagementRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/search', searchRoutes)

// Error handling middleware
app.use(errorMiddleware);

module.exports = app;