const Products = require("../product/productModel");
const Wishlist = require("../wishlist/wishlistModel");

exports.MainSearch = async (req, res) => {
  const { query, userId } = req.query;

  try {
    if (!query || query.trim() === "") {
      return res.status(400).json({ message: "Search query is required" });
    }

    const searchRegex = new RegExp(query, "i");

    // Search Products
    let products = await Products.find({
      $or: [
        { title: searchRegex },
        { description: searchRegex },
        { "colors.color": searchRegex },
        { "features.fit": searchRegex },
        { "features.sleevesType": searchRegex },
        { "features.Length": searchRegex },
        { "features.occasion": searchRegex },
        { "features.innerLining": searchRegex },
        { "manufacturerName": searchRegex },
        { "manufacturerBrand": searchRegex },
      ],
    })

    // Check if user has a wishlist
    if (userId) {
      const wishlist = await Wishlist.findOne({ userId });

      if (wishlist) {
        const wishlistedIds = new Set(
          wishlist.items.map(item => item.productId.toString())
        );

        // Mark each product as isInWishlist: true/false
        products = products.map(product => {
          const obj = product.toObject();
          obj.isInWishlist = wishlistedIds.has(obj._id.toString());
          return obj;
        });
      }
    }

    res.status(200).json(
      products
    );

  } catch (err) {
    console.error("Error fetching search results:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
