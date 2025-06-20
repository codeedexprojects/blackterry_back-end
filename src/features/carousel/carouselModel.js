const mongoose = require('mongoose');

const carouselSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    image:{
        type:String,
        required:true
    },
    link: {
        type: String,
        
        validate: {
            validator: function (v) {
                return /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w.-]*)*\/?$/.test(v);
            },
        },
    },
    isActive: {
        type: Boolean,
        default: true,
    }
},{ timestamps: true});

module.exports = mongoose.model('Carousel', carouselSchema);

