const mongoose = require('mongoose');

const sizeChartSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    sizes: [
      {
        size: { type: String, required: true },
        measurements: {
          type: Map,
          of: mongoose.Schema.Types.Mixed, // supports numbers, strings, etc.
        },
      },
    ],
  },
  {
    timestamps: true, // automatically adds createdAt and updatedAt
  }
);

module.exports = mongoose.model('SizeChart', sizeChartSchema);
