// Starting file

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();
// const items = [];
// const workItem = [];

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));
app.set("view engine", "ejs");

const connString = "mongodb://admin-gautam:gautam254@" +
                   "cluster0-shard-00-00.uokfg.mongodb.net:27017," +
                   "cluster0-shard-00-01.uokfg.mongodb.net:27017," +
                   "cluster0-shard-00-02.uokfg.mongodb.net:27017" +
                   "/todolistDB?authSource=admin&replicaSet=atlas-zaf4e8-shard-0&ssl=true";

//const connString = "mongodb://localhost:27017/todolistDB";

mongoose.connect(connString, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
});

 // let conn = mongoose.connection;
//
// // Verify connection
// conn.once('open', function() {
//   console.log(`Connected to ${conn.host} on ${conn.name}`);
//   conn.close();
// })

//creating new schema
const itemsSchema = {
  name: "String"
};
const Item = mongoose.model("Item", itemsSchema);

//creating new item using the schema
const item1 = new Item({
  name: "Welcome to your todolist!"
});
const item2 = new Item({
  name: "Hit + button to add a new item"
});
const item3 = new Item({
  name: "<-- Hit this to delete an item"
});

const defaultItems = [item1, item2, item3];

//Schema and model for users custom lists
  const listSchema = {
    name: String,
    items: [itemsSchema]
  };
  const List = mongoose.model("List", listSchema);


app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("successfully added");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", {
        listTitle: "Today",
        newItems: foundItems
      });
    }
  });
});




app.post("/", function(req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

//see lecture 369
  if(listName === "Today"){
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    })
  }


});

app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItemId, function(err){
      if(!err){
        console.log("successfully deleted checked item");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
      if(!err){
        res.redirect("/"+ listName);
      }
    })
  }


});

app.get("/:customListName", function(req, res){
  const customListName = _.capitalize(req.params.customListName);
//to check if list already exixt or not
  List.findOne({name: customListName}, function(err, foundList){
    if(!err){
      if(!foundList){
        //path to new list
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/"+ customListName);
      } else {
        //show an exixting list
        res.render("list", {listTitle: foundList.name, newItems: foundList.items});
      }
    }
  })


});

app.get("/about", function(req, res) {
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server is running successfully!.");
});
