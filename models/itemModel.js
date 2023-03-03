const mongoose = require("mongoose");

const itemSchema = mongoose.Schema({
    barcodeId : String,
    brand : String,
    name : String,
    weight : String,
    storeCount : Number,
    trolleyCnt: Number,
    price : Number,
    image : {
        data : Buffer,
        contentType : String
    }

})

const Item = new mongoose.model("item",itemSchema);

const trollySchema = mongoose.Schema({
    trolleyName : String,
    items : [itemSchema]
})

const Trolley = new mongoose.model("trolley",trollySchema);

module.exports = {Item, Trolley};

