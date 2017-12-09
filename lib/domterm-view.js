var domtermCounter = 0;
var domtermCommand = "domterm";
//var execFile = require('child_process').execFile;
//var exec = require('child_process').exec;
var spawn = require('child_process').spawn;
var usingWebview = true;

class DomTermView {
    constructor (serializedState) {
        var view = this;
        // Create root element
        //this.element = document.createElement('div')
        var webview;
        if (usingWebview) {
            webview = document.createElement('webview');
            webview.setAttribute("class", "native-key-bindings domterm");
        } else {
            // handles more key-bindings better
            webview = document.createElement('iframe');
            webview.setAttribute("width", "100%");
            webview.setAttribute("height", "100%");
        }
        webview.addEventListener('close',
                                 function(ev) {
                                     // FIXME is this right? Probably not
                                     // We want the pane assiocated with this view
                                     var pane = atom.workspace.getActivePane();
                                     view.destroy(); pane.close(); },
                                 false);
        this.element = webview;
        this.webview = webview;
        //this.element.appendChild(webview)
        if (serializedState) {
            this.counter = serializedState.counter;
            this.title = serializedState.title;
            this.url = serializedState.url;
            webview.src = this.url;
            webview.focus();
            return;
        } else {
            this.counter = ++domtermCounter;
            this.title = "domterm-"+this.counter;
        }
        view.url = "";
        var dproc = spawn(domtermCommand, ["--print-url"]);
        dproc.stdout.on('data', (data) => {
            var url = view.url + data
            view.url = view;
            var dlen = url.length;
            console.log("dproc got "+dlen+" characters");
            if (url.length > 0 && url.charAt(url.length-1) == '\n') {
                url = url.substring(0, url.length-1);
                view.url = url;
                webview.src = url;
                webview.focus();
            }
        });
        dproc.on('close', (code)=> {
            console.log('child process exited with code ${code}');
        });
        /* // For some reason the execFile call back isn't being called.
           // It works when starting a new server process, but not when
           // connecting to an existing one.
        execFile("/home/bothner/Software/DomTerm/bin/domterm", ["--print-url"],
                 (error, stdout, stderr) => {
                     console.log("exec callback error:"+(!!error));
                     if (error) {
                         view.url = "???";
                         webview.innerHTML = error;
                         return;
                     };
                     //var url = stderr.toString();
                     var url = stdout.toString();
                     if (url.length > 0 && url.charAt(url.length-1) == '\n')
                         url = url.substring(0, url.length-1);
                     view.url = url;
                     webview.src = url;
                     webview.focus();
                 });
        */
    }

    serialize () {
        console.log("serialize "+this.title);
        // FIXME ask domterm object to detach
        return { "url": this.url,
                 "counter": this.counter,
                 "title": this.title }
    }

    destroy () {
        console.log("remove "+this.title);
        this.element.remove();
    }

    getElement () {
        return this.element;
    }
    getTitle() {
        return this.title;
    }

}
module.exports = DomTermView;

/* OLD domterm-view.coffee 
domtermCounter = 0

#DomTerm = require('./terminal')
spawn = require('child_process').spawn
execFile = require('child_process').execFile

module.exports =
class DomtermView
  constructor: (serializedState) ->
    @counter = ++domtermCounter
    @title = "domterm-"+@counter
    pane = atom.workspace.getActivePane()
    # Create root element
    @element = document.createElement('div')
    @webview = webview = document.createElement('webview')
    @element.appendChild(webview)
    #webview = document.createElement('iframe')
    webview.setAttribute("width", "100%")
    webview.setAttribute("height", "100%")
    #@element = webview
    #domterm = spawn("/home/bothhner/Software/DomTerm/bin/domterm", ["--print-url"])
    #domterm.stdout.on('data', (data) => { webview.src = data })
    execFile("/home/bothhner/Software/DomTerm/bin/domterm", ["--print-url"],
      (error, stdout, stderr) -> {
          #if error      {  };
          url = stdout.toString();
          #if url.length > 0 && url.charAt(url.length-1) == '\n'
          url = url.substring(0, url.length-1)
          webview.src = url
        }
    )
    # webview.src = 'file:///home/bothner/.domterm/default.html#connect-pid=21151'
    #    http://localhost:7071/domterm/#ajax'
    #webview.src = 'http://localhost:8020/#ws=same'
    #webview.src = 'http://per.bothner.com'
    webview.focus()

  constructorxx: (serializedState) ->
    @counter = ++domtermCounter
    @title = "domterm-"+@counter
    webview = document.createElement('webview')
    #webview = document.createElement('iframe')
    #webview.setAttribute("width", "100%")
    #webview.setAttribute("height", "100%")
    @element = webview
    # Websockets doesn't work if more than one pane; ajax does
    webview.src = 'http://localhost:7071/domterm/#ajax'
    #webview.src = 'http://localhost:8020/#ws=same'
    #webview.src = 'http://per.bothner.com'
    webview.focus()

  constructorav: (serializedState) ->
    @counter = ++domtermCounter
    @title = "domterm-"+@counter
    pane = atom.workspace.getActivePane()
    # Create root element
    @element = element = document.createElement('div')
    @dtelement = dtelement = document.createElement('div')
    element.appendChild(dtelement)
    dtelement.classList.add('domterm')
    @term = term = new DomTerm(@title)
    wspath = "ws://localhost:8020/websocket/replsrv"
    wsprotocol = "domterm"
    wsocket = new WebSocket(wspath, wsprotocol)
    wsocket.binaryType = "arraybuffer"
    @term.processInputCharacters = ((str) -> wsocket.send(str))
    wsocket.onmessage = (evt) -> (
        term.insertBytes(new Uint8Array(evt.data))
    )
    #@if (topNode == null)
    #    topNode = document.getElementById("domterm");
    #topNode.terminal = wt;
    wsocket.onopen = (e)  -> (
        wsocket.send("\x92VERSION "+DomTerm.versionInfo+"\n")
        term.initializeTerminal(dtelement)
    )
    pane.onDidActivate(() -> dtelement.focus())
    #@term.topNode.focus()

  constructoryy: (serializedState) ->
    @counter = ++domtermCounter
    @title = "domterm-"+@counter
    pane = atom.workspace.getActivePane()
    # Create root element
    @element = document.createElement('div')
    @element.classList.add('domterm')
    @term = term = new DomTerm(@title)
    term.reportEvent("VERSION", DomTerm.versionInfo)
    term.initializeTerminal(@element)
    #term.setInputMode(112) # 'p'ipe mode
    # term.setInputMode(108) # 'l'ine mode
    #term.setInputMode(99)
    #term.insertString("Hello\n"+@title)
    pane.onDidActivate(() -> @element.focus())
    term.topNode.focus()
    @process = process = spawn("/home/bothner/Software/abduco/abduco", ["-c", @title, "/bin/bash"])
    #@process = process = spawn("/bin/bash", ["-i"])
    #@process = process = spawn("/usr/bin/tr", ["a-z", "A-Z"])
    #@process = process = spawn("/usr/bin/kawa", ["--console"])
    #@process = process = spawn("/tmp/loop", [])
    #@process = process = spawn("/usr/bin/ls", ["-l", "/home/bothner/Housing"])
    term.processInputCharacters = (str) -> (
       console.log("processInputCharacters");
       process.stdin.write(str)
    )
    process.stdout.on('data', (data) -> term.insertBytes(data))

  # Returns an object that can be retrieved when package is activated
  serialize: ->

  processInput: (process, str) ->
     process.stdin.write(str)

  # Tear down any state and detach
  destroy: ->
    @element.remove()

  getElement: ->
    @element

  getTitle: ->
    return @title
*/
