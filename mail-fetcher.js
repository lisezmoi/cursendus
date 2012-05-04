var util = require('util'),
    conf = require('./config'),
    nodemailer = require('nodemailer'),
    ImapConnection = require('imap').ImapConnection,
    mailparser = require('mailparser'),
    imap,
    spawn = require('child_process').spawn,
    xoauthProcess,
    xoauthParams = {
      user: conf.emailParams.email,
      oauth_token: conf.emailParams.oauthToken,
      oauth_token_secret: conf.emailParams.oauthTokenSecret
    },
    xoauthEncoded,
    redis = require('redis'),
    pubsub = redis.createClient(),
    fetchInterval = 2000;

function imapWatch(xoauthEncoded, logger) {
  imap = new ImapConnection({
    host: 'imap.gmail.com',
    port: 993,
    secure: true,
    xoauth: xoauthEncoded
    // , debug: function(msg) { console.log(msg); }
  });

  imap.on('error', function(err) {
    logger.error(err);
  });
  imap.on('close', function(err) {
    logger.info('IMAP connection closed. Reconnect...');
    imapWatch(xoauthEncoded, logger);
  });

  imap.connect(function(err) {
    if (err) {
      logger.error(err);
      process.exit(1);
    }
    logger.info('IMAP connected.');
    imap.openBox('INBOX', false, watchInbox);
  });

  function watchInbox(err, box) {
    imap.search(['UNSEEN'], function(err, results) {
      var fetch;
      if (!results || !results.length) {
        // logger.info('No unread messages. Retry...');
        setTimeout(watchInbox, fetchInterval);
        return;
      }

      fetch = imap.fetch(results, {
        markSeen: true,
        request: {
          body: 'full',
          headers: false,
          struct: false
        }
      });

      fetch.on('message', function(msg) {
        newMessage(msg);
      });
      fetch.on('end', function() {
        logger.info('Fetching messages ended.');
        setTimeout(watchInbox, fetchInterval);
      });
    });
  }

  function newMessage(message) {
    var parser = new mailparser.MailParser();
    parser.on('end', function(mail) {
      logger.info('[mail-fetcher] New mail: ' + mail.subject);
      pubsub.publish('game:emails', JSON.stringify(mail));
    });
    message.on('data', function(data) {
      parser.write(data.toString());
    });
    message.on('end', function() {
      parser.end();
    });
  }
}

function main(logger) {
  var xoauthEncoded = nodemailer.createXOAuthGenerator({
    requestUrl: 'https://mail.google.com/mail/b/' + xoauthParams.user + '/imap/',
    user: xoauthParams.user,
    token: xoauthParams.oauth_token,
    tokenSecret: xoauthParams.oauth_token_secret
  }).generate();
  imapWatch(xoauthEncoded, logger);
}

if (require.main === module) {
  main(require('winston'));
} else {
  module.exports = main;
}
