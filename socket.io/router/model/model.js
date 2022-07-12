const mysql = require("mysql");

//mySQl connect
var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "ZsPm8zUV5JV4bq9E",
    database: "skilldb"
});
con.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
    console.log("hello world");
})

module.exports = con;