const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");
const _ = require("lodash");


const app = express();


app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolist", {useNewUrlParser: true, useUnifiedTopology: true});

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Testing item 01"
});

const item2 = new Item({
  name: "Testing item 02"
});

const item3 = new Item ({
  name: "Tetsing item 03"
});

const defaultItems = [item1, item2, item3];


const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);


app.get("/", function(req, res) {

const day = date.getDate();

Item.find({}, function (err, foundItems) {

  if(foundItems.length === 0) {
    Item.insertMany(defaultItems, function(err) {
      if(err) {
        console.log(err);
      } else {
        console.log("Successfully added test items.");
      };
    });
    res.redirect("/");
  } else {
    res.render("list", {listTitle: "Today", newListItems: foundItems});
  }
});
});

app.get("/:customList", function(req, res) {
  const customList = _.capitalize(req.params.customList);

  List.findOne({name: customList}, function(err, foundList){
    if(!err) {
      if(!foundList) {
        const list = new List({
          name: customList,
          items: defaultItems
        });
          list.save();
          res.redirect("/" + customList);
      } else {
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  });
});

 app.post("/", function(req, res) {

    const itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item({
      name: itemName
    });


    if(listName === "Today") {
      item.save();
      res.redirect("/");
    } else {
      List.findOne({name: listName}, function(err, foundList){
        foundList.items.push(item);
        foundList.save();
        res.redirect("/" + listName);
      });
    }
 });


 app.post("/delete", function(req, res) {
   const checkedId = req.body.checkbox;
   const listName = req.body.listName;

   if(listName === "Today") {
     Item.findByIdAndRemove(checkedId, function(err){
       if(!err) {
         console.log("Checked item ID successfully deleted.");
         res.redirect("/");
       }
     });
   } else {
     List.findOneAndUpdate({name: listName}, {$pull:{items: {_id: checkedId}}}, function(err, foundList){
       if(!err) {
         res.redirect("/" +listName);
       }
     });
   }

 });


app.listen(3000, function() {
  console.log("Server starts on port 3000.");
});
