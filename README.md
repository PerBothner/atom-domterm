# atom-domterm
an Atom package for the DomTerm terminal emulator

DomTerm is a terminal emulator/multiplexer with lots of
nice features, most notably you can embed graphics/html,
and session management is included.
See http://domterm.org for more about DomTerm.

The atom-domterm package requires the ``domterm`` command to be
in your PATH.  (If not, edit the ``domtermCommand`` variable
in ``lib/domterm-view.js``.)  Otherwise atom-domterm requires
no native code or extra packages.

To run it, place a link to the atom-domterm directory
in ``~/.atom/packages``.  Then DomTerm should come up in
the Atom ``Packages`` menu.

The domterm command runs as a server.  It implements session
(pty) management, and serves up the needed JavaScript and styles.

Note there is already an Electron wrapper for DomTerm, which
works very well.  That is included in the DomTerm sources,
and is the default user interface for DomTerm.

The atom-domterm package is unpolished.  It has only been tested on
Fedora 27.  The terminal emulator part is pretty solid, and supports
mouse handling, 24-bit colors, wide characters, and more.  You can
create multiple panes, and drag them with the mouse.  However,
integration with Atom is limited.  The DomTerm multi-pane
functionality has not been integrated with Atom.  And so on.

## Features

* A solid modern terminal emulator.
  Mouse handling; 24-bit color; encodes special keys.
  Good xterm compatibility and does very well on the vttest test suite.
  Good Unicode support, including wide characters.
* Remembers tab characters and distingishes explict new-line from line-wrap.
  So you can `cat` a `Makefile`, and then copy-and-paste it.
  Lines as re-wrapped on terminal re-size.
* You can "print" graphics or general HTML.
  This makes domterm suitable as a "graphing calculator".    For example
  Gnuplot can [display graph output inline](http://per.bothner.com/blog/2016/gnuplot-in-domterm/).
  You can have the `man` command print HTML to the console.
  Many other possibilities.
* The basic "session management" functionality of `tmux` or GNU Screen:
  You can detach and re-attach session. (Not yet integrated into atom-domterm.)
* Builtin optional line-editor (like a simplified `readlne`).
* Builtin optional pager (like a simplified `less`).
