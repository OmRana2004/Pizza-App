

const Order = require('../../../models/order');

function AdminOrderController() {
    return {
        index(req, res) {
            Order.find({ status: { $ne: 'completed' } }, null, { sort: { 'createdAt': -1 }}).populate('customerId', '-password').exec((err, orders) => {
                res.render('admin/orders', { orders });
            });
        }
    };
}

module.exports = AdminOrderController;
