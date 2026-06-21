const mongoose = require("mongoose");
const { kMaxLength } = require("node:buffer");

function generateDataId(){
    return Math.random().toString(36).substring(2 , 10);
}

const hiddenDataSchema = new mongoose.Schema({
    title : {
        type : String,
        required : true,
        maxlength : 100
    }  , 
    hiddenData : {
        type : String ,
        required : true,
    } , 
    dataId : {
        type : String,
        required : true , 
        default : generateDataId
    } , 
    pass : {
        type : String,
        required : true , 
        minlength : 4 , 
    } ,
    owner : {
        type : mongoose.Schema.Types.ObjectId,
        ref: "User"
    } 
}, {
    timestamps: true
}    
);

const HiddenData = mongoose.model("Hidden_data" , hiddenDataSchema);

module.exports = HiddenData;