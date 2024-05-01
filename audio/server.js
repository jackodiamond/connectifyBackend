const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const socket = require("socket.io");

const rooms = {};

const io = require("socket.io")(server, {
	cors: {
		origin: '*',
		methods: [ "GET", "POST" ]
	}
})

// Lists to maintain connected users and free users
let connectedUsers = {};
let freeUsers = {};

//change it finding all the pairs!
function findPair() {
  const userIds = Object.keys(freeUsers);
  if (userIds.length >= 2) {
      const user1 = userIds[0];
      const user2 = userIds[1];
    //  delete freeUsers[user1];
    //  delete freeUsers[user2];
      return { user1, user2 };
  }
  return null;
}

// Function to execute every 2 seconds
function executeEveryTwoSeconds() {
    const pair = findPair();
    if (pair) {

        console.log("user1",pair.user1)
        console.log("user2",pair.user2)

        const random= Math.floor(Math.random() * 10000)
      
        setTimeout(()=> 
        {
            // Emit event to initiate call between the pair
            io.to(pair.user1).emit("callIt", { roomId: random});
            io.to(pair.user2).emit("callIt", { roomId: random});

            delete freeUsers[pair.user1];
            delete freeUsers[pair.user2];
        } ,3000)

        
    }
  }

// Call the function every 2 seconds
setInterval(executeEveryTwoSeconds, 5000); 

io.on("connection", socket => {

    if(!connectedUsers[socket.id])
    {
        console.log("connection ",socket.id)

        connectedUsers[socket.id] = socket;
        freeUsers[socket.id] = socket;

        console.log("num users : ",Object.keys(connectedUsers).length)
    }

    socket.on("joinroom", roomID => {
        console.log("user joined")
        if (rooms[roomID]) {
            rooms[roomID].push(socket.id);
        } else {
            rooms[roomID] = [socket.id];
        }
        const otherUser = rooms[roomID].find(id => id !== socket.id);
        if (otherUser) {
            socket.emit("other user", otherUser);
            socket.to(otherUser).emit("user joined", socket.id);
        }
    });

    socket.on("offer", payload => {
        io.to(payload.target).emit("offer", payload);
    });

    socket.on("answer", payload => {
        io.to(payload.target).emit("answer", payload);
    });

    socket.on("ice-candidate", incoming => {
        io.to(incoming.target).emit("ice-candidate", incoming.candidate);
    });

    socket.on("next", () => {
        freeUsers[socket.id] = socket; 
    })

    socket.on("disconnect", () => {
        //i think it will not be brodcast for our case
            socket.broadcast.emit("callEnded")
        console.log("disconnected user ",socket.id)
         // If user was free, remove from free list
         if (freeUsers[socket.id]) {
          delete freeUsers[socket.id];
        }
        // Remove user from connected users list
        delete connectedUsers[socket.id];
    })

});


server.listen(7000, () => console.log('server is running on port 5000'));
