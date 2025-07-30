const User = require('../user/userModel');
const Address = require('../address/addressModel');
const Order = require('../orders/orderModel');

// Get user profile by id
exports.getUserById = async (req, res) => {
  const { userId } = req.params

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
}
    try {
        // Find user details
        const user = await User.findById(userId).select('-password'); 
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Find all addresses associated with the user
        const addresses = await Address.find({ userId: userId });

        // find all orders associated with the user
        const orders = await Order.find({userId: userId});

        res.status(200).json({
            user: {
                id: user._id, // Include the user ID
                name: user.name,
                phone: user.phone,
                email: user.email,
                status: user.status,
                isFavorite: user.isFavorite,
                addresses: addresses, // Include all addresses
                orders: orders, // include all orders
            },
        });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};


// fetch all user
exports.getAllUsers = async (req, res) => {
  const { name, phone, email } = req.query;

  try {
    // Build dynamic search query
    const query = {};
    if (name) {
      query.name = { $regex: name, $options: 'i' };
    }
    if (phone) {
      query.phone = { $regex: phone, $options: 'i' };
    }
    if (email) {
      query.email = { $regex: email, $options: 'i' };
    }

    // Fetch users matching the query
    const users = await User.find(query).sort({ createdAt: -1 });

    // Fetch associated addresses for each user
    const usersWithAddresses = await Promise.all(
      users.map(async (user) => {
        const addresses = await Address.find({ userId: user._id });
        return {
          id: user._id,
          name: user.name,
          phone: user.phone,
          email: user.email,
          status: user.status,
          isFavorite: user.isFavorite || false,
          addresses,
        };
      })
    );

    res.status(200).json({ users: usersWithAddresses });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users', error: err.message });
  }
};



exports.toggleUserStatus = async (req, res) => {
  const { userId } = req.params;
  const { status } = req.body; // expected: 'active' or 'suspended'

  try {
    if (!['active', 'suspended'].includes(status)) {
      return res.status(400).json({ message: "Invalid status value. Must be 'active' or 'suspended'." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.status = status;
    await user.save();

    res.status(200).json({ message: `User status updated to '${status}' successfully.` });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

  // delete a user
  exports.deleteUser = async (req, res) => {
    const { userId } = req.params;
    try {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      await user.deleteOne();
      res.status(200).json({ message: 'User deleted successfully' });
    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  };
  
