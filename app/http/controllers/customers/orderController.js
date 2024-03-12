const Order = require('../../../models/order');
const moment = require('moment');

function orderController () {
    return {
        async store(req, res) {
            // Validate request
            const { phone, address } = req.body;
            if (!phone || !address) {
                req.flash('error', 'All fields are required');
                return res.redirect('/cart');
            }

            try {
                const order = new Order({
                    customerId: req.user._id,
                    items: req.session.cart.items,
                    phone,
                    address
                });

                const result = await order.save();
                const placedOrder = await Order.populate(result, { path: 'customerId' });

                req.flash('success', 'Order placed');
                delete req.session.cart;

                // Emit
                const eventEmitter = req.app.get('eventEmitter');
                eventEmitter.emit('orderPlaced', placedOrder);

                return res.redirect('/customer/orders');
            } catch (err) {
                console.error('Error placing order:', err);
                req.flash('error', 'Something went wrong');
                return res.redirect('/cart');
            }
        },

        async index(req, res) {
            try {
                const orders = await Order.find({ customerId: req.user._id })
                    .sort({ createdAt: -1 });

                res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
                res.render('customers/orders', { orders, moment });
            } catch (err) {
                console.error('Error fetching orders:', err);
                req.flash('error', 'Something went wrong');
                return res.redirect('/customer/orders');
            }
        },

        async show(req, res) {
            try {
                const order = await Order.findById(req.params.id);

                // Authorize user
                if (req.user._id.toString() === order.customerId.toString()) {
                    return res.render('customers/singleOrder', { order });
                }
                return res.redirect('/');
            } catch (err) {
                console.error('Error fetching order details:', err);
                req.flash('error', 'Something went wrong');
                return res.redirect('/customer/orders');
            }
        }
    };
}

module.exports = orderController;
