const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');

exports.getAllUsers = catchAsync(async (req, res, next) => {
    const users = await User.find();

    // Send response
    res.status(200).json({
        status: 'success',
        results: users.length,
        data: {
            users,
        }
    });
});

exports.getUser = (req, res) => {
    res.status(500).json({
        status: 'err',
        message: 'This route is not yet definet',
    });
};

exports.createUser = (req, res) => {
    res.status(500).json({
        status: 'err',
        message: 'This route is not yet definet',
    });
};

exports.updateUser = (req, res) => {
    res.status(500).json({
        status: 'err',
        message: 'This route is not yet definet',
    });
};

exports.deleteUser = (req, res) => {
    res.status(500).json({
        status: 'err',
        message: 'This route is not yet definet',
    });
};
