TESTS = test/*.js
REPORTER = dot

api:
	./node_modules/yuidocjs/lib/cli.js \
		--config ./yuidoc.json ./lib

test:
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--reporter $(REPORTER) \
		$(TESTS)

.PHONY: test
