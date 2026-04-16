import Joi from 'joi';

export const orderValidation = {
  createOrder: Joi.object({
    canteenId: Joi.string().required().hex().length(24),
    items: Joi.array().items(
      Joi.object({
        menuItem: Joi.string().required().hex().length(24),
        quantity: Joi.number().integer().min(1).max(50).required(),
        specialInstructions: Joi.string().max(200).allow('')
      })
    ).min(1).required(),
    orderMode: Joi.string().valid('dine-in', 'takeaway', 'delivery').required(),
    paymentMethod: Joi.string().valid('card', 'upi', 'wallet', 'cash').required(),
    specialRequests: Joi.string().max(500).allow(''),
    deliveryAddress: Joi.string().max(300).when('orderMode', {
      is: 'delivery',
      then: Joi.required()
    }),
    tableNumber: Joi.string().max(10).when('orderMode', {
      is: 'dine-in',
      then: Joi.required()
    })
  }),

  updateStatus: Joi.object({
    status: Joi.string().valid('pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled').required()
  }),

  submitFeedback: Joi.object({
    rating: Joi.number().min(1).max(5).required(),
    comment: Joi.string().max(500).allow('')
  })
};

export const walletValidation = {
  addMoney: Joi.object({
    amount: Joi.number().min(1).max(100000).required(),
    paymentMethod: Joi.string().valid('card', 'upi', 'netbanking').required()
  })
};

export const menuValidation = {
  addMenuItem: Joi.object({
    name: Joi.string().min(3).max(100).required(),
    description: Joi.string().max(500).allow(''),
    price: Joi.number().min(1).max(10000).required(),
    category: Joi.string().valid('breakfast', 'lunch', 'snacks', 'beverages', 'desserts', 'special').required(),
    canteen: Joi.string().required().hex().length(24),
    preparationTime: Joi.number().min(5).max(120),
    spiceLevel: Joi.string().valid('mild', 'medium', 'spicy'),
    ingredients: Joi.array().items(Joi.string()),
    tags: Joi.array().items(Joi.string())
  }),

  updateMenuItem: Joi.object({
    name: Joi.string().min(3).max(100),
    description: Joi.string().max(500),
    price: Joi.number().min(1).max(10000),
    category: Joi.string().valid('breakfast', 'lunch', 'snacks', 'beverages', 'desserts', 'special'),
    isAvailable: Joi.boolean(),
    preparationTime: Joi.number().min(5).max(120),
    spiceLevel: Joi.string().valid('mild', 'medium', 'spicy')
  })
};

export const authValidation = {
  signup: Joi.object({
    name: Joi.string().min(3).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(50).required(),
    phone: Joi.string().pattern(/^[0-9]{10}$/).required(),
    universityId: Joi.string().required(),
    role: Joi.string().valid('student', 'staff', 'faculty'),
    department: Joi.string().max(100)
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  })
};

export const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }
    
    next();
  };
};
