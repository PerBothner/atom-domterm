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

