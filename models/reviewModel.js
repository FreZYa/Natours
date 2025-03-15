// review / rating / createdAt/ ref to tour / ref to user

const mongoose = require('mongoose');
const Tour = require('./tourModel');

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

// Add populate middleware
reviewSchema.pre(/^find/, function(next) {
    this.populate({
        path: 'tour',
        select: 'name'
    }).populate({
        path: 'user',
        select: 'name photo'
    });
    next();
});

reviewSchema.statics.calcAverageRatings = async function(tourId) {
    const stats = await this.aggregate([
        {
            $match: { tour: tourId }
        },
        {
            $group: {
                _id: '$tour',
                nRating: { $sum: 1 },
                avgRating: { $avg: '$rating'}
            }
        }
    ]);

    await Tour.findByIdAndUpdate(tourId, {
        ratingsQuantity: stats[0].nRating,
        ratingsAverage: stats[0].avgRating
    });
};

// 'save' yerine, 'save' sonrası çalışacak bir middleware
reviewSchema.post('save', function() {
    // this points to current review
    this.constructor.calcAverageRatings(this.tour);
});

// Yorumlar silindiğinde veya güncellendiğinde de ortalamı güncelle
// Veya benzersiz olmayan bir index kullanın
reviewSchema.index({ tour: 1, user: 1 });

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;