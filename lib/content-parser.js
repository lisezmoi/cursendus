module.exports = {
  commands: function(text) {
    var lines = text.split('\n'),
        commands = [],
        start = false;

    for (var i=0; i < lines.length; i++) {
      if (lines[i]) {
        start = true;
        commands.push(lines[i].split(' '));
      } else if (start) {
        break;
      }
    }

    return commands;
  },
  gameId: function(subject) {
    var re = /\[battle id: ([0-9]+)\]/g,
        result = '',
        matches;
    while (matches = re.exec(subject)) {
      result = matches[1];
    }
    if (result) {
      return parseInt(result, 10);
    }
    return false;
  }
};
