const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const Email = require('./../utils/email');

const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
};

const createSendToken = (user, statusCode, req, res) => {
    const token = signToken(user._id);

    res.cookie('jwt', token, {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
        sameSite: 'lax',  // Farklı domainler arası cookie gönderimi için
        secure: req.secure || req.headers['x-forwarded-proto'] === 'https'
    }); 

    // Remove password from output
    user.password = undefined;

    // 4) Log the user in, send JWT
    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
    })
}

exports.signup = catchAsync(async (req, res, next) => {    
    // Check if user with this email already exists
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
        return next(new AppError('Email already in use. Please use a different email address.', 400));
    }
    
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        role: req.body.role
    });
    const url = `${req.protocol}://${req.get('host')}/me`;

    await new Email(newUser, url).sendWelcome();
    
    // Always return a response to avoid hanging requests
    return createSendToken(newUser, 201, req, res);
});

exports.login = catchAsync(async (req, res, next) => {
    const {email, password} = req.body;

    // 1) Check if email and password exist
    if (!email || !password) {
        return next(new AppError('Please provide email and password!', 400));
    }

    // 2) Check if user exists and password is correct
    const user = await User.findOne({email}).select('+password');

    const correct = await user.correctPassword(password, user.password);

    if (!user || !correct) {
        return next(new AppError('Incorrect email or password', 401));
    }

    createSendToken(user, 200, req, res);
});


exports.logout = catchAsync(async (req, res, next) => {
    res.cookie('jwt', 'loggedout', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });
    res.status(200).json({
        status: 'success'
    })
})

exports.protect = catchAsync(async (req, res, next) => {
    // 1) Getting token and check of it's there
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
        // JWT'yi cookie'den al
        token = req.cookies.jwt;
    }

    if (!token){
        return next(new AppError('You are not logged in! Please log in to get access.', 401));
    }
    
    try {
        // 2) Verification token
        const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
        
        // 3) Check if user still exists
        const freshUser = await User.findById(decoded.id);
        if (!freshUser) {
            return next(new AppError('User belonging to this token does no longer exist.', 401));
        }

        // 4) Check if user changed password after the token was issued
        if (freshUser.changedPasswordAfter(decoded.iat)) {
            return next(new AppError('User recently changed password! Please log in again.', 401));
        }
        
        // GRANT ACCESS TO PROTECTED ROUTE
        req.user = freshUser;
        // Pug template'leri için user bilgisini locals'a ekle
        res.locals.user = freshUser;
        next();
    } catch (err) {
        return next(new AppError('Invalid token. Please log in again!', 401));
    }
});

exports.isLoggedIn = async (req, res, next) => {
    try {
        if (req.cookies.jwt) {
            // 1) Verify token
            const decoded = await promisify(jwt.verify)(
                req.cookies.jwt, 
                process.env.JWT_SECRET
            );
            
            // 2) Check if user still exists
            const currentUser = await User.findById(decoded.id);
            if (!currentUser) {
                return next();
            }

            // 3) Check if user changed password after the token was issued
            if (currentUser.changedPasswordAfter(decoded.iat)) {
                return next();
            }
        
            // THERE IS A LOGGED IN USER
            res.locals.user = currentUser;
            return next();
        }
        next();
    } catch (err) {
        // Token doğrulama hatası - cookie geçerli değil
        return next();
    }
};

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new AppError('You do not have permission to perform this action', 403));
        }
        next();
    }
}

exports.forgotPassword = catchAsync(async (req, res, next) => {
    // 1) Get user based on POSTed email
    const user = await User.findOne({email: req.body.email});
    if (!user) {
        return next(new AppError('There is no user with email address.', 404));
    }
    // 2) Generate the random reset token
    
    const resetToken = user.createPasswordResetToken();
    await user.save({validateBeforeSave: false});
    
    // 3) Send it to user's email
    try {
        const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

        await new Email(user, resetURL).sendPasswordReset();
        res.status(200).json({
            status: 'success',
            message: 'Token sent to email!'
        })
    } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({validateBeforeSave: false});
        return next(new AppError('There was an error sending the email. Try again later!', 500));
    }
})

exports.resetPassword = catchAsync(async (req, res, next) => {
    // 1) Get user based on the token
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: {$gt: Date.now()}
    });

    // 2) If token has not expired, and there is user, set the new password
    if (!user) {
        return next(new AppError('Token is invalid or has expired', 400));
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // 3) Update changedPasswordAt property for the user
    const token = signToken(user._id);

    // 4) Log the user in, send JWT
    res.status(200).json({
        status: 'success',
        token,
    })
})

exports.updatePassword = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user.id).select('+password');
    if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
        return next(new AppError('Your current password is incorrect.', 401));
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;

    await user.save();

    createSendToken(user, 200, req, res);
    
})
