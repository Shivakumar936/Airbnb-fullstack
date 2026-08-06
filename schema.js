const Joi = require('joi');
const review = require('./models/review');

module.exports.listingSchema = Joi.object({
    listing: Joi.object({
        title: Joi.string().required(),            // Must be a non-empty string
        description: Joi.string().required(),      // Must be a non-empty string
        location: Joi.string().required(),         // Must be a non-empty string
        country: Joi.string().required(),          // Must be a non-empty string
        price: Joi.number().required().min(0),     // Must be a number ≥ 0
        image: Joi.string().allow("", null)        // Allows empty string or null
    }).required()
});


module.exports.reviewSchema = Joi.object({
    review:Joi.object({
        rating:Joi.number().required().min(1).max(5),
        comment:Joi.string().required(),
    }).required(),
});