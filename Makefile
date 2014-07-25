REPORTER = spec
JSHINT = ./node_modules/.bin/jshint
BASE = .

test:
	@NODE_ENV=development DEBUG=dlogger* ./node_modules/.bin/mocha \
		--require chai \
		--reporter $(REPORTER) \
		--timeout 600s \
		test/*.js
lint:
	$(JSHINT) ./lib/ --config $(BASE)/.jshintrc && \
	$(JSHINT) ./test --config $(BASE)/.jshintrc

.PHONY: test
