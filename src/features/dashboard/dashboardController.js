const Order = require('../orders/orderModel');
const User = require('../user/userModel');

exports.getStats = async (req, res) => {
  try {
    const [totalOrders, totalUsers] = await Promise.all([
      Order.countDocuments(),
      User.countDocuments(),
    ]);

    const [{ totalRevenue = 0 } = {}] = await Order.aggregate([
      { $match: { status: 'Delivered' } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalPrice' } } },
    ]);

    const recentOrderCount = await Order.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    });

    res.status(200).json({
      totalOrders,
      totalUsers,
      totalRevenue,
      recentOrders: recentOrderCount,
    });
  } catch (error) {
    console.error('getStats error:', error.message);
    res.status(500).json({ message: 'Error fetching stats', error: error.message });
  }
};

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

exports.getMonthlyRevenue = async (req, res) => {
  try {
    const { place, startMonth = 1, endMonth = 12, year, Orderstatus = 'Delivered' } = req.query;

    const parsedYear = parseInt(year) || new Date().getFullYear();
    const start = new Date(parsedYear, startMonth - 1, 1);
    const end = new Date(parsedYear, endMonth, 1);

    if (startMonth < 1 || endMonth > 12 || startMonth > endMonth) {
      return res.status(400).json({ success: false, message: 'Invalid month range' });
    }

    const pipeline = [
      {
        $lookup: {
          from: 'addresses',
          localField: 'addressId',
          foreignField: '_id',
          as: 'addressDetails',
        },
      },
      { $unwind: '$addressDetails' },
      ...(place ? [{
        $match: {
          $or: [
            { 'addressDetails.city': place },
            { 'addressDetails.state': place },
          ]
        }
      }] : []),
      {
        $match: {
          status: Orderstatus,
          createdAt: { $gte: start, $lt: end }
        }
      },
      {
        $group: {
          _id: { month: { $month: '$createdAt' } },
          totalRevenue: { $sum: '$totalPrice' },
          orderCount: { $sum: 1 }
        }
      },
      {
        $project: {
          month: '$_id.month',
          totalRevenue: 1,
          orderCount: 1,
          monthName: { $arrayElemAt: [monthNames, { $subtract: ['$_id.month', 1] }] }
        }
      },
      { $sort: { month: 1 } }
    ];

    const monthlyRevenue = await Order.aggregate(pipeline);

    const fullData = Array.from({ length: endMonth - startMonth + 1 }, (_, i) => {
      const month = startMonth + i;
      const found = monthlyRevenue.find(m => m.month === month);
      return {
        month,
        monthName: monthNames[month - 1],
        totalRevenue: found?.totalRevenue || 0,
        orderCount: found?.orderCount || 0
      };
    });

    res.status(200).json({
      success: true,
      data: fullData,
      metadata: {
        year: parsedYear,
        startMonth: parseInt(startMonth),
        endMonth: parseInt(endMonth),
        totalRevenueInPeriod: fullData.reduce((sum, m) => sum + m.totalRevenue, 0),
        totalOrdersInPeriod: fullData.reduce((sum, m) => sum + m.orderCount, 0),
      }
    });
  } catch (error) {
    console.error('getMonthlyRevenue error:', error.message);
    res.status(500).json({ success: false, message: 'Error fetching revenue', error: error.message });
  }
};


exports.getRecentOrders = async (req, res) => {
  try {
    const { month, year } = req.query;
    const now = new Date();
    const queryConditions = {};

    if (month && year) {
      const start = new Date(parseInt(year), parseInt(month) - 1, 1);
      const end = new Date(parseInt(year), parseInt(month), 1);
      queryConditions.createdAt = { $gte: start, $lt: end };
    } else if (month) {
      const start = new Date(now.getFullYear(), parseInt(month) - 1, 1);
      const end = new Date(now.getFullYear(), parseInt(month), 1);
      queryConditions.createdAt = { $gte: start, $lt: end };
    } else if (year) {
      const start = new Date(parseInt(year), 0, 1);
      const end = new Date(parseInt(year) + 1, 0, 1);
      queryConditions.createdAt = { $gte: start, $lt: end };
    } else {
      queryConditions.createdAt = {
        $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        $lte: now
      };
    }

    const orders = await Order.find(queryConditions)
      .populate('userId', 'name email phone')
      .populate('products.productId', 'title')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      total: orders.length,
      data: orders,
      metadata: {
        fetchedAt: new Date(),
        filterApplied: { month, year }
      }
    });
  } catch (error) {
    console.error('getRecentOrders error:', error.message);
    res.status(500).json({ success: false, message: 'Error fetching recent orders', error: error.message });
  }
};
