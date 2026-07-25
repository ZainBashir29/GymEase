// import User from "./userModel.js";
// import mongoose from "mongoose";

// const trainerSchema = new mongoose.Schema({
//     expertise: {
//         type: String,
//         required: true,
//         trim: true,
//     },
//     isAvailable: {
//         type: Boolean,
//         default: true,
//     },
// });

// const Trainer = User.discriminator(
//     "Trainer",
//     trainerSchema
// );

// export default Trainer;
//-----------------------------------Updation------------------------------
import User from "./userModel.js";
import mongoose from "mongoose";

const trainerSchema = new mongoose.Schema({
  expertise: {
    type: String,
    required: true,
    trim: true,
  },

  isAvailable: {
    type: Boolean,
    default: true,
  },
});

const Trainer = User.discriminator("Trainer", trainerSchema);

export default Trainer;
