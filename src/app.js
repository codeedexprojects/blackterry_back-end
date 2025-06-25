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
const sizeChartRoutes = require('./features/sizeChart/sizeChartRoute')


// Routes 
app.use('/user-auth', userRoutes)
app.use('/products', productRoutes)
app.use('/carousel', carouselRoutes)
app.use('/addresses', addressRoutes)
app.use('/wishlist', wishlistRoutes)
app.use('/cart', cartRoutes)
app.use('/size-Charts', sizeChartRoutes)

// Error handling middleware
app.use(errorMiddleware);

module.exports = app;