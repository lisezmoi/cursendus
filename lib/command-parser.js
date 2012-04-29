var commands = {};

commands['move'] = {
  regex: /^move +(N|E|S|W|NORTH|EAST|SOUTH|WEST)\W?$/i,
  cleanValue: function(commandStr) {
    var val = commandStr.match(this.regex);
    return val[1].slice(0,1).toUpperCase();
  }
};

commands['attack'] = {
  regex: /^attack +(([a-zA-Z])([1-9][0-9]?)|([1-9][0-9]?)([a-zA-Z]))\W?$/i,
  cleanValue: function(commandStr) {
    var val = commandStr.match(this.regex);
    if (val[4] && val[5]) {
      return [val[5].toUpperCase(), val[4]];
    }
    return [val[2].toUpperCase(), val[3]];
  }
};

function commandParser(commandStr) {
  var command;
  for (var name in commands) {
    if (commands.hasOwnProperty(name) && commands[name].regex.test(commandStr)) {
      command = name;
      break;
    }
  }
  if (!command) {
    return false;
  }
  return {
    action: command,
    value: commands[name].cleanValue(commandStr)
  };
};

module.exports = commandParser;