// import express from 'express';
const express = require('express');
// import cookieSession from 'cookie-session';
// import { urlencoded } from 'body-parser';

// const urlencodedParser = urlencoded({ extended: false });
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);

// server.listen(80);

// app.use(cookieSession({
//   name: 'session',
//   keys: ['username'],
// }));

const MESSAGE = 0;
const DATE = 1;
const CONNECTION = 2;

let chatRooms = [
  {
    name: 'seed test',
    url: 'seedtest',
    messages: [
      {
        type: MESSAGE,
        timestamp: '',
        content: 'blablabla very interesting',
        author: 'username',
      },
    ],
  },
];

app.get('/', (req, res) => {
  res.render('pages/index.ejs', { pageTitle: 'Clavardage', chatRoom: null });
}).get('/:roomName', (req, res) => {
  const currentRoom = chatRooms.find(room => room.url === req.params.roomName);
  if (!currentRoom) {
    res.redirect('/');
  } else {
    res.render('pages/index.ejs', { pageTitle: `Clavardage ${currentRoom.name}`, chatRoom: currentRoom.name });
  }
}).use((ignore, res) => {
  res.setHeader('Content-Type', 'test/plain');
  res.status(404).send('Page not found!');
});

io.on('connection', (socket) => {
  socket.emit('newUser');
});

server.listen(8080);
