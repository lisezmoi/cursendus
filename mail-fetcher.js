var util = require('util'),
    ImapConnection = require('imap').ImapConnection,
    mailparser = require('mailparser'),
    imap,
    spawn = require('child_process').spawn,
    xoauthProcess,
    xoauthParams = {
      user: 'noreply@pierrebertet.net',
      oauth_token: '1/LCms8uqk-Oov7g_q-Ol491jUcjEmyJBpr6YlivEn8G0',
      oauth_token_secret: 'E5kDfAz6TN6xANHPAJQoo9JF'
    },
    xoauthEncoded;

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

function init(xoauthEncoded) {
  imap = new ImapConnection({
    host: 'imap.gmail.com',
    port: 993,
    secure: true,
    xoauth: xoauthEncoded,
    debug: function(msg) { console.log(msg); }
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
      if (!results || !results.length) {
        console.log('No unread messages');
        imap.logout();
        setTimeout(imapConnect, 10000);
        return;
      }

      // results = [results[0]];

      var fetch = imap.fetch(results, { request: { body: 'full', headers: ['from', 'to', 'subject', 'date'] } });

      fetch.on('message', function(msg) {
        newMessage(msg);
      });
      fetch.on('end', function() {
        console.log('Done fetching all messages!');
        imap.logout();
        setTimeout(imapConnect, 10000);
      });
    });
  }

  function newMessage(message) {
    var parser = new mailparser.MailParser();
    parser.on('end', function(mail) {
      console.log('NEW MAIL!!!');
      console.log(mail);
    });

    message.on('data', function(data) {
      parser.write(data.toString());
      parser.end();
    });
  }

  imapConnect();
}
