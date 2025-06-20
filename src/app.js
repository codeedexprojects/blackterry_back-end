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


// Routes 
app.use('/user-auth', userRoutes)
app.use('/products', productRoutes)
app.use('/carousel', carouselRoutes)

// Error handling middleware
app.use(errorMiddleware);

module.exports = app;