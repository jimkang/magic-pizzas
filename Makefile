HOMEDIR = $(shell pwd)
PROJECTNAME = magic-pizzas
APPDIR = /var/apps/$(PROJECTNAME)

pushall:
	git push origin master

start-responder:
	psy start -n $(PROJECTNAME)-responder -- node $(PROJECTNAME)-responder.js
