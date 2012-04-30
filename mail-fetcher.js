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
      init(matches[1]);
    }
  }
});

xoauthProcess.stderr.on('data', function (data) {
  console.log('xoauth.py error: ' + data);
});
xoauthProcess.on('exit', function (code) {
  console.log('xoauth.py exited with code ' + code);
});

function init(xoauthEncoded) {
  imap = new ImapConnection({
    host: 'imap.gmail.com',
    port: 993,
    secure: true,
    xoauth: xoauthEncoded
    // debug: function(msg) { console.log(msg); }
  });

  function die(err) {
    console.log(err);
    process.exit(1);
  }
  function imapConnect() {
    imap.connect(function(err) {
      if (err) die(err);
      imap.openBox('INBOX', false, watchInbox);
    });
  }

  function watchInbox(err, box) {
    imap.search(['UNSEEN'], function(err, results) {
      var fetch;
      if (!results || !results.length) {
        console.log('No unread messages');
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
        console.log('end fetch');
        setTimeout(watchInbox, fetchInterval);
      });
    });
  }

  function newMessage(message) {
    var parser = new mailparser.MailParser();
    parser.on('end', function(mail) {
      console.log(mail)
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
