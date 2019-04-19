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

const entryTypes = {
  message: MESSAGE,
  date: DATE,
  connection: CONNECTION,
};

let chatRooms = [
  {
    name: 'seed test',
    url: 'seedtest',
    entries: [
      {
        type: MESSAGE,
        timestamp: new Date(Date.UTC(2016, 11, 20, 3, 10, 12)),
        content: 'blablabla very interesting',
        author: 'username',
      },
      {
        type: DATE,
        timestamp: new Date(Date.UTC(2016, 11, 20, 3, 12, 45)),
      },
      {
        type: MESSAGE,
        timestamp: new Date(Date.UTC(2016, 11, 20, 3, 13, 2)),
        content: 'Not that interesting',
        author: 'Jo',
      },
      {
        type: CONNECTION,
        inRoom: true,
        timestamp: new Date(Date.UTC(2016, 11, 20, 3, 14, 31)),
        user: 'Mark',
      },
      {
        type: MESSAGE,
        timestamp: new Date(Date.UTC(2016, 11, 20, 3, 15, 1)),
        content: 'Not that interesting',
        author: 'Mark',
      },
      {
        type: CONNECTION,
        inRoom: false,
        timestamp: new Date(Date.UTC(2016, 11, 20, 3, 16, 34)),
        user: 'Mark',
      },
    ],
  },
  {
    name: 'Another test',
    url: 'anothertest',
    entries: [
      {
        type: MESSAGE,
        timestamp: new Date(Date.UTC(2016, 11, 21, 3, 16, 34)),
        content: 'message in another room',
        author: 'mister',
      },
      {
        type: CONNECTION,
        inRoom: true,
        timestamp: new Date(Date.UTC(2016, 11, 21, 3, 16, 56)),
        user: 'B',
      },
      {
        type: MESSAGE,
        timestamp: new Date(Date.now()),
        content: 'another thing',
        author: 'B',
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
    res.render('pages/index.ejs', {
      pageTitle: `Clavardage ${currentRoom.name}`,
      chatRoom: currentRoom.name,
      entries: currentRoom.entries,
      entryTypes,
    });
  }
}).use((ignore, res) => {
  res.setHeader('Content-Type', 'test/plain');
  res.status(404).send('Page not found!');
});

io.on('connection', (socket) => {
  socket.emit('newUser');
});

server.listen(8080);
