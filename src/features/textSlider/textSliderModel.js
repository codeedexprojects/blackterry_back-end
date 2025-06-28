const mongoose = require('mongoose');

const textSliderSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    isActive: {
        type: Boolean,
        default: true,
    }
},{ timestamps: true});

module.exports = mongoose.model('textSlider', textSliderSchema);

