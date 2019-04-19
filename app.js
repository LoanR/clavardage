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
const DISCONNECTION = 3;

const entryTypes = {
  message: MESSAGE,
  date: DATE,
  connection: CONNECTION,
  disconnection: DISCONNECTION,
};

let chatRooms = [
  {
    name: 'seed test',
    url: 'seedtest',
    entries: [
      {
        type: MESSAGE,
        timestamp: '',
        content: 'blablabla very interesting',
        author: 'username',
      },
      {
        type: DATE,
        timestamp: 'Monday, april 12th, 2028',
      },
      {
        type: MESSAGE,
        timestamp: '',
        content: 'Not that interesting',
        author: 'Jo',
      },
      {
        type: CONNECTION,
        timestamp: '12:26',
        user: 'Mark',
      },
      {
        type: MESSAGE,
        timestamp: '',
        content: 'Not that interesting',
        author: 'Mark',
      },
      {
        type: DISCONNECTION,
        timestamp: '12:31',
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
        timestamp: '12:28',
        content: 'message in another room',
        author: 'mister',
      },
      {
        type: CONNECTION,
        timestamp: '',
        user: 'B',
      },
      {
        type: MESSAGE,
        timestamp: '12:30',
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
