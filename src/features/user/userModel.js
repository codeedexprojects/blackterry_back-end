const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"]
    },
    phone: {
        type: String,
        unique: true,
        sparse: true,
        match: [
            /^\+?[1-9]\d{1,14}$/,
            "Please enter a valid phone number"
        ],
    },
    email: {
        type: String,
        unique: true,
        match: [
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            "Please enter a valid email address"
        ],
        default:null,
        require:true
    },
    status: {
        type: Boolean,
        default: true
    },
    role: {
        type: String,
        default: 'user',
    },
    addresses: [{ type: mongoose.Schema.Types.ObjectId, ref:'Address' }]
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

module.exports = User;
