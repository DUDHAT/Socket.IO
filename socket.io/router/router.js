const express = require("express");
const app = express();
const controller = require("../controller/controller")

const register = express.Router();

// register.get("/create_table",controller.create_table)
register.post("/registration",controller.insert);
register.post("/login", controller.find);
register.post("/message", controller.message);
register.post("/alluser", controller.all);
register.get("/message_get", controller.message_get);
register.get("/message_details", controller.message_details);
module.exports = register;



// {
//     "firstname":"Jaldip",
//     "lastname":"Bhalani",
//     "contact":"1234567890",
//     "email":"jaldipgmail.com",
//     "password":"123456",
//     "configpass":"123456"
// }