const mongoose = require("mongoose");

const userSchema  = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"]
    },
    phone:{
        type: String,
        required: [true, "Phone number is required"],
        unique: true
    }
})

const User = mongoose.model("User", userSchema);
module.exports = User;
