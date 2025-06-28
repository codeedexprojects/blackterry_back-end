const TextSlider = require('./textSliderModel');


exports.getTextSliders = async (req, res) => {
  try {
    const textSliders = await TextSlider.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: textSliders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch Text Sliders', error: error.message });
  }
};

exports.createTextSlider = async (req, res) => {
  try {
    const { title } = req.body;
    const newTextSlider = new TextSlider({ title });
    const saved = await newTextSlider.save();

    res.status(201).json({ success: true, message: 'Text Slider created', data: saved });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create Text Slider', error: error.message });
  }
};

exports.updateTextSlider = async (req, res) => {
  try {
    const updated = await TextSlider.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Text Slider not found' });
    }

    res.status(200).json({ success: true, message: 'Text Slider updated', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update Text Slider', error: error.message });
  }
};

exports.deleteTextSlider = async (req, res) => {
  try {
    const deleted = await TextSlider.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Text Slider not found' });
    }

    res.status(200).json({ success: true, message: 'Text Slider deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete Text Slider', error: error.message });
  }
};
