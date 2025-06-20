const Carousel = require('./carouselModel');

exports.getAllCarousels = async (req, res) => {
  try {
    const carousels = await Carousel.find().sort({createdAt:-1});
    res.status(200).json({ success: true, data: carousels });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch carousels', error: error.message });
  }
};

exports.createCarousel = async (req, res) => {
  try {
    const { title, link, isActive } = req.body;
    const image = req.file.filename ; 
    
    const newCarousel = new Carousel({
      title,
      image,
      link,
      isActive,
    });

    const saved = await newCarousel.save();
    res.status(201).json({ message:'Carousel created', data: saved });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create carousel',
      error: error.message,
    });
  }
};


exports.updateCarousel = async (req, res) => {
  try {
    const updates = { ...req.body };

    if (req.file?.location) {
      updates.image = req.file.location;
    }

    const updated = await Carousel.findByIdAndUpdate(req.params.id, updates, {
      new: true,
    });

    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: 'Carousel not found' });
    }

    res.status(200).json({ message: "Carousel updated", data: updated });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update carousel',
      error: error.message,
    });
  }
};


exports.deleteCarousel = async (req, res) => {
  try {
    const deleted = await Carousel.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Carousel not found' });
    }
    res.status(200).json({ success: true, message: 'Carousel deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete carousel', error: error.message });
  }
};
