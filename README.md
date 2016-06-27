# meroku
A basic PaaS implementation for web apps built with NodeJS, inspired by [Heroku](http://www.heroku.com).

## What it Does
Meroku responds to git pushes of your source code, building a fresh [Docker](http://docker.com) image of your app, running it as a container, 
and registering the container with a [Hipache](https://github.com/hipache/hipache) router to expose its HTTP endpoints. At its core is a post-receive git hook script 
written in NodeJS.

## Warning
This is really proof of concept code--functional proof of concept, but proof of concept nonetheless--and has not been 
thoroughly tested. Use at your own risk.
