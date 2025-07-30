const jwt = require('jsonwebtoken');
const User = require('./userModel');
const NodeCache = require('node-cache');
const axios = require('axios');
const cache = new NodeCache({ stdTTL: 300 });

exports.register = async (req, res, next) => {
  try {
    const { name, phone, email } = req.body;
    const api_key = process.env.FACTOR_API_KEY;

    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ msg: 'Phone number already exists' });
    }

    cache.set(phone, { name, phone, email });

    const response = await axios.get(
      `https://2factor.in/API/V1/${api_key}/SMS/${phone}/AUTOGEN/OTP1`
    );

    if (response.data.Status !== 'Success') {
      return res.status(500).json({ message: 'Failed to send OTP. Try again later.' });
    }

    console.log(`OTP sent via 2Factor to ${phone}`);
    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (err) {
    next(err);
  }
};

exports.verifyOTP = async (req, res, next) => {
  try {
    const { phone, otp } = req.body;
    const api_key = process.env.FACTOR_API_KEY;

    const cachedData = cache.get(phone);
    if (!cachedData) {
      return res.status(400).json({ message: 'OTP expired or not found' });
    }

    const response = await axios.get(
      `https://2factor.in/API/V1/${api_key}/SMS/VERIFY3/${phone}/${otp}`
    );

    if (response.data.Status !== 'Success') {
      return res.status(400).json({ message: 'Invalid OTP. Please try again.' });
    }

    let user = await User.findOne({ phone });
    if (!user) {
      user = await User.create({
        name: cachedData.name,
        phone: cachedData.phone,
        email: cachedData.email,
      });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    cache.del(phone);

    return res.status(201).json({
      message: 'User verified successfully',
      user: {
        userId: user._id,
        name: user.name,
        phone: user.phone,
      },
      token,
    });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { phone } = req.body;
    const api_key = process.env.FACTOR_API_KEY;

    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    cache.set(phone, {
      phone,
      name: user.name,
      email: user.email,
    });

    const response = await axios.get(
      `https://2factor.in/API/V1/${api_key}/SMS/${phone}/AUTOGEN/OTP1`
    );

    if (response.data.Status !== 'Success') {
      return res.status(500).json({ message: 'Failed to send OTP' });
    }

    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (err) {
    next(err);
  }
};
