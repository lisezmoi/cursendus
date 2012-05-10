# Cursendus commands

The Cursendus actions must be written at the very top of the email.
Each command must be separated by a new line.
You can use multiple commands at once.

Example:

    trace EAST
    attack C10


## trace [direction]

The `trace` command:

- moves the character to the chosen direction
- trace a magic segment on the previously occupied square

Available directions:

- north (aliases: n, NORTH, N)
- east (aliases: e, EAST, E)
- south (aliases: s, SOUTH, S)
- west  (aliases: w, WEST, W)

Examples:

	trace north
	trace EAST
	trace S


## attack [position]

The `attack` command allows to attack an opponent. You must target the targetted square with its exact position, using the letters and numbers arranged around the board.

Examples:

	attack d10
	attack C15
	attack 10d


## move [direction]

The `move` command allows for moving the character to the chosen direction.

Available directions: same as the command `trace [direction]`

