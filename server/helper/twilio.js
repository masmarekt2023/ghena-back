const twilio = require('twilio');
require('dotenv').config({ path: 'config.env' });

// Initialize Twilio client with error handling
const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

class Twilio {
    static async sendVerification(to, channel = 'email', type = 'register', userName = '') {
        try {
            const verification = await client.verify.v2
                .services(process.env.TWILIO_VERIFY_SID)
                .verifications.create({ to, channel });
            return verification;
        } catch (error) {
            console.error('Twilio sendVerification error:', error);
            return {
                status: error.status || 400,
                message: error.message
            };
        }
    }

    static async checkVerification(to, code) {
        try {
            const verification_check = await client.verify.v2
                .services(process.env.TWILIO_VERIFY_SID)
                .verificationChecks.create({ to, code });
            return verification_check;
        } catch (error) {
            console.error('Twilio checkVerification error:', error);
            return {
                status: error.status || 400,
                message: error.message,
                valid: false
            };
        }
    }
}

module.exports = Twilio;