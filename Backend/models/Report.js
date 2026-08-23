const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
{
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },

    url:String,

    performance:Number,

    accessibility:Number,

    seo:Number,

    bestPractices:Number,

    pwa:Number
},
{
    timestamps:true
});

module.exports = mongoose.model("Report",reportSchema);