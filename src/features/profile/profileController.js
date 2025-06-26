const User = require('../user/userModel');
const Address = require('..//address/addressModel');

// Get user profile
exports.getProfile = async (req, res) => {
    try {
        const { userId } = req.params                
        const user = await User.findById(userId); 
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({
            user: {
                id: user._id,
                name: user.name,
                phone: user.phone,
            },
        });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};


// Update user profile
exports.updateProfile = async (req, res) => {
    const { name, email } = req.body;
    const { userId } = req.params
    try {
        const user = await User.findById(userId); 
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Update fields
        user.name = name || user.name;
        user.email = email || user.email;
        

        await user.save();

        res.status(200).json({
            message: "Profile updated successfully",
            user: {
                id: user._id, 
                name: user.name,
                email: user.email,
            },
        });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};
