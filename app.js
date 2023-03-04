const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const models = require('./models/itemModel');
const request = require("request");
const http = require("http");
const dotenv = require("dotenv");


const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static("public"))
app.set('view engine', 'ejs');

dotenv.config();

mongoose.connect("mongodb+srv://MaheshMali:" + process.env.PASSWORD + "@webkartcluster.hxk0dj9.mongodb.net/storeDB");
// mongoose.connect("mongodb://localhost:27017/storeDB");

app.get("/", (req, res) => {
    res.send("<h1>Welcome to our store. Enjoy Shopping in smart way!!</h1>");
})

app.get("/server/:serverNo/:barcodeId", (req, res) => {
    const serverNo = req.params.serverNo;

    const trolleyNo = "trolley"+serverNo;
    
    console.log("request for item addition");
    console.log("request from server : " + serverNo);

    const productId = req.params.barcodeId;;

    models.Trolley.findOne({ trolleyName: trolleyNo })
        .then((foundTrolley) => {
            models.Item.find({ barcodeId: productId })
                .then((foundProduct) => {
                    if (foundProduct.length === 0) {
                        console.log("Product with prouductId : " + productId + " is not present in store. Please check productId.");
                    }
                    else {

                        if (foundTrolley === null) {
                            newtrolly = new models.Trolley({
                                trolleyName: trolleyNo,
                                items: foundProduct
                            });

                            newtrolly.save();
                            res.send("added product successfully.");
                        }
                        else {
                            let flag = false;
                            var queryCode = foundProduct[0].barcodeId;

                            foundTrolley.items.forEach((item) => {
                                if (queryCode === item.barcodeId) {
                                    item.trolleyCnt += 1;
                                    flag = true;

                                }
                            })
                            if (!flag) {
                                foundTrolley.items.push(foundProduct[0]);
                            }

                            foundTrolley.save();
                            
                            res.send("added product successfully.");

                        }
                    }


                })
                .catch((err) => {
                    console.log(err);
                })
        })
        .catch((err) => {
            console.log(err);
        })

})

app.get("/:trolleyName", (req, res) => {
    const trolleyName = req.params.trolleyName;


    if (trolleyName[6] === "y") {
        console.log("resquest for trolley : " + trolleyName);

        models.Trolley.findOne({ trolleyName: trolleyName })
            .then((foundTrolley) => {
                if (foundTrolley === null) {
                    res.render("trolley", { items: [], trolleyName: trolleyName });
                }
                else {
                    res.render("trolley", { items: foundTrolley.items, trolleyName: trolleyName });
                }
            })
            .catch((err) => {
                console.log(err);
            })


    }
    else {

        console.log("request for server" + trolleyName);

        const trolleyNumber = parseInt(trolleyName.slice(6));

        res.render("server", { trolleyName: trolleyName });

    }
})


app.post("/delete", (req, res) => {


    const trolleyNameDel = req.body.trolleyName;
    const barcodeIdDel = req.body.productId;

    console.log("request for product deletion.");
    console.log(req.body);

    models.Trolley.findOneAndUpdate(
        { trolleyName: trolleyNameDel },
        { $pull: { items: { barcodeId: barcodeIdDel } } })

        .then(() => {
            res.redirect("/" + trolleyNameDel);
        })
        .catch((err) => {
            console.log(err);
        })
})

app.post("/reduce", (req, res) => {

    const trolleyNameDel = req.body.trolleyName;
    const barcodeIdDel = req.body.productId;

    console.log("request for product count reduce");
    console.log(req.body);

    models.Trolley.findOne({ trolleyName: trolleyNameDel })
        .then((foundTrolley) => {

            let flag = false;
            let ind = 0;


            foundTrolley.items.forEach((item) => {
                ind++;
                if (barcodeIdDel === item.barcodeId) {
                    item.trolleyCnt -= 1;
                    flag = true;
                    if (item.trolleyCnt <= 0) {
                        models.Trolley.findOneAndUpdate(
                            { trolleyName: trolleyNameDel },
                            { $pull: { items: { barcodeId: barcodeIdDel } } })
                            .catch((err) => {
                                console.log(err);
                            })
                    }

                }
            })
            if (!flag) {
                console.log("given barcode not found");
            }

            foundTrolley.save();
            res.redirect("/" + trolleyNameDel);


        })
        .catch((err) => {
            console.log(err);
        })


})




app.post("/:trolleyName", (req, res) => {
    const trolleyName = req.params.trolleyName;

    console.log("request for item addition");
    console.log("request from server : " + trolleyName);

    const trolleyNo = "trolley" + req.params.trolleyName.slice(6);

    const productId = req.body.barcodeId;

    models.Trolley.findOne({ trolleyName: trolleyNo })
        .then((foundTrolley) => {
            models.Item.find({ barcodeId: productId })
                .then((foundProduct) => {
                    if (foundProduct.length === 0) {
                        console.log("Product with prouductId : " + productId + " is not present in store. Please check productId.");
                    }
                    else {

                        if (foundTrolley === null) {
                            newtrolly = new models.Trolley({
                                trolleyName: trolleyNo,
                                items: foundProduct
                            });

                            newtrolly.save();
                            res.redirect("/" + trolleyNo);
                        }
                        else {
                            let flag = false;
                            var queryCode = foundProduct[0].barcodeId;

                            foundTrolley.items.forEach((item) => {
                                if (queryCode === item.barcodeId) {
                                    item.trolleyCnt += 1;
                                    flag = true;

                                }
                            })
                            if (!flag) {
                                foundTrolley.items.push(foundProduct[0]);
                            }

                            foundTrolley.save();
                            res.redirect("/" + trolleyNo);

                        }
                    }


                })
                .catch((err) => {
                    console.log(err);
                })
        })
        .catch((err) => {
            console.log(err);
        })

});



app.listen(process.env.PORT || 3000, () => {
    console.log("server listening at port 3000...");
})
