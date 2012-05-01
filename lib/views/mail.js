var util = require('util'),
    events = require('events'),
    redis = require('redis'),
    _ = require('underscore'),
    fs = require('fs'),
    ejs = require('ejs'),
    nodemailer = require('nodemailer'),
    contentParser = require('../content-parser'),
    init = false,
    templatePath = __dirname + '/../../tpl/{tplname}.html';

function extractEmails(message, exclude) {
  var emails = [];

  emails.push(message.from[0].address);

  [message.to, message.cc].forEach(function(group) {
    if (group && group.length > 0) {
      group.forEach(function(email) {
        if (email.address !== exclude) {
          emails.push(email.address);
        }
      })
    }
  });

  // Remove duplicates
  emails = _.uniq(emails);

  // Only the first 2 emails
  emails = emails.slice(0, 2);

  return emails;
}

function gameBody(game, activePlayer, assetsUrl, template, cb) {
  template.render('game', {
    layout: '_layout',
    mode: 'email',
    player1: game.player1,
    player2: game.player2,
    player: activePlayer,
    otherPlayer: game.getOtherPlayer(activePlayer),
    turn: game.turn,
    terrain: game.terrain.map,
    assetsUrl: assetsUrl
  },
  function(body) {
    return cb(body);
  });
}
function messageBody(message, assetsUrl, template, cb) {
  template.render('message', {
    layout: '_layout',
    mode: 'email',
    messageSubject: 'A message from Cursendus',
    messageBody: message,
    assetsUrl: assetsUrl
  },
  function(body) {
    return cb(body);
  });
}

var SmtpView = function() {
  events.EventEmitter.call(this);
};
util.inherits(SmtpView, events.EventEmitter);

SmtpView.prototype.start = function(gamesManager, template, pubsub, errorMessages, logger, conf) {
  var self = this,
      transport;

  if (init) return;
  init = true;

  function handleMessage(message) {
    var addresses = extractEmails(message, conf.emailParams.email),
        gameId = contentParser.gameId(message.subject),
        fromAddress;

    console.log('[incoming message] %d email addresse(s)', addresses.length);

    if (addresses.length === 0 || !message.from[0] || !message.from[0].address) {
      // Error
      console.log('Error: missing the `from` address.');
      return;
    }

    fromAddress = message.from[0].address;

    // Game command
    if (gameId) {
      gamesManager.getGame(gameId, function(game) {
        var player = game.getPlayerById(fromAddress);
        if (player !== false) {
          var commands = contentParser.commands(message.text),
              oneValidCommand,
              lastCommandStatus;
          if (commands.length > 0) {
            for (var i=0; i < commands.length; i++) {
              lastCommandStatus = game.command(player, commands[i][0] + ' ' + commands[i][1]);
              if (!oneValidCommand && lastCommandStatus) {
                oneValidCommand = true;
              }
            }
            if (oneValidCommand) { // At least one valid command
              if (game.commandsEnd(player)) { // New turn?
                gameBody(game, game.player1, conf.assetsUrl, template, function(body) {
                  sendMessage(game.player1.email, game.id, true, body);
                });
                gameBody(game, game.player2, conf.assetsUrl, template, function(body) {
                  sendMessage(game.player2.email, game.id, true, body);
                });
              };
            } else {
              console.log('Invalid commands in the message.');
              messageBody(errorMessages['command'], conf.assetsUrl, template, function(body) {
                sendMessage(fromAddress, game.id, true, body);
              });
              return;
            }

          } else {
            console.log('Missing commands in the message.');
            messageBody(errorMessages['command'], conf.assetsUrl, template, function(body) {
              sendMessage(fromAddress, game.id, true, body);
            });
            return;
          }
        } else {
          console.log('Error: the user is not a player of this game');
        }
      });

    // The game does not exists, try to create a new game.
    } else if (addresses.length === 2) {
      gamesManager.addGame(addresses[0], addresses[1], function(game) {
        gameBody(game, game.player1, conf.assetsUrl, template, function(body) {
          sendMessage(addresses[0], game.id, false, body);
        });
        gameBody(game, game.player2, conf.assetsUrl, template, function(body) {
          sendMessage(addresses[1], game.id, false, body);
        });
      });

    // Not enough emails to create a game
    } else {
      console.log('Error: 2 mails are needed to create a game.');
      return;
    }

  }

  function sendMessage(playerEmail, gameId, reply, htmlBody, cb) {
    var subject = 'Cursendus ~ [battle id: ' + gameId + ']';
    if (reply) {
      subject = 'Re: ' + subject;
    }
    transport.sendMail({
        from: 'Cursendus <'+ conf.emailParams.email +'>',
        to: playerEmail,
        subject: subject,
        text: 'TODO',
        html: htmlBody
    }, cb);
  }

  transport = nodemailer.createTransport('SMTP', {
    service: 'Gmail',
    auth: {
      XOAuthToken: nodemailer.createXOAuthGenerator({
          user: conf.emailParams.email,
          token: conf.emailParams.oauthToken,
          tokenSecret: conf.emailParams.oauthTokenSecret
      })
    }
  });

  pubsub.on('message', function(channel, messageStr) {
    var message = JSON.parse(messageStr);
    console.log('subject', message.subject)
    console.log('text', message.text)
    console.log('from', message.from)
    console.log('to', message.to)
    console.log('cc', message.cc)
    return handleMessage(message);
  });

  pubsub.subscribe('game:emails');
};

module.exports = new SmtpView;
