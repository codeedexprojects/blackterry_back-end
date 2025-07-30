const Invoice = require('./invoiceModel');
const User = require('../user/userModel');
const Address = require('../address/addressModel');
const Order = require('../orders/orderModel')

// fetch all invoice
exports.getInvoices = async (req, res) => {
  try {
    const { search, status, paymentId, startDate, endDate, dateType = 'created' } = req.query;

    const filter = {};

    if (search) {
      filter.$or = [
        { customerName: { $regex: search, $options: 'i' } },
        { customerMobile: { $regex: search, $options: 'i' } }
      ];
    }

    if (status) filter.status = status;

    if (paymentId) {
      filter.paymentId = { $regex: paymentId, $options: 'i' };
    }

    const dateField = dateType === 'updated' ? 'updatedAt' : 'createdAt';
    if (startDate || endDate) {
      filter[dateField] = {};

      const parseDate = (str) => {
        const [day, month, year] = str.split('-');
        return new Date(`${year}-${month}-${day}`);
      };

      if (startDate) {
        const start = parseDate(startDate);
        if (!isNaN(start)) filter[dateField].$gte = new Date(start.setHours(0, 0, 0, 0));
      }

      if (endDate) {
        const end = parseDate(endDate);
        if (!isNaN(end)) filter[dateField].$lte = new Date(end.setHours(23, 59, 59, 999));
      }

      // Remove empty object if both invalid
      if (Object.keys(filter[dateField]).length === 0) delete filter[dateField];
    }

    // 📦 Fetch invoices
    const invoices = await Invoice.find(filter)
      .populate('userId', 'name phone')
      .populate('products.productId', 'title')
      .populate('address', 'address city state')
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: 'Invoices fetched successfully',
      invoices
    });

  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch invoices', error: err.message });
  }
};


  // update invoice
  exports.updateInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const updateInvoice = await Invoice.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        )
        .populate('userId', 'name phone') 
        .populate('address', 'address city state')
        .populate('products.productId', 'title');
  
      if (!updateInvoice) {
        return res.status(404).json({ message: 'Invoice not found' });
      }  
      res.status(200).json({ 
        message: 'Invoice updated successfully',
        invoice: updateInvoice
      });
    } catch (err) {
        res.status(500).json({ message: 'Failed to update invoice', error: err.message });
      }
  }

  // delete invoice
  exports.deleteInvoice = async (req, res) => {
    try {
      const { id } = req.params; // Invoice ID
  
      const deletedInvoice = await Invoice.findByIdAndDelete(id);
      if (!deletedInvoice) {
        return res.status(404).json({ message: 'Invoice not found' });
      }
  
      res.status(200).json({ message: 'Invoice deleted successfully' });
    } catch (err) {
      res.status(500).json({ message: 'Failed to delete invoice', error: err.message });
    }
  };


// Get invoice for a specific order
exports.getInvoiceByOrderId = async (req, res) => {
  try {
    const { orderId } = req.params;

    const invoice = await Invoice.findOne({ order_id: orderId })
      .populate('userId', 'name phone')
      .populate('products.productId', 'title')
      .populate('address', 'address city state');

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found for the given order' });
    }

    res.status(200).json({
      message: 'Invoice fetched successfully',
      invoice,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch invoice', error: err.message });
  }
};
