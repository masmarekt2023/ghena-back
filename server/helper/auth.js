require('dotenv').config({ path: 'config.env' });
const jwt = require("jsonwebtoken");
const userModel = require("../models/user");
const apiError = require("./apiError");
const responseMessage = require("../../assets/responseMessage");
const response = require("../../assets/response");

module.exports = {
  verifyToken: async (req, res, next) => {
    try {
      if (req.headers.token) {
        // Use JWT_SECRET from environment variables
        let result = jwt.verify(
          req.headers.token,
          process.env.JWT_SECRET
        );
        if (result) {
          let user = await userModel.findOne({ _id: result.id });
          if (!user) {
            return apiError.notFound(responseMessage.USER_NOT_FOUND);
          } else {
            if(user.status === 'BLOCK' || user.blockStatus === true){
              return res.status(403).json(new response({}, responseMessage.BLOCKED_NOT_ALLOWED));
            }
            req.userId = result.id;
            req.userDetails = result;
            next();
          }
        } 
      } else {
        return res.send(apiError.badRequest(responseMessage.NO_TOKEN));
      }
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json(new response({}, 'Invalid token'));
      }
      return next(error);
    }
  },

  verifyTokenBySocket: (token) => {
    return new Promise((resolve, reject) => {
      try {
        if (token) {
          // Use JWT_SECRET from environment variables
          jwt.verify(token, process.env.JWT_SECRET, (err, result) => {
            if (err) {
              reject(err);
            } else {
              userModel.findOne({ _id: result.id })
                .then(user => {
                  if (!user) {
                    reject(responseMessage.USER_NOT_FOUND);
                  } else if (user.status == "BLOCK") {
                    reject(responseMessage.BLOCK_BY_ADMIN);
                  } else if (user.status == "DELETE") {
                    reject(responseMessage.DELETE_BY_ADMIN);
                  } else {
                    resolve(user);
                  }
                })
                .catch(error => {
                  reject(responseMessage.INTERNAL_ERROR);
                });
            }
          });
        } else {
          reject(responseMessage.NO_TOKEN);
        }
      } catch (e) {
        reject(e);
      }
    });
  },
};