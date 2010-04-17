#!/bin/sh

JSCHECKSTYLE_HOME=`dirname $0`

java -DJSCHECKSTYLE_HOME=$JSCHECKSTYLE_HOME/  -classpath $JSCHECKSTYLE_HOME/rhino/js.jar org.mozilla.javascript.tools.shell.Main $JSCHECKSTYLE_HOME/runCheckstyle.js "$@"

# if you experience an "Out of Memory" error, you can increase it as follows:
#java -Xms256m -Xmx256m -classpath rhino/js.jar org.mozilla.javascript.tools.shell.Main  runCheckstyle.js "$@"
