DomtermView = require './domterm-view'
{CompositeDisposable} = require 'atom'

capitalize = (str)-> str[0].toUpperCase() + str[1..].toLowerCase()

# FIXME rename to DomTermManager (?) to avoid confusion.
module.exports = Domterm =
  domtermView: null
  modalPanel: null
  subscriptions: null
  viewURI: "http://localhost:7788/#ws=same"

  activate: (state) ->
    #@domtermView = new DomtermView(state.domtermViewState)
    #@modalPanel = atom.workspace.addModalPanel(item: @domtermView.getElement(), visible: false)

    # Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    @subscriptions = new CompositeDisposable

    # Register command that toggles this view
    @subscriptions.add atom.commands.add 'atom-workspace', 'domterm:toggle': => @toggle()
    @subscriptions.add atom.commands.add 'atom-workspace', 'domterm:openview', ->
      atom.workspace.open(new DomtermView(state.domtermViewState))
    ['up', 'right', 'down', 'left'].forEach (direction) =>
       @subscriptions.add atom.commands.add "atom-workspace", "domterm:open-split-#{direction}": => @splitTerm(direction)

  deactivate: ->
    @modalPanel.destroy()
    @subscriptions.dispose()
    #@domtermView.destroy()

  toggle: ->
    console.log 'Domterm was toggled!'

    #if @modalPanel.isVisible()
    #  @modalPanel.hide()
    #else
    #  @modalPanel.show()

  createTermView: (options=null) ->
    console.log 'Domterm createTermView called!'
    dmv = new DomtermView(options)
    dmv.domterm = this
    return dmv

  splitTerm: (direction, options=null) ->
    console.log 'Domterm splitTerm '+direction+' called!'
    if direction=='tab'
       atom.workspace.open(@createTermView(options))
       return
    openPanesInSameSplit = atom.config.get 'domterm.openPanesInSameSplit'
    termView = @createTermView(options)
    direction = capitalize direction

    splitter = =>
      pane = activePane["split#{direction}"] items: [termView]
      activePane.termSplits[direction] = pane
      @focusedTerminal = [pane, pane.items[0]]
      #@disposables.add @attachSubscriptions(termView, pane.items[0], pane)

    activePane = atom.workspace.getActivePane()
    activePane.termSplits or= {}
    if openPanesInSameSplit
      if activePane.termSplits[direction] and activePane.termSplits[direction].items.length > 0
        pane = activePane.termSplits[direction]
        item = pane.addItem termView
        pane.activateItem item
        @focusedTerminal = [pane, item]
        @disposables.add @attachSubscriptions(termView, item, pane)
      else
        splitter()
    else
      splitter()
