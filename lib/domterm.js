const {CompositeDisposable} = require('atom');

let modalPanel = null;
let subscriptions = null;
let statusBarItem = document.createElement('span');
let statusBarTile = null;
let focusedTerminal = null;
let disposable = null;

module.exports = {
    activate: activate,
    consumeStatusBar: consumeStatusBar,
    deactivate: deactivate,
    toggle: toggle,
    createTermView: createTermView,
    splitTerm: splitTerm,
    statusBarItem: statusBarItem
};
const DomtermView = require('./domterm-view');

function activate(state) {
    console.log("activate Domterm st:"+state);
    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    subscriptions = new CompositeDisposable()

    // Register command that toggles this view
    //this.subscriptions.add(atom.commands.add 'atom-workspace', 'domterm:toggle': => @toggle()

    subscriptions.add(atom.commands.add('atom-workspace',
                                        'domterm:openview',
                                        () =>
                                        atom.workspace.open(createTermView())));
    ['up', 'right', 'down', 'left']
        .forEach((direction) =>
                 subscriptions.add(atom.commands.add("atom-workspace", "domterm:open-split-"+direction, () => {splitTerm(direction)})))
    statusBarItem.innerHTML = "[DomTerm item]";
    subscriptions.add(atom.workspace
                      .onDidChangeActivePaneItem
                      ((item) => {
                          if (item && item.constructor.name=="DomTermView") {
                              item.updateStatusBar();
                          } else {
                              statusBarItem.innerHTML = "";
                          }}));
}

function consumeStatusBar(statusBar) {
    statusBarTile = statusBar.addLeftTile({item: statusBarItem, priority: 100})
}

function deactivate() {
    modalPanel.destroy();
    subscriptions.dispose();
    if (statusBarTile) {
        statusBarTile.destroy();
        statusBarTile = null
    }
}

function toggle() {
    console.log('Domterm was toggled!');

    //if @modalPanel.isVisible()
    //  @modalPanel.hide()
    //else
    // @modalPanel.show()
}

function createTermView(options=null) {
    console.log('Domterm createTermView called!');
    return new DomtermView(options);
}

function splitTerm (direction, options=null) {
    console.log('Domterm splitTerm '+direction+' called!');
    const termView = createTermView(options);
    if (direction=='tab') {
        atom.workspace.open(termView);
        return;
    }
    const activePane = atom.workspace.getActivePane();
    const Direction = direction.charAt(0).toUpperCase()
          + direction.substring(1).toLowerCase();
    activePane["split"+Direction]({items: [termView]});
    return;
    /*
    if (direction=='down') {
        activePane.splitDown({items: [termView]});
        return;
    }
    const openPanesInSameSplit = atom.config.get('domterm.openPanesInSameSplit');

    direction = direction.charAt(0).toUpperCase()
        + direction.substring(1).toLowerCase();

    function splitter() {
        const pane = activePane["split#{direction}"]({items: [termView]});
        activePane.termSplits[direction] = pane;
        focusedTerminal = [pane, pane.items[0]];
        //disposables.add(attachSubscriptions(termView, pane.items[0], pane))
    }

    if (! activePane.termSplits)
        activePane.termSplits = {};
    if (openPanesInSameSplit) {
        if (activePane.termSplits[direction] && activePane.termSplits[direction].items.length > 0) {
            const pane = activePane.termSplits[direction];
            const item = pane.addItem(termView);
            pane.activateItem(item);
            focusedTerminal = [pane, item];
            disposables.add(attachSubscriptions(termView, item, pane));
        } else
            splitter();
    } else
        splitter();
    */
}
