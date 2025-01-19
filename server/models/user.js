const bcrypt = require("bcryptjs");
const Mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const mongooseAggregatePaginate = require("mongoose-aggregate-paginate");
const userType = require("../enums/userType");
const status = require("../enums/status");
const commonFunction = require("../helper/util");

const options = {
  collection: "user",
  timestamps: true,
};

const { Schema } = Mongoose;

const userModel = new Schema(
  {
    walletAddress: { type: String, unique: true },
    ethAccount: {
      address: { type: String },
      privateKey: { type: String },
    },
    ip: { type: String },
    firstName: { type: String },
    lastName: { type: String },
    name: { type: String, required: true },
    userName: { type: String, unique: true, required: true },
    email: { type: String, unique: true, required: true, match: /\S+@\S+\.\S+/ },
    phone: { type: String, unique: true },
    profilePic: { type: String, default: "" },
    coverPic: { type: String },
    masPageUrl: { type: String },
    speciality: { type: String, default: "" },
    bio: { type: String, default: "" },
    facebook: { type: String, default: "" },
    twitter: { type: String, default: "" },
    youtube: { type: String, default: "" },
    telegram: { type: String, default: "" },
    countryCode: { type: String },
    userType: { type: String, default: userType.USER },
    socialId: { type: String },
    socialType: { type: String },
    password: { type: String, required: true },
    planType: { type: String, default: "Basic" },
    base32: { type: String },
    deviceToken: { type: String },
    deviceType: { type: String },
    referralCode: { type: String },
    isReset: { type: Boolean },
    emailVerification: { type: Boolean, default: false },
    phoneVerification: { type: Boolean, default: false },
    blockStatus: { type: Boolean, default: false },
    isUpdated: { type: Boolean, default: false },
    isNewUser: { type: Boolean, default: true },
    masBalance: { type: Number, default: 0 },
    usdtBalance: { type: Number, default: 0 },
    bnbBalance: { type: Number, default: 0 },
    fdusdBalance: { type: Number, default: 0 },
    referralUserId: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
    supporters: [
      {
        type: Schema.Types.ObjectId,
        ref: "user",
      },
    ],
    likesUsers: [
      {
        type: Schema.Types.ObjectId,
        ref: "user",
      },
    ],
    following: [
      {
        type: Schema.Types.ObjectId,
        ref: "user",
      },
    ],
    followers: [
      {
        type: Schema.Types.ObjectId,
        ref: "user",
      },
    ],
    subscribeNft: [
      {
        type: Schema.Types.ObjectId,
        ref: "nft",
      },
    ],
    likesNft: [
      {
        type: Schema.Types.ObjectId,
        ref: "nft",
      },
    ],
    likesAuctionNft: [
      {
        type: Schema.Types.ObjectId,
        ref: "auctionNft",
      },
    ],
    likesFeed: [
      {
        type: Schema.Types.ObjectId,
        ref: "audience",
      },
    ],
    permissions: {
      dashboard: { type: Boolean, default: false },
      userManagement: { type: Boolean, default: false },
      subAdminManagement: { type: Boolean, default: false },
      settingsManagement: { type: Boolean, default: false },
      bannerManagement: { type: Boolean, default: false },
      bannerAppManagement: { type: Boolean, default: false },
      referralManagement: { type: Boolean, default: false },
      staticManagement: { type: Boolean, default: false },
    },
    status: { type: String, default: status.ACTIVE },
    bannerDuration: Number,
    bannerAppDuration: Number,
  },
  options
);

userModel.plugin(mongoosePaginate);
userModel.plugin(mongooseAggregatePaginate);

const User = Mongoose.models.user || Mongoose.model("user", userModel);

// Initialize default admin
(async () => {
  try {
    const adminExists = await User.findOne({ userType: userType.ADMIN });

    if (adminExists) {
      console.log("Default admin already created.");
      return;
    }

    const userETHWallet = commonFunction.generateETHWallet();
 
    const adminData = {
      name: "admin",
      userName: "admin",
      email: "masmarket2023@gmail.com",
      password: bcrypt.hashSync("MasMarket2023", bcrypt.genSaltSync(12)),
      ethAccount: {
        address: userETHWallet.address.toLowerCase(),
        privateKey: userETHWallet.privateKey,
      },
      walletAddress: userETHWallet.address,
      referralCode: await commonFunction.getReferralCode(),
      userType: userType.ADMIN,
      status: status.ACTIVE,
      bannerDuration: 10,
      bannerAppDuration: 10,
      permissions: {
        dashboard: true,
        userManagement: true,
        subAdminManagement: true,
        settingsManagement: true,
        bannerManagement: true,
        bannerAppManagement: true,
        referralManagement: true,
        staticManagement: true,
      },
    };

    const newAdmin = await User.create(adminData);
    console.log("Default admin created:", newAdmin);
  } catch (error) {
    console.error("Error creating default admin:", error.message, error.stack);
  }
})();

module.exports = User;
