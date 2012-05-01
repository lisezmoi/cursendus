var util = require('util'),
    conf = require('./config'),
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
    // debug: function(msg) { console.log(msg); }
  });

  function die(err) {
    logger.error(err);
    process.exit(1);
  }
  function imapConnect() {
    imap.connect(function(err) {
      if (err) die(err);
      logger.info('IMAP connected.');
      imap.openBox('INBOX', false, watchInbox);
    });
  }

  function watchInbox(err, box) {
    imap.search(['UNSEEN'], function(err, results) {
      var fetch;
      if (!results || !results.length) {
        // console.log('No unread messages');
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
        logger.info('end fetch');
        setTimeout(watchInbox, fetchInterval);
      });
    });
  }

  function newMessage(message) {
    var parser = new mailparser.MailParser();
    parser.on('end', function(mail) {
      logger.info('New mail');
      logger.info(mail);
      pubsub.publish('game:emails', JSON.stringify(mail));
    });
    message.on('data', function(data) {
      parser.write(data.toString());
    });
    message.on('end', function() {
      parser.end();
    });
  }

  imapConnect();
}

function main(logger) {
  xoauthProcess = spawn('python', ['./tools/xoauth.py',
    '--generate_xoauth_string',
    '--user=' + xoauthParams.user,
    '--oauth_token=' + xoauthParams.oauth_token,
    '--oauth_token_secret=' + xoauthParams.oauth_token_secret]);

  xoauthProcess.stdout.on('data', function (data) {
    var lines = data.toString().split('\n');
    for (var i=0; i < lines.length; i++) {
      var matches = lines[i].match(/^XOAUTH string \(base64\-encoded\): (.+)/);
      if (matches && matches[1]) {
        imapWatch(matches[1], logger);
      }
    }
  });

  xoauthProcess.stderr.on('data', function (data) {
    logger.error('xoauth.py error: ' + data);
  });
  xoauthProcess.on('exit', function (code) {
    if (code != 0) {
      logger.info('xoauth.py exited with code ' + code);
    }
  });
}


if (require.main === module) {
  main(require('winston'));
} else {
  module.exports = main;
}
