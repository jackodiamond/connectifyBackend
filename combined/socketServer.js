const socketIO = require('socket.io');

module.exports = function(socketServer) {
  const io = socketIO(socketServer, {
    cors: {
      origin: '*',
      methods: ["GET", "POST"]
    }
  });

  const rooms = {};
  let connectedUsers = {};
  let freeUsers = {};

  let freeVideo = {};
  let freeAudio = {};
  let freeText = {};

  function findPair(freeUser) {
    const userIds = Object.keys(freeUser);
    if (userIds.length >= 2) {
      const user1 = userIds[0];
      const user2 = userIds[1];
      return { user1, user2 };
    }
    return null;
  }

  function executeEveryTwoSeconds() {
    let pair = findPair(freeVideo);

    if (pair!=null) {
      const random = Math.floor(Math.random() * 10000);
      io.to(pair.user1).emit("callIt", { roomId: random });
      io.to(pair.user2).emit("callIt", { roomId: random });
      delete freeVideo[pair.user1];
      delete freeVideo[pair.user2];
    }

    pair = findPair(freeAudio);
    if (pair) {
      const random = Math.floor(Math.random() * 10000);

      io.to(pair.user1).emit("callIt", { roomId: random });
      io.to(pair.user2).emit("callIt", { roomId: random });
      delete freeAudio[pair.user1];
      delete freeAudio[pair.user2];
  
    }

    pair = findPair(freeText);
    if (pair) {
      const random = Math.floor(Math.random() * 10000);

      io.to(pair.user1).emit("callIt", { roomId: random });
      io.to(pair.user2).emit("callIt", { roomId: random });
      delete freeText[pair.user1];
      delete freeText[pair.user2];

    }
  }

  setInterval(executeEveryTwoSeconds, 5000);

  io.on("connection", socket => {
    if (!connectedUsers[socket.id]) {
      connectedUsers[socket.id] = socket;
    //  freeUsers[socket.id] = socket;
    }

    socket.on("video",username =>{
      console.log("video user joined")
      freeVideo[socket.id] = socket;
    })

    socket.on("audio",username =>{
      console.log("audio user joined")
      freeAudio[socket.id] = socket;
    })

    socket.on("text",username =>{
      console.log("text user joined")
      freeText[socket.id] = socket;
    })


    socket.on("joinroom", roomID => {
      console.log("join room ",roomID)
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

     // Handle joining a room
     socket.on('joinText', roomId => {
      console.log("User joined");
     // freeUsers.set(socket.id, username);

      // Join the specified room
      socket.join(roomId);

      // Send a welcome message to the client
      socket.emit('message', { user: 'Server', text: `Welcome! to a new chatRoom!` });
  });

    // Handle sending messages
    socket.on('sendMessage', (roomId, message) => {
        console.log("sent message ", roomId, " : ", message)
        // Broadcast the message to all clients in the room
        socket.broadcast.to(roomId).emit('message', {text: message });
        console.log("done sending!")
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
    });

    socket.on("nextVideo", () => {
      freeVideo[socket.id] = socket;
    });

    socket.on("nextAudio", () => {
      freeAudio[socket.id] = socket;
    });

    socket.on("nextText", () => {
      freeText[socket.id] = socket;
    });

    socket.on("disconnect", () => {
      socket.broadcast.emit("callEnded");
      if (freeUsers[socket.id]) {
        delete freeUsers[socket.id];
      }

      if (freeVideo[socket.id]) {
        delete freeVideo[socket.id];
      }

      if (freeAudio[socket.id]) {
        delete freeAudio[socket.id];
      }

      if (freeText[socket.id]) {
        delete freeText[socket.id];
      }
      delete connectedUsers[socket.id];
    });
  });
};
