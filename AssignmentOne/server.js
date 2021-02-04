/*********************************************************************************
 *  WEB422 – Assignment 1
 *  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.
 *  No part of this assignment has been copied manually or electronically from any other source
 *  (including web sites) or distributed to other students.
 *
 *  Name: Mark Marino Student ID: 109765164 Date: 2021-01-21
 *  Heroku Link: https://web422-assignone.herokuapp.com/
 *
 ********************************************************************************/

//Assignment 1
//Set up Web Service!

require("dotenv").config({ path: __dirname + "/.env" });
const path = require("path");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
const HTTP_PORT = process.env.PORT || 8080;
const dbusername = process.env.DBUSERNAME;
const dbpassword = process.env.DBPASSWORD;
const dbname = process.env.DBNAME;
app.use(bodyParser.json());
app.use(cors());

//Requires newly created module restaurantDB
const RestaurantDB = require("./modules/restaurantDB.js");
//Allows us to create a new "db" instance to work with the data
const db = new RestaurantDB(
  `mongodb+srv://${dbusername}:${dbpassword}@cluster0.1onpi.mongodb.net/${dbname}?retryWrites=true&w=majority`
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
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/index.html"));
});

//This route uses the body of the request to add a new "Restaurant"
//document to the collection and return a success / fail message to the client.

//This route must accept the numeric query parameters "page" and "perPage" as well as
//the string parameter "borough", ie: /api/restaurants?page=1&perPage=5&borough=Bronx.
//It will use these values to return all "Restaurant" objects for a specific "page" to
//the client as well as optionally filtering by "borough", if provided.
app.get("/api/restaurants", (req, res) => {
  const page = req.query.page;
  const perPage = req.query.perPage;
  const borough = req.query.borough;

  db.getAllRestaurants(page, perPage, borough)
    .then((restaurants) => {
      res.status(201).json(restaurants);
    })
    .catch((err) => {
      res.status(400).json(err);
    });
});

app.get("/api/restaurants/:restID", (req, res) => {
  db.getRestaurantById(req.params.restID)
    .then((restaurant) => {
      res.status(200).json(restaurant);
    })
    .catch((err) => {
      res.status(400).json(err);
    });
});

app.post("/api/restaurants", (req, res) => {
  //Add new restaurant
  db.addNewRestaurant(req.body)
    .then((newRestaurant) => {
      res.status(200).json(newRestaurant);
    })
    .catch((err) => {
      res.status(400).json(err);
    });
});

//This route must accept a numeric route parameter that represents the _id of
//the desired restaurant object, ie: /api/restaurants/5eb3d668b31de5d588f4292e
//as well as read the contents of the request body.  It will use these values
//to update a specific "Restaurant" document in the collection and return a
//success / fail message to the client.
app.put("/api/restaurants/:restID", (req, res) => {
  db.getRestaurantById(req.params.restID)
    .then((restaurant) => {
      res.status(201).json(db.updateRestaurantById(req.body, restaurant));
    })
    .catch((err) => {
      res.status(404).json(err);
    });
});

app.delete("/api/restaurants/:restID", (req, res) => {
  db.getRestaurantById(req.params.restID)
    .then(() => {
      res.status(201).json({ message: "Restaurant successfully deleted" });
    })
    .catch((err) => {
      res.status(404).json(err);
    });
});

//Function ensures date recieved from client is a valid date
// function verifyDate(dates) {
//   for (i = 0; i < dates.length; i++) {
//     if (isNaN(Date.parse(dates[i].date))) {
//       return false;
//     }
//   }
//   return true;
// }
