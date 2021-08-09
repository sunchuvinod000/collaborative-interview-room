const express = require('express')
const fs = require('fs');
const { exec } = require('child_process');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
  debug: true
});
const { v4: uuidv4} = require('uuid');

app.use('/peerjs', peerServer);
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


const port = process.env.PORT || 3000;

var options = {
    timeout: 100,
    stdio: 'inherit',
    shell: true,
}


app.get('/',(req,res)=>{

    res.render('fire',{roomId:uuidv4()});

})

io.on('connection',(socket)=>{
  socket.on('join-room', (roomId, userId) =>{
    socket.join(roomId,()=>{
      console.log('user joined room')
    });
    io.emit("user-connected",userId);
    

 })
  socket.on('runcode',(data)=>{
   
    fs.writeFile('code.js',data,(err)=>{
      if(err){
        console.log(err);
      }
      console.log('file creation and data written is successfull...')
    })
    exec('node code.js', options, (error, stdout, stderr) => {
      
       
         if(stdout){
           io.emit('stdout',stdout)
         }
         if(stderr){
           io.emit('stderr',stderr)
         }
         if (error) {
              console.error(`exec error: ${error}`);
              return;
         }
      
  });

  })
  
  console.log('connection is established');
})



server.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})