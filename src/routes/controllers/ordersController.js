import Order from "../../db/models/order"

export const getOrders = async (req, res, next) => {
    try {
      const orders = await Order.find({ 'user.userId': req.user._id })
        .populate('eventDetails'); // Populate the eventDetails virtual property
  
      res.status(200).json({ data: orders });
    } catch (error) {
      next(new ErrorResponse('Error', 400));
    }
  };
  
  export const getOrder = async (req, res, next) => {
    try {
      const order = await Order.findById(req.params.id)
        .populate('eventDetails'); // Populate the eventDetails virtual property
  
      if (!order) {
        return next(new ErrorResponse('Order not found', 404));
      }
  
      res.status(200).json({ data: order });
    } catch (error) {
      next(new ErrorResponse('Error', 400));
    }
  };

export const placeOrder = (req, res, next) => {
    const user = { 
        userId: req.user._id,
        name: req.user.name,
        email: req.user.email
    };

    const orderDetails = { 
        ...req.body,
        user: user 
    };

    const order = new Order(orderDetails);
    order.save()
        .then(result => {
            res.status(201).json({ data: order });
        },
        error => {
           next(new ErrorResponse('Error', 400));
        });
};