# Implementation notes

Multiple experiemental implementation approaches have been tried
for how to embed the DomTerm element in an Atom browser.  These
are in the code until we find the best general approach.

## Direct emedding

One option is to use the `<div class="domterm>` object directly
as a pane-item.  This has the advantage that the domterm DOM object
persists if the contating pane or tab is moved, and does not need
to be re-constructed once the pane has been moved to its new position.
Plus there is direct communiation between the domterm JavaScript and
the Atom host. Both of these have potential performance advantages.

This works tolerable well, but at this point using an iframe seems to be
more promising, plus installation is more difficult with direct emedding.

To try direct emedding, do the following:

- In the lib directory copy over or link `domterm-all.js` from the DomTerm
  hlib directory.

- In the styles directory, copy or link `hlib/*.css` from DomTerm.

- In `lib/domterm-view.js` change `usingDirectDM` to true.

## Avoiding need for domterm executable

Delegating process management to the stand-alone domterm executable
simplifies atom-domterm a lot, but it does complicate installation
and distribution.  Could we bundle domterm as a (native) npm module?

Alternatively, instead of the domterm server, one could use
a node.js pty library (node-pty), and talk to that directly.
This approach would probably use the "direct embedding" model
discussed above.

Some features of domterm (such as detachable sessions)
would probably not be reproduced.  The domterm command also
does useful things, such as "printing" pictures.

Ideally, atom-domterm could work both ways, depending on
the configuration: If the domterm command is in the path
we use that; otherwise we use a simple pty shim.
