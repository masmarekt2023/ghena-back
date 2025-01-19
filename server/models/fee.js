const Mongoose = require("mongoose");

const mongoosePaginate = require("mongoose-paginate-v2");

const mongooseAggregatePaginate = require("mongoose-aggregate-paginate");
const status = require("../enums/status");


const {Schema} = Mongoose;

const options = {
  collection: "fee",
  timestamps: true,
};

const feeSchema = new Schema(
  {
    planType: {
      type: String,
    },
    masHeld: {
      type: Number,
    },
    contentCreatorFee: { type: Number },
    clientFee: { type: Number },
    status: { type: String, default: status.ACTIVE },
  },
  options
);
feeSchema.plugin(mongoosePaginate);
feeSchema.plugin(mongooseAggregatePaginate);
const Fee = Mongoose.model("fee", feeSchema);

(async () => {
  try {
    const existingFees = await Fee.find({ status: { $ne: status.DELETE } });

    if (existingFees.length > 0) {
      console.log("Default fees already created.");
    } else {
      const defaultFees = [
        {
          planType: "Basic",
          masHeld: 0,
          contentCreatorFee: 3,
          clientFee: 0,
        },
        {
          planType: "Silver",
          masHeld: 100,
          contentCreatorFee: 2.5,
          clientFee: 0,
        },
        {
          planType: "Gold",
          masHeld: 250,
          contentCreatorFee: 2,
          clientFee: 0,
        },
        {
          planType: "Diamond",
          masHeld: 1500,
          contentCreatorFee: 1.5,
          clientFee: 0,
        },
        {
          planType: "Mas Plus",
          masHeld: 10000,
          contentCreatorFee: 1,
          clientFee: 0,
        },
      ];

      const result = await Fee.insertMany(defaultFees);
      console.log("Default fees created successfully:", result);
    }
  } catch (error) {
    console.error("Error creating default fees:", error);
  }
})();
module.exports = Fee;

// Mongoose.model("fee", feeSchema).find(
//   { status: { $ne: status.DELETE } },
//   async (err, result) => {
//     if (err) {
//       console.log("Default fee creation error", err);
//     } else if (result.length != 0) {
//       console.log("Default fee already created.");
//     } else {
//       let obj1 = {
//         planType: "Basic",
//         masHeld: 0,
//         contentCreatorFee: 3,
//         clientFee: 0,
//       };
//       let obj2 = {
//         planType: "Silver",
//         masHeld: 100,
//         contentCreatorFee: 2.5,
//         clientFee: 0,
//       };
//       let obj3 = {
//         planType: "Gold",
//         masHeld: 250,
//         contentCreatorFee: 2,
//         clientFee: 0,
//       };
//       let obj4 = {
//         planType: "Diamond",
//         masHeld: 1500,
//         contentCreatorFee: 1.5,
//         clientFee: 0,
//       };
//       let obj5 = {
//         planType: "Mas Plus",
//         masHeld: 10000,
//         contentCreatorFee: 1,
//         clientFee: 0,
//       };
//       Mongoose.model("fee", feeSchema).create(
//         obj1,
//         obj2,
//         obj3,
//         obj4,
//         obj5,
//         (err1, staticResult) => {
//           if (err1) {
//             console.log("Default fee error.", err1);
//           } else {
//             console.log("Default fee created.", staticResult);
//           }
//         }
//       );
//     }
//   }
// );
