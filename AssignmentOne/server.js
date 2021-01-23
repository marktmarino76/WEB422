/*********************************************************************************
 *  WEB422 – Assignment 1
 *  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.
 *  No part of this assignment has been copied manually or electronically from any other source
 *  (including web sites) or distributed to other students.
 *
 *  Name: Mark Marino Student ID: 109765164 Date: 2021-01-21
 *  Heroku Link: _______________________________________________________________
 *
 ********************************************************************************/

//Assignment 1
//Set up Web Service!

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
const HTTP_PORT = process.env.PORT || 8080;

app.use(bodyParser.json());
app.use(cors());

//Requires newly created module restaurantDB
const RestaurantDB = require("./modules/restaurantDB.js");
//Allows us to create a new "db" instance to work with the data
const db = new RestaurantDB(
  "mongodb+srv://admin:1234@cluster0.1onpi.mongodb.net/sample_restaurants?retryWrites=true&w=majority"
);

db.initialize()
  .then(() => {
    app.listen(HTTP_PORT, () => {
      console.log(`server listening on: ${HTTP_PORT}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });

//get all
// app.get("/api/items", (req, res) => {
//   res.json({ message: "fetch all items" });
// });

//This route uses the body of the request to add a new "Restaurant"
//document to the collection and return a success / fail message to the client.

app.post("/api/restaurants", (req, res) => {
  //Add new restaurant
  if (
    req.body.address &&
    req.body.borough &&
    req.body.cuisine &&
    req.body.grades &&
    req.body.name &&
    verifyDate(req.body.grades)
  ) {
    res.status(201).json(db.addNewRestaurant(req.body));
  } else {
    res.status(400).json({ message: "Bad Request, data was invalid" });
  }
});

//This route must accept the numeric query parameters "page" and "perPage" as well as
//the string parameter "borough", ie: /api/restaurants?page=1&perPage=5&borough=Bronx.
//It will use these values to return all "Restaurant" objects for a specific "page" to
//the client as well as optionally filtering by "borough", if provided.
app.get("/api/restaurants", (req, res) => {
  const page = req.query.page;
  const perPage = req.query.perPage;
  const borough = req.query.borough;

  if (page && perPage && borough) {
    res.status(201).json(db.getAllRestaurants(page, perPage, borough));
  } else {
    res.status(400).json({ message: "Bad Request, data was invalid" });
  }
});

//This route must accept a numeric route parameter that represents the _id of
//the desired restaurant object, ie: /api/restaurants/5eb3d668b31de5d588f4292e
//as well as read the contents of the request body.  It will use these values
//to update a specific "Restaurant" document in the collection and return a
//success / fail message to the client.
app.put("/api/restaurants/:restID", (req, res) => {
  let restaurant = req.params.restID;
  console.log(restaurant);
  if (db.getRestaurantById(restaurant)) {
    res.status(201).json(db.updateRestaurantById(req.body, restaurant));
  } else {
    res.status(404).json({ message: "Bad Request, data was invalid" });
  }
});

app.delete("/api/restaurants/:restID", (req, res) => {
  //If Restaurant could be found in database delete it
  if (db.getRestaurantById(req.params.restID)) {
    res.status(201).json(db.deleteRestaurantById(req.params.restID));
  } else {
    //If restaurant could not be found
    res.status(404).json({ message: "Bad Request, data was invalid" });
  }
});

//Function ensures date recieved from client is a valid date
function verifyDate(dates) {
  for (i = 0; i < dates.length; i++) {
    if (isNaN(Date.parse(dates[i].date))) {
      return false;
    }
  }
  return true;
}
