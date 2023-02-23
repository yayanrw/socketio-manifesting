const express = require("express");
const mysql = require("mysql");

const app = express();

const db = mysql.createConnection({
  host: "10.100.100.80",
  user: "remote",
  password: "remote",
  database: "msglow-manifest",
});

db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log("MySQL Connected");
});

const server = require("http").createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`Socket.io Connected: ${socket.id}`);

  socket.on("batchNumber", (data) => {
    // get from db
    db.query(
      "SELECT COUNT(*) total FROM t_qr WHERE qr_batch = ?",
      data,
      (error, results) => {
        if (error) {
          console.error("Error retrieving data from database: ", error);
          io.emit("batchNumber", 0);
          return error;
        } else {
          io.emit("batchNumber", results[0].total);
          return results;
        }
      }
    );
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

server.listen(3000, () => {
  console.log("Server started on port 3000");
});
