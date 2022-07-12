const con = require("../model/model");
const moment = require("moment");


exports.insert = ((req, res) => {
    console.log("hello world");
    res.setHeader('Content-Type', 'application/json');
    var sql = `INSERT INTO userdata (firstname,lastname,contact,email,password,configpass) VALUES ("${req.body.firstname}","${req.body.lastname}","${req.body.contact}","${req.body.email}","${req.body.password}","${req.body.configpass}")`;
    con.query(sql, function (err, result) {
        if (err) throw err;
        // console.log("1 record inserted",result.insertId);
        var abc = `select * from userdata where id=${result.insertId} `
        con.query(abc,(err,data)=>{
            res.send(data)
        })
    });
    // res.json(req.body);
})

exports.find = ((req, res) => {
    var sql = `SELECT * FROM userdata where email='${req.body.email}' and password='${req.body.password}'`
     // var sql = "SELECT firstname, configpass FROM userdata"
    // var sql = "SELECT * FROM userdata WHERE firstname != 'undefined'"
    con.query(sql, (err,data) => {
        if(data.length==0){
            console.log(data);
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({status: 0,message:"email or password incorrect"}));
            }
        else{    
            console.log(data);
            res.setHeader('Content-Type', 'application/json');
    //      var sql = `UPDATE userdata SET password = '${req.body.password}' WHERE firstname = '${req.body.firstname}'`
    // con.query(sql, (err, result) => {})
            res.end(JSON.stringify({data: data,status: 1,message:"login successfully"}));    
        }
        
    });
})


exports.message = ((req, res) => {
    var created_at  = moment().format('YYYY-MM-DD hh:mm:ss')
    var abc = `INSERT INTO messages (from_msg,to_msg,message,created_at) VALUES ("${req.body.from_msg}","${req.body.to_msg}","${req.body.message}","${created_at}") `;
    console.log(abc);
    con.query(abc, function (err, result) {
        // if (err) throw err;
        if(result){
        var sql = `SELECT messages.*,userdata.firstname,userdata.lastname,userdata.id AS userid
        FROM messages
        LEFT JOIN userdata
        ON messages.from_msg = userdata.id where messages.id =  ${result.insertId}`
        con.query(sql, function (err, data){
            res.send(data);
        })
        }
        if(err){
            throw err;
        }
    })
})
// where email='${req.body.email}' and password='${req.body.password}

exports.all = ((req, res) => {
    var sql =  `SELECT * FROM userdata WHERE NOT id='${req.body.id}' ORDER BY id DESC `;
    con.query(sql, (err, result) => {
        if(result){
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({data: result,status: 1}));
            // res.status(200).send(result);
            }
            if(err){
                res.status(200).send(err);
            }
        // if (err) throw err;
        // res.json({"msg":"login successful"},result)

    });
})

exports.message_get = ((req,res)=>{
    let from_msg = req.body.from_msg;
    let to_msg = req.body.to_msg;
    var sql = `SELECT * FROM messages where (from_msg='${from_msg}' and to_msg='${to_msg}') or (from_msg='${to_msg}' and to_msg='${from_msg}') ORDER BY created_at DESC`
    // where from_msg={req.body.from_msg} and to_msg={req.body.to_msg}`
    con.query(sql, (err, result) => {
        if(result){
            res.status(200).send(result);
            }
            if(err){
                res.status(200).send(err);
            }
    })       
})

exports.message_details = ((req,res)=>{

    let user_id = req.body.user_id;
    var sql = `SELECT messages.*,IF(conversations.from_id = '${user_id}', ut.firstname, uf.firstname) as firstname,IF(conversations.from_id = '${user_id}', ut.lastname, uf.lastname) as lastname,IF(conversations.from_id = '${user_id}', ut.id, uf.id) as userid FROM messages, (SELECT MAX(id)
    as lastid,from_msg as from_id,to_msg as to_id
                      FROM messages
                      WHERE (messages.to_msg = '${user_id}' OR messages.from_msg = '${user_id}')
   
                      GROUP BY CONCAT(LEAST(messages.to_msg,messages.from_msg ),'.',
                      GREATEST(messages.to_msg, messages.from_msg ))) as conversations
                      LEFT JOIN userdata uf ON uf.id = conversations.from_id
                      LEFT JOIN userdata ut ON ut.id = conversations.to_id
                      WHERE messages.id = conversations.lastid
                      ORDER BY messages.created_at DESC`
    con.query(sql, function (err, data){
        if(data){
            res.status(200).send(data);
        }    
    })
})

// SELECT m.*,IF(c.sender_token = '$user_token', ur.user_name, us.user_name) as user_name,IF(c.sender_token = '$user_token', ur.user_profile_photo, us.user_profile_photo) 
// as user_profile_photo,m.created_date as messages_date  FROM `chat` c
//LEFT JOIN user us ON us.user_token = c.sender_token
//LEFT JOIN user ur ON ur.user_token = c.receiver_token
//LEFT JOIN messages m ON m.messages_id = c.last_message_id
//WHERE 1=1 AND (c.sender_token = '$user_token' OR c.receiver_token = '$user_token') AND c.is_deleted = 0 ORDER BY c.updated_date DESC