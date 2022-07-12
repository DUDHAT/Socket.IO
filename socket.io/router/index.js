const express = require("express");
const { instrument } = require("@socket.io/admin-ui")
const con = require("./model/model");
const cors = require("cors");
const moment = require("moment");
const app = express();
// app.use(cors());
// var http = require('http').Server(app);
// var io = require('socket.io')(http);
app.use(express.json())

const register = require("./router/router");
const { abort } = require("process");
const { log } = require("console");
app.use("/register",register);

// app.use(express.static('public'))

const port = 3000;
const server = app.listen(port,()=>{
    console.log(`listing port : ${port}`)
    
});
 
app.use(cors())
const io = require('socket.io')(server, {
    cors: {
        origin: ["https://admin.socket.io"],
        credentials: true
    }
});

instrument(io, {
  auth: false
});

// var roomno = 1;
// global.onlineUsers = new Map();
const onlineUsers = new Map();
io.on("connection", (socket) => {
//   socket.on("join room",(roomname,id)=>{
//     socket.join(roomname)

//   })
  // io.sockets.in("room-"+roomno).emit('connectToRoom', "You are in room no. "+roomno);
  var taskitem = []
  var taskitems = []
  var array = []
  var array1 = []
  console.log('A user connected',socket.id);
  console.log("user =",io.sockets.server.engine.clientsCount)
  global.chatSocket = socket;
  console.log("adddd",onlineUsers.size);

  socket.on("add-user", (userId,ack) => {
    let isactive = "active"
    let id = userId.userId
    onlineUsers.set(id, socket.id);
    console.log(id,socket.id) 

    console.log("============");
    console.log(onlineUsers);
    console.log("============");

    let sql = `UPDATE userdata SET isactive = '${isactive}' WHERE id = '${id}'`
    con.query(sql, function (err, data){
      ack({user_id:id,type: "Online",res: 0})
      socket.broadcast.emit("userstatus", {
        "res": "0",
        "data": {
            "type": "Online",
            "user_id": id
        }
     })
      // var sql = `select * from userdata where id = '${id}'`
      // con.query(sql, function (err, data){

      // })
      // console.log(data);
  })
    // console.log("adddd",onlineUsers.size)
  });

  socket.on("readstatus",(data)=>{

    onlineUsers.forEach((element,i )=>{
      var socketID = element.socket_id;
     socket.to(socketID).emit("readstatus", {
        "res": "0",
        "data": i
    });
    })
  })

  socket.on("send-msg", (data,ack) => {
    // console.log("sendmsg",data);
    let from_msg = data.from_msg;
    let to_msg = data.to_msg;
    let message = data.message;
    var date  = new Date();
    var created_at = date.getFullYear() + "-"
                + (date.getMonth()+1)  + "-" 
                + date.getDate() + " "  
                + date.getHours() + ":"  
                + date.getMinutes() + ":" 
                + date.getSeconds();
    // console.log(created_at);
    // onlineUsers.forEach((element,i )=> console.log(element,i))
    let sql=`INSERT INTO messages (from_msg,to_msg,message,created_at) VALUES ("${from_msg}","${to_msg}","${message}","${created_at}") `
     con.query(sql, (err, res) => {
        if(res){
        let sql = `SELECT messages.*,userdata.firstname,userdata.lastname
        FROM messages
        LEFT JOIN userdata
        ON messages.from_msg = userdata.id where messages.id =  ${res.insertId}`
        con.query(sql, function (err, dataa){
            ack({data:dataa,status : 1,message : "successfully get chat users"})
            s(dataa)
            var TotalUnreadMsg =`SELECT COUNT(id) as count,to_msg FROM messages where isread='0' and from_msg ='${data.from_msg}' and to_msg='${data.to_msg}'`
            con.query(TotalUnreadMsg, ( err,dataa ) => {
                  // console.log(dataa);
                array1.push({"id":array[0][0].id,
                               "from_msg":array[0][0].from_msg,
                               "to_msg":array[0][0].to_msg,
                               "message":array[0][0].message,  
                               "status":array[0][0].status,
                               "isread":array[0][0].isread,
                               "isgroup":array[0][0].isgroup,
                               "created_at":array[0][0].created_at,
                               "firstname":array[0][0].firstname,
                               "lastname":array[0][0].lastname,
                               "count":dataa[0].count
                     })
                     console.log("array",array1);
                     const sendUserSocket =onlineUsers.get(data.to_msg)
                      socket.to(sendUserSocket).emit("lastmessage",{
                        data:array1,
                        status : 1,
                        message : " successfully send chat "
                      })
                      array = []
                      array1 = []
            })
            function s(dataa){
                array.push(dataa);
            }
        })
        }
        
        if(res){
         
          var sql = `SELECT messages.*,userdata.firstname,userdata.lastname
         
          FROM messages
         
          LEFT JOIN userdata
         
          ON messages.from_msg = userdata.id where messages.id =  ${res.insertId}`
         
          con.query(sql, function (err, dataa){
         
            setValue(dataa,0)
         
            // console.log("dataaa.length",dataa.length)
            // console.log("arex",dataa[0].id);
         
            var isread=0
         
            var TotalUnreadMsg =`SELECT COUNT(id) as count,to_msg FROM messages where isread='0' and from_msg ='${data.from_msg}' and to_msg='${data.to_msg}'`
         
            con.query(TotalUnreadMsg, ( err,dataa ) => {
         
              setValues(dataa,1)
         
              // console.log("abc",data);
              // console.log("arze",data[0].COUNT(id));
         
              function setValues(dataa,a) {
         
                if(a==1){
                  // console.log("data",dataa);
                  // console.log("123",dataa[0].count);
                // taskitems.push([{"count":dataa[0].count}]);
                // taskitems.concat([data[0].count]);
                }
                // console.log("taskitems",taskitems[0][0].id)
         
                taskitem.push({"id":taskitems[0][0].id,
         
                "from_msg":taskitems[0][0].from_msg,
         
                "to_msg":taskitems[0][0].to_msg,
         
                "message":taskitems[0][0].message,  
         
                "status":taskitems[0][0].status,
         
                "isread":taskitems[0][0].isread,
         
                "isgroup":taskitems[0][0].isgroup,
         
                "created_at":taskitems[0][0].created_at,
         
                "firstname":taskitems[0][0].firstname,
         
                "lastname":taskitems[0][0].lastname,
         
                "count":dataa[0].count
         
              })
                // console.log(taskitem);
              }
         
              const sendUserSocket =onlineUsers.get(data.to_msg)
         
              socket.to(sendUserSocket).emit("GetLastMessages",{
         
                data:taskitem,
         
                status : 1,
         
                message : "successfully send chat"
         
              })
              // console.log("taskitems",taskitems)
         
              taskitems = []
         
              taskitem = []
              // console.log("taskitem",taskitem);
            })

            function setValue(dataa,a) {
         
              if(a==0){
                // console.log("data");
         
                taskitems.push(dataa)
         
              }
              
            }
            
          })
          
        }
        
     })
  })
  
  
  socket.on("TotalUnreadMsg",(data,ack)=>{
  
    var from_msgs = data.from_msg
    // var to_msgs = data.to_msg
    
    // console.log(to_msgs,from_msgs);
    
    var isread = 0
    
    var TotalUnreadMsg =`SELECT COUNT(id),to_msg FROM messages where isread='${isread}' and from_msg ='${from_msgs}' group by to_msg`
  
    console.log(TotalUnreadMsg); 

    con.query(TotalUnreadMsg, ( err,data ) => {
  
      console.log(data.length);
  
      ack({data:data,status : 1})
  
    })

  })
  // socket.emit("TotalUnreadMsg",{
      //   data : data,
      //   status : 1
      // })

  socket.on("UpdateReadMsg",(data,ack)=>{
  
    var from_msgs = data.from_msg
  
    var to_msgs = data.to_msg
  
    var isread = 1
  
    var TotalUnreadMsg = `UPDATE messages SET isread = '${isread}' WHERE from_msg = '${from_msgs}' and to_msg = '${to_msgs}'`
  
    con.query(TotalUnreadMsg, ( err,data ) => {
  
      console.log(data);
  
      ack({data:data,status : 1})
  
    })

  })

  socket.on("alluser",(data,ack)=>{
  
    let userdata = data.id
  
    var sql =  `SELECT * FROM userdata WHERE NOT id='${userdata}'`
  
    console.log(sql);
    
    con.query(sql, (err, result) => {
      
      console.log("result = ",result);
      
      ack({data:result,status : 1,message : "successfully GetChatUsers"})
      // socket.emit("GetChatUsers",{
        // data : result,
        // status : 1,
        // message : "successfully get chat users"
      // })
  
    })
  
  })

  socket.on("GetChatHistory",(data,ack)=>{
   
    let from_msg = data.from_msg
   
    let to_msg = data.to_msg
   
    var GetChatHistory =  `SELECT * FROM messages where (from_msg='${from_msg}' and to_msg='${to_msg}') or (from_msg='${to_msg}' and to_msg='${from_msg}') ORDER BY created_at ASC`
   
    con.query(GetChatHistory, (err, res) => {
   
      ack({data:res,status : 1,message : "successfully get chat GetChatHistory"})
      // console.log(res)
      // socket.emit("GetChatHistoryNew",{
      //   data : res,
      //   status : 1,
      //   message : "successfully get chat GetChatHistory"
      // })
    });
  })
  
  socket.on("GetChatConversation",(data,ack)=>{
    
    let user_id = data.user_id;
    
    var GetLastMessage = `SELECT messages.*,IF(conversations.from_id = '${user_id}', ut.firstname, uf.firstname) as firstname,IF(conversations.from_id = '${user_id}', ut.lastname, uf.lastname) as lastname,IF(conversations.from_id = '${user_id}', ut.id, uf.id) as userid FROM messages, (SELECT MAX(id)
    
    as lastid,from_msg as from_id,to_msg as to_id
                      FROM messages
                      WHERE (messages.to_msg = '${user_id}' OR messages.from_msg = '${user_id}')
   
                      GROUP BY CONCAT(LEAST(messages.to_msg,messages.from_msg ),'.',
                      GREATEST(messages.to_msg, messages.from_msg ))) as conversations
                      LEFT JOIN userdata uf ON uf.id = conversations.from_id
                      LEFT JOIN userdata ut ON ut.id = conversations.to_id
                      WHERE messages.id = conversations.lastid
                      ORDER BY messages.created_at DESC`
    
                      con.query(GetLastMessage, function (err, data){  
    
                        ack({data:data,status : 1,message : "successfully GetLastMessage"})
  
                      })
  
                      socket.broadcast.emit("userstatus", {
  
                        "res": "0",
  
                        "data": {
  
                          "type": "Online",
  
                          "user_id": id
  
                        }
 
                      })

 })

 socket.on("GroupUser",(data,ack)=>{
  
  const user_id  = new Map();
  
  user_id.set(data.id,data.userid)
  
  console.log(user_id.get(data.id));
  
  var alluser = user_id.get(data.id)
  
  const a = []
  
  a.push(alluser)
  
  console.log("a",a);
  
  var isadmin = data.isadmin;
  
  var group_name = data.group_name
  
  var date  = new Date();
  
  var created_at = date.getFullYear() + "-"

                + (date.getMonth()+1)  + "-" 

                + date.getDate() + " "  

                + date.getHours() + ":"  

                + date.getMinutes() + ":" 

                + date.getSeconds();
  let sql=`INSERT INTO Group_User (user_id,group_name,isadmin,created_at) VALUES ("${a}","${group_name}","${isadmin}","${created_at}") `
  // console.log(sql)
     con.query(sql, (err, res) => {

      let sql = `select * from Group_User where id = ${res.insertId}`

        con.query(sql,(err,res)=>{

        console.log("res",res)
               
      })

          socket.join(res.insertId);

          console.log('User joined chat group id',res.insertId);
    })
        // console.log(res.insertId)
    
        // socket.emit('newMessage', 'AdminWelocome to !');
  })
    
    // ack({data:res,status : 1})
 
    socket.on("GroupChatMsg",(data,ack)=>{
 
      var id = data.id

      var from_msg = data.from_msg
 
      var message = data.message
 
      var group_name  = data.group_name
 
      var isgroup = "true"
 
      var date  = new Date();
 
      var created_at = date.getFullYear() + "-"
 
      + (date.getMonth()+1)  + "-" 
 
      + date.getDate() + " "  
 
      + date.getHours() + ":"  
 
      + date.getMinutes() + ":" 
 
      + date.getSeconds();
 
      // console.log(created_at);
 
      // onlineUsers.forEach((element,i )=> console.log(element,i))
 
      let sql=`INSERT INTO Group_message (from_msg,message,group_name,created_at) VALUES ("${from_msg}","${message}","${group_name}","${created_at}") `
 
      con.query(sql, (err, res) => {
 
        console.log(res);
 
        socket.to(id).emit("GroupChatMsgSend",{

          data:res,
          
          status : 1,
          
          message : "successfully send in group chat"

        })
 
      });
 })
 
 socket.on('disconnect', function () {
 
  let isactive = "inactive"
 
  // var id ="1"
 
  // console.log("socket.id",socket.id)
 
  console.log(onlineUsers);
 
  // console.log("a",onlineUsers.get(id))
 
  onlineUsers.forEach((element,i) =>{
 
    // console.log(element);
 
    if(element==socket.id)  {
 
      let sql = `UPDATE userdata SET isactive = '${isactive}' WHERE id = '${i}'`
 
      con.query(sql, function (err, data){
 
        // console.log(data)
 
        socket.broadcast.emit("userstatus", {
 
          "res": "0",
 
          "data": {
 
            "type": "Offline",
 
            "user_id": i
 
          }
 
        })
           
          })
 
          console.log("delete",onlineUsers.delete(i));
 
          console.log(onlineUsers);
 
        }
 
      })
 
    })

  });
// console.log("a=",a);
//  console.log("asas",onlineUsers.delete(id))
// console.log(onlineUsers.delete('socket.id'));
//  let sql = `UPDATE userdata SET isactive = '${isactive}' WHERE id = '${a}'`
//  con.query(sql, function (err, data){
//   io.emit("userstatus", {
//     "res": "0",
//     "data": {
//         "type": "Offline",
//         "user_id": a
//     }
// })

//  })
    // onlineUsers.forEach((element,i )=> console.log(element,i))
    // socket.emit('disconnected');

  //   var sql =  `SELECT * FROM userdata WHERE NOT id='1'`
  // con.query(sql, (err, result) => {
  //     console.log(result);
  //     socket.emit("GetChatUsers",{
  //       data : result,
  //       status : 1,
  //       message : "successfully get chat users"
  //     })
  // })
  // var id = req.body.id




// socket.emit("send-msg",{
  //   from_msg : 1 ,
  //   to_msg : 2,
  //   message :ggg ,
  // })
  
  // socket.emit("add-user",userId);
  
  // Delivered
  // receive

//   SELECT m.*,u.firstname,u.lastname,u.id as user_id FROM `messages` m
// LEFT JOIN userdata u on u.id =  m.from_msg
// where 1=1 AND 37 IN  (m.from_msg, m.to_msg)
// GROUP BY IF(m.from_msg= 37, m.from_msg, m.to_msg ), IF(m.to_msg = 37, m.from_msg, m.to_msg ) 
// ORDER BY m.id DESC

// SELECT messages.* FROM messages, (SELECT MAX(id) as lastid
//                    FROM messages
//                    WHERE (messages.to_msg = '37' OR messages.from_msg = '37')

//                    GROUP BY CONCAT(LEAST(messages.to_msg,messages.from_msg ),'.',
//                    GREATEST(messages.to_msg, messages.from_msg ))) as conversations
//                    WHERE id = conversations.lastid
//                    ORDER BY messages.created_at DESC



// FROM messages LEFT JOIN userdata ON messages.to_msg = userdata.id