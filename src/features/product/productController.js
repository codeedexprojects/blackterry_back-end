const Product = require('./productModel');

// Add a new product
exports.addProduct = async (req, res) => {
  try {
    const images = req.files?.map(file => file.filename) || [];

    if (!req.body.product_Code) {
      return res.status(400).json({ error: "Product Code is required." });
    }

    const existingProduct = await Product.findOne({ product_Code: req.body.product_Code });
    if (existingProduct) {
      return res.status(400).json({ error: "A product with the same Product Code already exists." });
    }

    // Parse colors
    let colors = [];
    try {
      colors = typeof req.body.colors === "string" ? JSON.parse(req.body.colors) : (req.body.colors || []);
    } catch (err) {
      return res.status(400).json({ error: "Invalid colors format", details: err.message });
    }

    const validatedColors = colors.map(color => ({
      color: color.color || "",
      sizes: (color.sizes || []).map(size => ({
        size: size.size || "",
        stock: parseInt(size.stock || 0, 10)
      }))
    }));

    const totalStock = validatedColors.reduce(
      (sum, color) => sum + color.sizes.reduce((subSum, size) => subSum + size.stock, 0),
      0
    );

    const newProduct = new Product({
      ...req.body,
      images,
      colors: validatedColors,
      totalStock,
    });

    const saved = await newProduct.save();
    res.status(201).json({ message: "Product added successfully", product: saved });
  } catch (error) {
    console.error("Add Product Error:", error);
    res.status(400).json({ error: "Product creation failed", details: error.message });
  }
};


// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const { available, minPrice, maxPrice, sortBy } = req.query;

    const filterConditions = [];
    const baseFilter = {};

    if (available === 'true') {
      baseFilter.totalStock = { $gt: 0 };
    } else if (available === 'false') {
      baseFilter.totalStock = { $lte: 0 };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      const min = minPrice !== undefined ? Number(minPrice) : 0;
      const max = maxPrice !== undefined ? Number(maxPrice) : Infinity;

      filterConditions.push({
        $or: [
          {
            offerPrice: { $ne: null, $gte: min, $lte: max }
          },
          {
            $or: [{ offerPrice: null }, { offerPrice: { $exists: false } }],
            actualPrice: { $gte: min, $lte: max }
          }
        ]
      });
    }

    if (Object.keys(baseFilter).length > 0) filterConditions.push(baseFilter);

    const finalFilter = filterConditions.length > 0 ? { $and: filterConditions } : {};

    let sortOption = {};

    if (sortBy === 'availability') {
      sortOption.totalStock = -1; 
    } else {
      sortOption.createdAt = -1; 
    }

    const products = await Product.find(finalFilter).sort(sortOption);

    res.status(200).json(products);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};





// Get product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)


    if (!product) return res.status(404).json({ message: "Product not found" });

    res.status(200).json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


// Update product
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const existingImages = product.images || [];
    const newImages = req.files?.map(file => file.filename) || [];

    if (existingImages.length + newImages.length > 5) {
      return res.status(400).json({ message: "Cannot have more than 5 images for a product" });
    }

    const updatedData = {
      ...req.body,
      images: [...existingImages, ...newImages],
    };

    // Parse colors
    if (req.body.colors) {
      let parsedColors;
      try {
        parsedColors = typeof req.body.colors === "string" ? JSON.parse(req.body.colors) : req.body.colors;
      } catch (err) {
        return res.status(400).json({ message: "Invalid colors format" });
      }

      if (Array.isArray(parsedColors)) {
        const updatedColors = parsedColors.map((color) => ({
          color: color.color,
          sizes: (color.sizes || []).map(size => ({
            size: size.size,
            stock: parseInt(size.stock || 0, 10)
          }))
        }));

        const totalStock = updatedColors.reduce(
          (sum, color) => sum + color.sizes.reduce((subSum, size) => subSum + size.stock, 0),
          0
        );

        updatedData.colors = updatedColors;
        updatedData.totalStock = totalStock;
      }
    }

    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updatedData, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ message: "Product updated successfully", product: updatedProduct });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    await Product.findByIdAndDelete(id);
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Delete Product Error:", error);
    res.status(400).json({ error: error.message });
  }
};
