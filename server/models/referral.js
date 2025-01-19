const Mongoose = require("mongoose");

const mongoosePaginate = require("mongoose-paginate-v2");

const mongooseAggregatePaginate = require("mongoose-aggregate-paginate");
const status = require("../enums/status");

const {Schema} = Mongoose;

const options = {
  collection: "referral",
  timestamps: true,
};

const referralSchema = new Schema(
  {
    referralAmount: {
      type: Number,
    },
    refereeAmount: {
      type: Number,
    },
    coin: { type: String },
    status: { type: String, default: status.ACTIVE },
  },
  options
);
referralSchema.plugin(mongoosePaginate);
referralSchema.plugin(mongooseAggregatePaginate);
 const Referral = Mongoose.model("referral", referralSchema);

 (async () => {
   try {
     // Check if referrals already exist
     const result = await Referral.find({ status: { $ne: status.DELETE } });
 
     if (result.length !== 0) {
       console.log("Default referral already created.");
     } else {
       const obj = {
         coin: "MAS",
         referralAmount: 100,
         refereeAmount: 50,
       };
 
       // Create a new referral record
       const createdReferral = await Referral.create(obj);
       console.log("Default referral created:", createdReferral);
     }
   } catch (error) {
     console.log("Error creating default referral:", error);
   }
 })();
module.exports =  Referral;

// Mongoose.model("referral", referralSchema).find(
//   { status: { $ne: status.DELETE } },
//   async (err, result) => {
//     if (err) {
//       console.log("Default referral creation error", err);
//     } else if (result.length != 0) {
//       console.log("Default referral already created.");
//     } else {
//       let obj = {
//         coin: "MAS",
//         referralAmount: 100,
//         refereeAmount: 50,
//       };
//       Mongoose.model("referral", referralSchema).create(
//         obj,
//         (err1, staticResult) => {
//           if (err1) {
//             console.log("Default referral error.", err1);
//           } else {
//             console.log("Default referral created.", staticResult);
//           }
//         }
//       );
//     }
//   }
// );
