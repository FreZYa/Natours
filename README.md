# Natours

Natours is a full-featured tour booking application built with Node.js, Express, MongoDB, and modern JavaScript. It allows users to browse available tours, make bookings, process payments via Stripe, and manage their profiles.

## Features

- **User Authentication & Authorization**
  - Sign up, login, and password reset
  - User roles with different access permissions
  - JWT-based authentication

- **Tour Features**
  - Browse available tours
  - Advanced filtering and sorting
  - Interactive maps with tour locations
  - User reviews and ratings

- **Booking System**
  - Secure credit card payments with Stripe
  - Booking confirmation
  - My Tours page for users to see their bookings

- **User Account**
  - Update profile information
  - Change password
  - Upload profile photo

## Technologies Used

- **Backend**
  - Node.js & Express.js
  - MongoDB & Mongoose
  - JWT Authentication
  - RESTful API architecture

- **Frontend**
  - Pug templates
  - CSS
  - JavaScript (Parcel for bundling)
  - Leaflet.js for maps

- **Payment Processing**
  - Stripe API

- **Deployment & Infrastructure**
  - Heroku

## Installation

1. Clone the repository
   ```
   git clone <repository-url>
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Set up environment variables in a `config.env` file
   ```
   NODE_ENV=development
   PORT=3000
   DATABASE=<your_mongodb_connection_string>
   DATABASE_PASSWORD=<your_password>
   
   JWT_SECRET=<your_jwt_secret>
   JWT_EXPIRES_IN=90d
   JWT_COOKIE_EXPIRES_IN=90
   
   EMAIL_USERNAME=<your_email_username>
   EMAIL_PASSWORD=<your_email_password>
   EMAIL_HOST=<email_host>
   EMAIL_PORT=<email_port>
   
   STRIPE_SECRET_KEY=<your_stripe_secret_key>
   STRIPE_WEBHOOK_SECRET=<your_stripe_webhook_secret>
   ```

4. Run the application in development mode
   ```
   npm run dev
   ```

## Available Scripts

- `npm run start` - Start the server in production mode
- `npm run start:prod` - Start the server in production mode with nodemon
- `npm run dev` - Run the application in development mode with JS bundling
- `npm run watch:js` - Watch for JS changes and bundle with Parcel
- `npm run build:js` - Build JS files for production
- `npm run debug` - Run the application in debug mode

## API Documentation

The API provides endpoints for tours, users, reviews, and bookings:

- **Tours**
  - GET /api/v1/tours - Get all tours
  - GET /api/v1/tours/:id - Get a specific tour
  - POST /api/v1/tours - Create a new tour (admin only)
  - PATCH /api/v1/tours/:id - Update a tour (admin only)
  - DELETE /api/v1/tours/:id - Delete a tour (admin only)

- **Users**
  - POST /api/v1/users/signup - Sign up
  - POST /api/v1/users/login - Login
  - GET /api/v1/users/me - Get current user
  - PATCH /api/v1/users/updateMe - Update user data
  - PATCH /api/v1/users/updateMyPassword - Update password

- **Bookings**
  - GET /api/v1/bookings - Get all bookings (admin only)
  - GET /api/v1/bookings/:id - Get a specific booking
  - POST /api/v1/bookings - Create a new booking
  - GET /api/v1/tours/:tourId/bookings - Get all bookings for a tour (admin only)

## Deployment

The application is configured for deployment on Heroku:

1. Create a new Heroku app
   ```
   heroku create
   ```

2. Set environment variables on Heroku
   ```
   heroku config:set NODE_ENV=production
   heroku config:set DATABASE=<your_mongodb_connection_string>
   heroku config:set DATABASE_PASSWORD=<your_password>
   ... (all other environment variables)
   ```

3. Push to Heroku
   ```
   git push heroku master
   ```

## License

ISC

## Author

Built as part of a Node.js learning project. 