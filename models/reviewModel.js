// review / rating / createdAt/ ref to tour / ref to user

const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    review: {
        type: String,
        required: [true, 'Review can not be empty!'],
        trim: true // Add trim to remove whitespace
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: [true, 'Review must have a rating'] // Add required for rating
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'Review must belong to a tour.'],
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Review must belong to a user.'],
    },
},
{
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});

// Add index for preventing duplicate reviews
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

// Add populate middleware
reviewSchema.pre(/^find/, function(next) {
    this.populate({
        path: 'user',
        select: 'name photo'
    });
    next();
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;