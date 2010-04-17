#!/bin/sh

java -classpath rhino/js.jar org.mozilla.javascript.tools.shell.Main runCheckstyle.js "$@"

# if you experience an "Out of Memory" error, you can increase it as follows:
#java -Xms256m -Xmx256m -classpath rhino/js.jar org.mozilla.javascript.tools.shell.Main  runCheckstyle.js "$@"
