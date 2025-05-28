const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

module.exports = class Email {
    constructor(user, url) {
        this.to = user.email;
        this.firstName = user.name.split(' ')[0];
        this.url = url;
        this.from = `Ahmet Resul <${process.env.EMAIL_FROM}>`;
    }

    newTransport() {
        if (process.env.NODE_ENV === 'production') {
            // Sendgrid
            return nodemailer.createTransport({
                service: 'SendGrid',
                auth: {
                    user: process.env.SENDGRID_USERNAME,
                    pass: process.env.SENDGRID_PASSWORD
                }
            });
        }
        // Always use mailtrap in development
        return nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD
            }
        });
    }
    
    async send(template, subject) {
        try {
            // 1) Render HTML based on a pug template        
            const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
                firstName: this.firstName,
                url: this.url,
                subject
            });


            const mailOptions = {
                from: this.from,
                to: this.to,
                subject,
                html,
                text: htmlToText.convert(html)
            };

            
            // 3) Create a transport and send email
            const transport = this.newTransport();
            // Set timeout to avoid hanging connections
            const result = await transport.sendMail(mailOptions);
            return result;
        } catch (error) {
            throw new Error(`Could not send ${template} email: ${error.message}`);
        }
    }

    async sendWelcome() {
        await this.send('welcome', 'Welcome to the Natours Family!');
    }

    async sendPasswordReset() {
        await this.send('passwordReset', 'Your password reset token (valid for only 10 minutes)');
    }
}