var domtermCounter = 0;
var domtermCommand = "domterm";
var spawn = require('child_process').spawn;
var usingWebview = false;

const {Menu, MenuItem} = require('electron').remote;

class DomTermView /*extends View*/ {
    close () {
        var pane = atom.workspace.paneForItem(this);
        this.destroy(); pane.close();
    }

    constructor (serializedState) {
        var view = this;
        // Create root element
        //this.element = document.createElement('div')
        var webview;
        console.log("DomTermView.constructor ss:"+!!serializedState);
        if (usingWebview) {
            // context menus work; drag/serialization doesn't
            webview = document.createElement('webview');
            webview.setAttribute("class", "domterm native-key-bindings");
            webview.setAttribute("nodeintegration", "true");
            webview.addEventListener('ipc-message', (event) => {
                view.handleMessageFromGuest(event.channel, ...event.args);
            });
            webview.addEventListener('console-message', (e) => {
                console.log('[DomTerm]', e.message)
            });
            webview.addEventListener('contextmenu', (e) => {
                e.preventDefault();
            });
        } else {
            // handles more key-bindings better
            webview = document.createElement('iframe');
            webview.setAttribute("width", "100%");
            webview.setAttribute("height", "100%");
            webview.setAttribute("class", "domterm");
        }
        webview.addEventListener('close',
                                 function(ev) { view.close(); },
                                 false);
        this.element = webview;
        this.webview = webview;
        function doSplitTerm(dir) {
            view.serialize();
            view.domterm.splitTerm(dir);
        };
        this.contextMenu = function() {
            var menu = new Menu();
            const autoPagingItem = new MenuItem({label: 'Automatic Pager',
                                                 type: 'checkbox',
                                                 click: function() {
                                                     view.postToContentWindow("toggle-auto-paging"); }});
            function newSplitItem(label, dir) {
                return new MenuItem({label: label,
                                     click: function() { doSplitTerm(dir); }
                                    });
            }
            menu.append(autoPagingItem);
            menu.append(newSplitItem('New Terminal Tab', 'tab'));
            menu.append(newSplitItem('New Terminal (Split Up)', 'up'));
            menu.append(newSplitItem('New Terminal (Split Down)', 'down'));
            menu.append(newSplitItem('New Terminal (Split Left)', 'left'));
            menu.append(newSplitItem('New Terminal (Split Right)', 'right'));
            return menu;
        }
        this.handleMessageFromGuest = function(command, ... args) {
            switch (command) {
            case "domterm-new-pane":
                var direction;
                var pane_op = args[0];
                var session_pid = args[1];
                switch (pane_op) {
                case 2: direction='tab'; break;
                case 10: direction='left'; break;
                case 11: direction='right'; break;
                case 12: direction='up'; break;
                case 13: direction='down'; break;
                default: direction='down'; break; // FIXME
                };
                var url = view.url.replace(/connect-pid=([0-9]*[&]*)/, "");
                if (session_pid)
                    url = url+"&connect-pid="+session_pid;
                view.domterm.splitTerm(direction, {command: 'new-pane', url: url});
                break;
            case "domterm-set-title":
                view.title = args[0];
                view.wname = args[1];
                break;
            case "domterm-context-menu":
                view.contextMenu().popup();
                break;
            case "domterm-close":
                //view.close();
                break;
            case "domterm-close-from-eof":
                view.close();
                break;
            case "domterm-focused":
                var pane = atom.workspace.paneForItem(view);
                //pane.activateItem(dmv);
                pane.element.focus();
                break;
            case "domterm-new-websocket":
                if (view.wsocket)
                    return;
                view.wsocket = new WebSocket(args[0], args[1]);
                view.wsocket.binaryType = "arraybuffer";
                view.wsocket.onmessage = function(evt) {
                    view.postToContentWindow({command: "handle-output",
                                              output: evt.data});
                }
                view.wsocket.onopen = function(e) { // FIXME
                    view.postToContentWindow({command: "socket-open"});
                };
                break;
            case "domterm-socket-close":
                view.wsocket.close();
                view.wsocket = null;
                break;
            case "domterm-socket-send":
                view.wsocket.send(args[0]);
                break;
            }
        }
        this.handleMessage = (function(dmv) {
            return function(event) {
                if (event.source!=view.webview.contentWindow)
                    return;
                var data = event.data;
                console.log("dt-v.handleMessage #"+dmv.counter+" "+(data.command?data.command:data));
                if (data.command && data.args)
                    dmv.handleMessageFromGuest(data.command, ... data.args);
            }})(this);
        //this.element.appendChild(webview)
        this.wname = null;
        if (serializedState) {
            var pid = serializedState.sessionPid;
            if (serializedState.command=='new-pane') {
                this.counter = ++domtermCounter;
                this.title = "domterm-"+this.counter;
                this.url = serializedState.url;
            } else {
                this.counter = serializedState.counter;
                this.title = serializedState.title;
                this.url = serializedState.url;
            }
            console.log("new DTV url:"+this.url+" sstate:"+serializedState);
            webview.src = this.url;
            webview.focus();
        } else {
            this.counter = ++domtermCounter;
            this.title = "domterm-"+this.counter;
            view.url = "";
            console.log("new DTV (no state argument)");
            var dproc = spawn(domtermCommand, ["--print-url"]);
            dproc.stdout.on('data', (data) => {
                var url = view.url + data
                view.url = view;
                var dlen = url.length;
                console.log("dproc got "+dlen+" characters");
                if (url.length > 0 && url.charAt(url.length-1) == '\n') {
                    url = url.substring(0, url.length-1);
                    url = url + (url.indexOf('#') >= 0 ? "&atom" : "#atom");
                    view.url = url;
                    webview.src = url;
                    console.log("DTV #"+view.counter+" set url :"+this.url);
                    webview.focus();
                }
            });
            dproc.on('close', (code)=> {
                console.log('child process exited with code '+code);
            });
        }
        window.addEventListener("message", this.handleMessage, false);
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

    handleMessage(event) {
        var data = event.data;
        if (data=="context-menu") {
            this.contextMenu().popup();
        }
    }
    postToContentWindow(message) {
        if (!usingWebview)
            this.webview.contentWindow.postMessage(message, "*");
    }
    serialize () {
        if (usingWebview) {
            console.log("serialize #"+this.counter);
            this.webview.executeJavaScript("DomTerm.saveWindowContents();");
        } else {
            console.log("serialize #"+this.counter+" w:"+this.webview.contentWindow);
            //Unclear why postToContentWindow isn't working. FIXME
            //this.postToContentWindow("serialize");
            this.webview.contentWindow.postMessage("serialize", "*");
        }
        // FIXME ask domterm object to detach
        return { deserializer: 'DomTermView',
                 "url": this.url,
                 "counter": this.counter,
                 "title": this.title };
    }

    destroy () {
        console.log("remove #"+this.counter+" "+this.title);
        window.removeEventListener("message", this.handleMessage, false);
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
