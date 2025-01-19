const Mongoose = require("mongoose");
const status = require("../enums/status");

const options = {
  collection: "social",
  timestamps: true,
};

const {Schema} = Mongoose;
const schemaDefination = new Schema(
  {
    title: { type: String },
    link: { type: String },
    status: { type: String, default: status.ACTIVE },
  },
  options
);

const Social = Mongoose.model("social", schemaDefination);


(async () => {
  try {
    // Check if social links already exist
    const result = await Social.find({ status: { $ne: status.DELETE } });

    if (result.length !== 0) {
      console.log("Default social already created.");
    } else {
      const socialLinks = [
        { title: "Facebook", link: "https://www.facebook.com/" },
        { title: "Twitter", link: "https://twitter.com/" },
        { title: "Youtube", link: "https://www.youtube.com/" },
        { title: "Telegram", link: "https://www.telegram.com/" },
        { title: "Medium", link: "https://medium.com/" },
      ];

      // Create the social links in the database
      const createdSocials = await Social.create(socialLinks);
      console.log("Default social links created:", createdSocials);
    }
  } catch (error) {
    console.log("Error creating default social links:", error);
  }
})();
module.exports =  Social;

// Mongoose.model("social", schemaDefination).find(
//   { status: { $ne: status.DELETE } },
//   async (err, result) => {
//     if (err) {
//       console.log("Default social creation error", err);
//     } else if (result.length != 0) {
//       console.log("Default social already created.");
//     } else {
//       let obj1 = {
//         title: "Facebook",
//         link: "https://www.facebook.com/",
//       };
//       let obj2 = {
//         title: "Twitter",
//         link: "https://twitter.com/",
//       };
//       let obj3 = {
//         title: "Youtube",
//         link: "https://www.youtube.com/",
//       };
//       let obj4 = {
//         title: "Telegram",
//         link: "https://www.telegram.com/",
//       };
//       let obj5 = {
//         title: "Medium",
//         link: "https://medium.com/",
//       };
//       Mongoose.model("social", schemaDefination).create(
//         obj1,
//         obj2,
//         obj3,
//         obj4,
//         obj5,
//         (err1, staticResult) => {
//           if (err1) {
//             console.log("Default social error.", err1);
//           } else {
//             console.log("Default social created.", staticResult);
//           }
//         }
//       );
//     }
//   }
// );