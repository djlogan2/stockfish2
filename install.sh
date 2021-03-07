#!/bin/bash

if ! type git >& /dev/null
then
	apt-get install -y git
fi

if ! type node >& /dev/null
then
	curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -
	apt-get install -y nodejs npm
fi

cd /opt

if ! [[ -d stockfish2 ]]
then
	git clone https://github.com/djlogan2/stockfish2.git
fi

cd /opt/stockfish2

if ! [[ -d node_modules ]]
then
	npm install
fi
chmod +x docker/*
node main.js >& /var/log/stockfish2.log &
disown
