// Import required modules
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');

// Create Express app
const app = express();
const server = http.createServer(app);

const io = require("socket.io")(server, {
    cors: {
        origin: '*',
        methods: ["GET", "POST"]
    }
})

// Define a map to store room data
const rooms = new Map();
// Define a map to store free users
const freeUsers = new Map();
// Define a map to store connected users
const connectedUsers = new Map();

// Function to pair free users every 2 seconds
function pairFreeUsers() {
    const freeUserIds = [...freeUsers.keys()];
    if (freeUserIds.length >= 2) {

        const userId1 = freeUserIds[0];
        const userId2 = freeUserIds[1];
        const roomId = Math.random().toString(36).substring(7); // Generate random room ID
        const username1 = freeUsers.get(userId1);
        const username2 = freeUsers.get(userId2);
        
        // Join users to the room
        connectedUsers.set(userId1, roomId);
        connectedUsers.set(userId2, roomId);

        // Remove users from free users list
        freeUsers.delete(userId1);
        freeUsers.delete(userId2);

        // Emit room ID to paired users
        io.to(userId1).emit('roomId', roomId);
        io.to(userId2).emit('roomId', roomId);
    }
}

// Run the pairFreeUsers function every 2 seconds
setInterval(pairFreeUsers, 2000);

// Define a function to handle incoming socket connections
io.on('connection', (socket) => {
    console.log('New client connected');

     // Add user to free users list
     freeUsers.set(socket.id, "username");

    // Handle joining a room
    socket.on('join', (roomId,username) => {
        console.log("User joined");
       // freeUsers.set(socket.id, username);

        // Join the specified room
        socket.join(roomId);

        // Send a welcome message to the client
        socket.emit('message', { user: 'Server', text: `Welcome, ${username}!` });
    });

    // Handle sending messages
    socket.on('sendMessage', (roomId, message) => {
        console.log("sent message ", roomId, " : ", message)
        // Broadcast the message to all clients in the room
        socket.broadcast.to(roomId).emit('message', {text: message });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('Client disconnected');

        // If user was in a room, remove from connected users
        if (connectedUsers.has(socket.id)) {
            const roomId = connectedUsers.get(socket.id);
            connectedUsers.delete(socket.id);

            // Check if the room is empty
            let roomIsEmpty = true;
            connectedUsers.forEach((value) => {
                if (value === roomId) {
                    roomIsEmpty = false;
                }
            });

            // If room is empty, delete it from rooms
            if (roomIsEmpty) {
                rooms.delete(roomId);
            }
        }

        // Remove user from free users
        if (freeUsers.has(socket.id)) {
            freeUsers.delete(socket.id);
        }
    });

    socket.on("next", (roomId) => {
      socket.leave(roomId);
      freeUsers.set(socket.id, "username");
    })

});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
