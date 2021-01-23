const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//Defines the restaurant collection(table) in the database
const restaurantSchema = new Schema({
  address: {
    building: String,
    coord: [Number],
    street: String,
    zipcode: String,
  },
  borough: String,
  cuisine: String,
  grades: [
    {
      date: Date,
      grade: String,
      score: Number,
    },
  ],
  name: String,
  restaurant_id: String,
});

module.exports = class RestaurantDB {
  constructor(connectionString) {
    this.connectionString = connectionString;
    this.Restaurant = null; // no "Restaurant" object until "initialize" is complete
  }

  initialize() {
    return new Promise((resolve, reject) => {
      let db = mongoose.createConnection(this.connectionString, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });

      db.on("error", () => {
        reject();
      });
      db.once("open", () => {
        this.Restaurant = db.model("restaurants", restaurantSchema);
        resolve();
      });
    });
  }

  //Function creates a new restaurant with the data provided in the parameters
  async addNewRestaurant(data) {
    let newRestaurant = new this.Restaurant(data);
    //saves new restaurant to the collection
    await newRestaurant.save();
    return `new restaurant: ${newRestaurant._id} successfully added`;
  }

  getAllRestaurants(page, perPage, borough) {
    let findBy = borough ? { borough } : {};

    if (+page && +perPage) {
      return this.Restaurant.find(findBy)
        .sort({ restaurant_id: +1 })
        .skip(page * +perPage)
        .limit(+perPage)
        .exec();
    }

    return Promise.reject(
      new Error("page and perPage query parameters must be present")
    );
  }
//Function return the restaurant with the id specified in the parameters
  getRestaurantById(id) {
    return this.Restaurant.findOne({ _id: id }).exec();
  }
//Function updates the restaurant recieved in parameters with the its id and new data
  async updateRestaurantById(data, id) {
    await this.Restaurant.updateOne({ _id: id }, { $set: data }).exec();
    return `restaurant ${id} successfully updated`;
  }

  //Function deletes the restaurant recieved in parameters
  async deleteRestaurantById(id) {
    await this.Restaurant.deleteOne({ _id: id }).exec();
    return `restaurant ${id} successfully deleted`;
  }

};

