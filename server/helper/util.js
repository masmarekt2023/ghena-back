const jwt = require("jsonwebtoken");
const cloudinary = require('cloudinary').v2;
require("dotenv").config();
const ethers = require('ethers');
// Simple Cloudinary configuration
cloudinary.config({
    cloud_name: 'marvelouse-agency-of-support',
    api_key: '455723237167783',
    api_secret: 'EBn5oevs8bEBCLj6J5_UdtPhGmk'
});

module.exports = {
    getToken: async (payload) => {
        try {
            const token = jwt.sign(payload, process.env.JWT_SECRET || 'your-jwt-secret', { expiresIn: '24h' });
            return token;
        } catch (error) {
            console.error("Error generating token:", error);
            throw error;
        }
    },

    // Verify JWT Token
    verifyToken: async (token) => {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-jwt-secret');
            return decoded;
        } catch (error) {
            console.error("Error verifying token:", error);
            throw error;
        }
    },
    generateETHWallet: () => {
        try {
            const wallet = ethers.Wallet.createRandom();
            return {
                address: wallet.address,
                privateKey: wallet.privateKey
            };
        } catch (error) {
            console.error("Error generating ETH wallet:", error);
            throw error;
        }
    },
   
  getReferralCode() {
    var x = "";
    var characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < 8; i++) {
      x += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return x;
  },
    getImageUrl: async (files) => {
        try {
            if (!files || files.length === 0) {
                throw new Error("No files provided");
            }
            const result = await cloudinary.uploader.upload(files[0].path, {
                resource_type: "auto",
            });
            return result.secure_url;
        } catch (error) {
            console.error("Error uploading to Cloudinary:", error);
            throw error;
        }
    },

    getImageUrls: async (files) => {
        try {
            let urls = [];
            for (let i = 0; i < Math.min(files.length, 9); i++) {
                const result = await cloudinary.uploader.upload(files[i].path, {
                    resource_type: "auto"
                });
                urls.push(result.secure_url);
            }
            return urls;
        } catch (error) {
            console.error("Error uploading images:", error);
            throw error;
        }
    },

    getSecureUrl: async (base64) => {
        try {
            const result = await cloudinary.uploader.upload(base64);
            return result.secure_url;
        } catch (error) {
            console.error("Error uploading base64 image:", error);
            throw error;
        }
    },
    generateRandomString: (length = 8) => {
        try {
            return crypto.randomBytes(length).toString('hex');
        } catch (error) {
            console.error("Error generating random string:", error);
            throw error;
        }
    },

    // Hash Password
    hashPassword: async (password) => {
        try {
            const salt = await bcrypt.genSalt(10);
            return await bcrypt.hash(password, salt);
        } catch (error) {
            console.error("Error hashing password:", error);
            throw error;
        }
    },

    // Compare Password
    comparePassword: async (password, hashedPassword) => {
        try {
            return await bcrypt.compare(password, hashedPassword);
        } catch (error) {
            console.error("Error comparing passwords:", error);
            throw error;
        }
    },

    // Format Date
    formatDate: (date) => {
        try {
            return new Date(date).toISOString();
        } catch (error) {
            console.error("Error formatting date:", error);
            throw error;
        }
    },

    // Validate Email
    validateEmail: (email) => {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    },

    // Sanitize Input
    sanitizeInput: (input) => {
        if (typeof input !== 'string') return input;
        return input.replace(/[<>]/g, '');
    },

    // Generate OTP
    generateOTP: (length = 6) => {
        try {
            return Math.floor(100000 + Math.random() * 900000).toString();
        } catch (error) {
            console.error("Error generating OTP:", error);
            throw error;
        }
    },

    // Calculate Pagination
    getPagination: (page = 1, limit = 10) => {
        const skip = (page - 1) * limit;
        return {
            skip,
            limit: parseInt(limit)
        };
    }
};