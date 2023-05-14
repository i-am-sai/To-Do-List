//jshint esversion:6

const express = require("express");                     // importing packages
const bodyParser = require("body-parser"); 
const  mongoose = require("mongoose");
const _ = require("lodash");

const date = require(__dirname + "/date.js");

const app = express();                                 // declaring app method

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://127.0.0.1:27017/todolistDB", {useNewUrlParser: true});   // Connecting link to  mongodb

const itemsSchema  = {
  name: String                                       // item Schema 
};

const Item = mongoose.model("Item",itemsSchema);     // item Model 

const item1 = new Item ({                            // item Documents 
   name: "Task 1"                 // 1
});

const item2 = new Item ({                           // 2
  name: "Task 2"    
});

const item3 = new Item ({                           // 3
  name: "Task 3"
});

const defaultItems = [item1, item2, item3];   //array (Adding all the docs to array)

const listSchema = {          // list Schema
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);  // list model

app.get("/", function(req, res) {

Item.find({})
  .then((foundItems) => {

    if (foundItems.length === 0){

      Item.insertMany(defaultItems)                     // method to upload collections or docs to DB.
      .then(() => {
        console.log("Successfully saved default items to DB.");
      })
      .catch((err) => {
        console.log(err);
      }); 

      res.redirect("/");                             // After uploading this will help to redirect to root and for next exection it will go into else statement as we already have some data.

    } else {

         res.render("list", {listTitle: "Today", newListItems: foundItems});  // Render the data on the webpage.
    }
})
  .catch((err) => {
    console.log(err);
  });

});

app.get("/:customListName", function(req, res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({ name: customListName })
  .then((foundList) => {
    if (!foundList) {
      
      const list = new List({
    name: customListName,
    items: defaultItems
   });

   list.save();
 res.redirect("/" + customListName );
    } else {
     
       res.render("list", {listTitle: foundList.name, newListItems: foundList.items}); 

    }
  })
  .catch((err) => {
    console.error(err);
  }); 

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

 const item = new Item({
  name: itemName
 });

 if (listName === "Today"){
     item.save();
     res.redirect("/");
 } else {

  List.findOne({ name: listName })
  .then((foundList) => {
    foundList.items.push(item);
    return foundList.save();
  })
  .then(() => {
    res.redirect("/" + listName);
  })
  .catch((err) => {
    console.error(err);
  });
}
});

app.post("/delete", function(req, res){
   const checkedItemId = req.body.checkbox;
   const listName = req.body.listName;

   if(listName === "Today"){

   Item.findByIdAndRemove(checkedItemId)
  .then(() => {
    console.log("Successfully deleted checked item.");
    res.redirect("/");
  })
  .catch((err) => {
    console.error("Error deleting checked item:", err);
  });
} else {

  List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}})
  
  .then(updatedList => {

    res.redirect("/" + listName);
  })
  .catch(err => {
    console.log(err);
  });

}
 
 });

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3300, function() {
  console.log("Server started on port 3300");
});

/* Item.insertMany(defaultItems, function(err){
  if(err){
    console.log(err);
  } else{
          console.log("Sucessfully saved to default items to DB.");
  }
}); */

/* Item.find({}, function(err, foundItems){
  res.render("list", {listTitle: "Today", newListItems: foundItems});
}); */

/* List.findOne({name: listName}, function(err, foundList){
     foundList.items.push(item);
     foundList.save();
     res.redirect("/"+listName);
  }); */

/* const item1 = new Item ({                            // item Documents 
    name: "Welcome to your todolist!"                 // 1
 });
 
 const item2 = new Item ({                           // 2
   name: "Hit the + button to add a new item. "    
 });
 
 const item3 = new Item ({                           // 3
   name: "<-- Hit  this to delete an item."
 });
*/ 