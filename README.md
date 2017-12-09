# atom-domterm
an Atom package for the DomTerm terminal emulator

DomTerm is a terminal emulator/multiplexer with lots of
nice features, most notably you can embed graphics/html,
and session management is included.

See http://domterm.org for more about DomTerm.

The atom-domterm requires the ``domterm`` command to be
in your PATH.  (If not, edit the ``domtermCommand`` variable
in ``lib/domterm-view.js``.)  Otherwise atom-domterm requires
no native code or extra packages.

The domterm command runs as a server.  It implements session
(pty) management, and serves up the needed JavaScript and styles.

The atom-domterm package is in pretty early alpha.  The terminal
emulator part is pretty solid, and supports mouse handling, 24-bit
colors, wide characters, and more.  However, pane management (closing
windows, serialization, context menu, etc) is pretty rough. This is
mainly a matter of learning how to hook up the needed functionality
between Atom and DomTerm.  For example serialization is in principle
easy to do: One just needs to ask the DomTerm session to detach
itself, thereby saving its state in the domterm server.
I just need to figure out how ...

Note there is already an Electron wrapper for DomTerm, which
works very well.  That is included in the DomTerm sources,
and is the default user interface for DomTerm.
