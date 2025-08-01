const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: { type: String, required: [true, "Product title is required"] },
  product_Code: { type: String, required: [true, "Product Code is required"], unique: true },
  actualPrice: { type: Number, required: [true, "Actual price is required"] },
  discount: { type: Number, default: 0 },
  offerPrice: { type: Number },
  description: { type: String, required: [true, "Product description is required"] },
  images: [{ type: String, required: [true, "At least one product image is required"] }],
  manufacturerName: { type: String, required: [true, "Manufacturer name is required"] },
  manufacturerBrand: { type: String, required: [true, "Manufacturer brand is required"] },
  manufacturerAddress: { type: String, required: [true, "Manufacturer address is required"] },
  colors: [{
    color: { type: String, required: true },
    sizes: [{
      size: { type: String, required: true },
      stock: { type: Number, required: true }
    }]
  }],
  totalStock: { type: Number, default: 0 },
  orderCount: { type: Number, default: 0 },
  isLatestProduct: { type: Boolean, default: false },
  isOfferProduct: { type: Boolean, default: false },
  isFeaturedProduct: { type: Boolean, default: false },
  freeDelivery: { type: Boolean, default: false },
//   sizeChartRefs: [{
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'SizeChart'
//   }],
  features: {
    gender: { type: String, enum: ['Men', 'Women', 'Unisex'], default: null },
    fit: { type: String, default: null },
    sleevesType: { type: String, default: null },
    Length: { type: String, default: null },
    occasion: { type: String, default: null },
    innerLining: { type: String, default: null },
    material: { type: String, default: null },
    neck: { type: String, default: null }
  },
}, { timestamps: true });

module.exports = mongoose.model('Products', productSchema);
