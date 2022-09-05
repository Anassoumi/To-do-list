const express = require("express")
const mongoose=require("mongoose")
const app = express()
const bodyParser = require("body-parser")
const res = require("express/lib/response")

app.set("view engine", "ejs")

app.use(bodyParser.urlencoded({
  extended: true
}))
app.use(express.static("public"))


var items = []
var workItem = []

mongoose.connect("mongodb://localhost:27017/todolistDB",(e)=>{
  if(e){
    console.log(e)
  }
  else{
    console.log("success")
  }
})

const itemSchema = {
name:String,
}

const listSchema={
  name:String,
  listItems:[itemSchema],
}

const Item= mongoose.model("Item",itemSchema)
const List=mongoose.model("List",listSchema)

const item1 = new Item({
  name:"Welcome to your to do list"
})
const item2 = new Item({
  name:"Hit the + button to add new item"
})
const item3 = new Item({
  name:"<-- hit this to delete an item"
})





// Item.deleteMany({name:"Hit the + button to add new item"},(e)=>{
//   console.error(e)
// })





app.get("/", (req, res) => {

  Item.find({},(e,resource)=>{

    if (resource.length===0){
      Item.insertMany([item1,item2,item3],(e)=>{
  if(e){
    console.log(e)
  }
  else{
    console.log("Items inserted")
  }
})
res.redirect("/")
    }
    else{
      console.log(resource)
      res.render("list", {listTitle: "today",newListItems: resource})
    }
  })

})


app.post("/", (req, res) => {
let item = req.body.newItem
const item4=new Item({
  name:item
})
// item4.save()



console.log(req.body)
if(req.body.list==="today"){
  Item.insertMany([item4],(e)=>{
    console.log(e)
  })
  res.redirect("/")
}

else{
  List.findOne({name:req.body.list},(err,foundList)=>{
    if(foundList){
      foundList.listItems.push(item4)
      foundList.save()
      res.redirect("/"+req.body.list)
    }
  })
 
}
})


app.post("/delete",(req,res)=>{
  let checkedItem = req.body.checkbox
  console.log(req.body)

  if(req.body.hiddenInput==="today"){
    Item.findByIdAndDelete(checkedItem,(e)=>{
      if(!e){
  console.log("item deleted")
      }
      res.redirect("/")
    })
  }
  else{
    List.findOneAndUpdate({name:req.body.hiddenInput},{$pull:{listItems:{_id:req.body.checkbox}}},(err,result)=>{
      if(!err){
        console.log("object deleted")
      }
      res.redirect("/"+req.body.hiddenInput)
    })

   
    
  }

  
})


app.get("/:customlistname",(req,res)=>{
  const customlistname= req.params.customlistname
  List.findOne({name:customlistname},(err,result)=>{
    if(!err){
      if(!result){
        console.log("name doen't exist")
        
      const list = new List({
        name:customlistname,
        listItems:[item1,item2,item3]
      })
      list.save()
      res.redirect("/"+customlistname)
      }
      else{
        console.log("name exist")
        console.log(result.listItems)
        res.render("list", {listTitle: result.name,newListItems:result.listItems})
        
      }
    }
  })
})


// app.get("/work", (req, res) => {
//   res.render("list", {
//     listTitle: "Work",
//     newListItems: workItem,
//   })
// })











app.listen(3000, () => {
  console.log("port 3000 ...")
})
