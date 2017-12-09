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
