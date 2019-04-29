// import express from 'express';
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const ent = require('ent');

const urlencodedParser = bodyParser.json();
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);

const MESSAGE = 0;
const DATE = 1;
const CONNECTION = 2;

const entryTypes = {
  message: MESSAGE,
  date: DATE,
  connection: CONNECTION,
};

const chatRooms = [
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
        content: ent.encode('éléphant <strong> énervé </strong>'),
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
  {
    name: 'Once again',
    url: 'onceagain',
    entries: [],
  },
];

function sendNewEntry(currentRoom, newEntry) {
  currentRoom.entries.push(newEntry);
  let newEntryRender = null;
  ejs.renderFile(
    './views/partials/roomDetail/entry.ejs',
    {
      entry: newEntry,
      entryTypes,
    },
    (err, result) => {
      if (err) {
        // eslint-disable-next-line no-alert
        alert(err);
      } else {
        newEntryRender = result;
      }
    },
  );
  io.emit(
    'newEntry',
    newEntryRender,
  );
}

function chronologicalSort(entries) {
  if (entries.length > 0) {
    return entries.sort((x, y) => x.timestamp - y.timestamp);
  }
  return entries;
}

function nowIsAnotherDay(lastEntry) {
  const lastEntryDate = new Date(lastEntry.timestamp);
  lastEntryDate.setHours(0, 0, 0, 0);
  const now = new Date(Date.now());
  now.setHours(0, 0, 0, 0);
  return lastEntryDate.getTime() < now.getTime();
}

app.use((req, ignore, next) => {
  req.io = io;
  next();
});

io.on('connection', (socket) => {
  socket.emit('newUser');
});

app.get('/', (ignore, res) => {
  res.render('pages/index.ejs', {
    pageTitle: 'Clavardage',
    chatRoom: null,
    chatRooms,
  });
});

app.get('/:roomName', (req, res) => {
  const currentRoom = chatRooms.find(room => room.url === req.params.roomName);
  if (!currentRoom) {
    res.redirect('/');
  } else {
    res.render('pages/index.ejs', {
      pageTitle: `Clavardage ${currentRoom.name}`,
      chatRoom: currentRoom.name,
      roomUrl: currentRoom.url,
      entries: chronologicalSort(currentRoom.entries),
      entryTypes,
    });
  }
});

app.post('/messages', urlencodedParser, (req, res) => {
  const errors = [];
  if (!req.body || typeof req.body.author === 'undefined' || req.body.author === '') {
    errors.push('You should have a username...');
  }
  if (!req.body || typeof req.body.content === 'undefined' || req.body.content === '') {
    errors.push('The message cannot be empty.');
  }
  const currentRoom = chatRooms.find(room => room.url === req.body.roomUrl);
  if (!req.body || typeof req.body.roomUrl === 'undefined' || !currentRoom) {
    errors.push('You cannot send a message in another room.');
  }
  if (errors.length > 0) {
    res.status(400).send({ errors });
  } else {
    if (
      currentRoom.entries.length === 0 || (
        currentRoom.entries.length >= 2
        && nowIsAnotherDay(currentRoom.entries[currentRoom.entries.length - 1])
      )
    ) {
      const newDate = {
        type: DATE,
        timestamp: new Date(Date.now()),
      };
      sendNewEntry(currentRoom, newDate);
    }
    const newEntry = {
      type: MESSAGE,
      timestamp: new Date(Date.now()),
      content: ent.encode(req.body.content),
      author: ent.encode(req.body.author),
    };
    sendNewEntry(currentRoom, newEntry);
    res.sendStatus(200);
  }
});

app.use((ignore, res) => {
  res.setHeader('Content-Type', 'test/plain');
  res.status(404).send('Page not found!');
});

server.listen(8080);
