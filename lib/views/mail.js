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

function renderTpl(tplname, opts) {
  var tpl = templatePath.replace(/\{tplname\}/, tplname),
      template = fs.readFileSync(tpl, 'utf8');
  opts.mode = 'email';
  return ejs.render(template, opts);
}

function getHtmlBody(game, activePlayer, assetsUrl) {
  return renderTpl('game', {
    player1: game.player1,
    player2: game.player2,
    player: activePlayer,
    otherPlayer: game.getOtherPlayer(activePlayer),
    turn: game.turn,
    terrain: game.terrain.map,
    assetsUrl: assetsUrl
  });
}

var SmtpView = function() {
  events.EventEmitter.call(this);
};
util.inherits(SmtpView, events.EventEmitter);

SmtpView.prototype.start = function(gamesManager, pubsub, conf) {
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
              lastCommandStatus;
          if (commands.length > 0) {
            for (var i=0; i < commands.length; i++) {
              lastCommandStatus = game.command(player, commands[i][0] + ' ' + commands[i][1]);
            }
            if (lastCommandStatus) {
              // New turn
              if (game.commandsEnd(player)) {
                var body1 = getHtmlBody(game, game.player1, conf.assetsUrl),
                    body2 = getHtmlBody(game, game.player2, conf.assetsUrl);
                sendMessage(game.player1.email, game, body1);
                sendMessage(game.player2.email, game, body2);
              };
            } else {
              console.log('Invalid commands in the message.');
              return;
            }

          } else {
            console.log('Missing commands in the message.');
            return;
          }
        } else {
          console.log('Error: the user is not a player of this game');
        }
      });

    // The game does not exists, try to create a new game.
    } else if (addresses.length === 2) {
      gamesManager.addGame(addresses[0], addresses[1], function(game) {
        var body1 = getHtmlBody(game, game.player1, conf.assetsUrl),
            body2 = getHtmlBody(game, game.player2, conf.assetsUrl);
        sendMessage(addresses[0], game, body1);
        sendMessage(addresses[1], game, body2);
      });

    // Not enough emails to create a game
    } else {
      console.log('Error: 2 mails are needed to create a game.');
      return;
    }

  }

  function sendMessage(playerEmail, game, htmlBody, cb) {
    transport.sendMail({
        from: 'Cursendus <'+ conf.emailParams.email +'>',
        to: playerEmail,
        subject: 'Cursendus ~ [battle id: ' + game.id + ']',
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
