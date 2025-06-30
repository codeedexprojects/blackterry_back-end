const Counter = require('.././features/orders/counterModel');
async function generateNumericOrderId() {
  const counter = await Counter.findOneAndUpdate(
    { name: 'orderId' }, 
    { $inc: { seq: 1 } }, 
    { new: true, upsert: true } 
  );
  return counter.seq;
}
module.exports = generateNumericOrderId;