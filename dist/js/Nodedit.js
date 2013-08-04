/*!
 Nodedit is free software released without warranty under the MIT license by Kent Safranski
 Build version 0.7.3, 08-04-2013
*/
/**
 * Creates the application object and initial configuration
 * @namespace nodedit
 */
var nodedit = {

    templates: "templates/",
    
    el: "#nodedit",
    
    /**
     * Initializes application
     * @method nodedit.init
     */

    init: function () {
        // Check sessions
        if (nodedit.session()) {
            // Session exists, start workspace
            nodedit.workspace.init();
        } else {
            // No session, show connect view
            nodedit.connect.view();
        }
        
        // Block context menu
        nodedit.$el.on('contextmenu', function (e) {
            e.stopPropagation();
            e.preventDefault();
        });
        
        // Init plugins
        nodedit.plugins.init();
    }

};

// Starts app on page load
$(function(){ 

    // Cache the main container
    nodedit.$el = $(nodedit.el);
    
    // Determine environment (dist or src)
    nodedit.env = $("body").attr("data-env");
    
    // If dist env, load templates into DOM
    if (nodedit.env==="dist") {
        $.get("dist/templates/system.tpl", function (tpls) {
            $("body").append("<div id=\"nodedit-templates\">"+tpls+"</div>");
        }).done(function () {
            // call init after we have populated the templates inline.
            nodedit.init();
        });
    } else {
        nodedit.init();
    }

});

// Filter by data
$.fn.filterByData = function(prop, val) {
    return this.filter(
        function() { return $(this).data(prop)==val; } // Note, needs to be '==' not '==='
    );
};
/**
 * Instantiated to create keybindings
 * @method nodedit.keybind
 * @param {object} params Object containing code, timeout and callback
 */
nodedit.keybind = function(params){
    
    // Assign combo code
 
    this.code = params.code || null;
    
    // Timeout before cur_combo resets
 
    this.timeout = params.timeout || 2000;
    
    // Callback
 
    this.callback = params.callback || false;
    
    // Holds currently entered combo
 
    this.cur_combo = "";
    
    // Starts the key listener, timer and check
 
    this.init = function(){
        
        var _this = this;
        
        document.onkeydown = function(evt) {
            evt = evt || window.event;
            var name = _this.keycodes[evt.keyCode];
            if(_this.cur_combo.length>0){
                _this.cur_combo += " ";
            }
            _this.cur_combo += name;
            _this.runTimer();
            _this.checkCode(evt);
        };
        
    };
    
    // Controls duration of time available to complete code
    
    this.runTimer = function(){
        var _this = this;
        
        // Clear timeout
        if(this.combotimer){ 
            clearTimeout(this.combotimer);   
        }
        
        this.combotimer = setTimeout(function(){
            _this.cur_combo = "";
        }, this.timeout);
    };
    
    // Checks for code match and fires callback
    
    this.checkCode = function(e){
        if (this.cur_combo.indexOf(this.code)!== -1 && this.callback){
            e.preventDefault();
            this.cur_combo = "";
            this.callback();
        }
    };
    
    // Library of keycodes
    
    this.keycodes = {
        8: "backspace",
        9: "tab",
        13: "enter",
        14: "enter",
        16: "shift",
        17: "ctrl",
        18: "alt",
        19: "pause",
        20: "caps",
        27: "esc",
        32: "space",
        33: "pageup",
        34: "pagedown",
        35: "end",
        36: "home",
        37: "left",
        38: "up",
        39: "right",
        40: "down",
        44: "printscreen",
        45: "insert",
        46: "delete",
        48: "0",
        96: "0", //numpad
        49: "1",
        97: "1", //numpad
        50: "2",
        98: "2", //numpad
        51: "3",
        99: "3", //numpad
        52: "4",
        100: "4", //numpad
        53: "5",
        101: "5", //numpad
        54: "6",
        102: "6", //numpad
        55: "7",
        103: "7", //numpad
        56: "8",
        104: "8", //numpad
        57: "9",
        105: "9", //numpad
        65: "a",
        66: "b",
        67: "c",
        68: "d",
        69: "e",
        70: "f",
        71: "g",
        72: "h",
        73: "i",
        74: "j",
        75: "k",
        76: "l",
        77: "m",
        78: "n",
        79: "o",
        80: "p",
        81: "q",
        82: "r",
        83: "s",
        84: "t",
        85: "u",
        86: "v",
        87: "w",
        88: "x",
        89: "y",
        90: "z",
        112: "f1",
        113: "f2",
        114: "f3",
        115: "f4",
        116: "f5",
        117: "f6",
        118: "f7",
        119: "f8",
        120: "f9",
        121: "f10",
        122: "f11",
        123: "f12",
        144: "numlock",
        145: "scrolllock",
        186: "semicolon",
        187: "equals",
        189: "minus",
        188: "comma",
        190: "period",
        191: "forwardslash",
        219: "openbracket",
        220: "backslash",
        221: "closebracket",
        222: "quote"
    };
    
    // Start up on instantiation
    
    this.init();   
    
};/**
 * Hanldes notifications and messaging
 * @namespace nodedit.message
 */
nodedit.message = {
    
    /**
     * Visibly displays the message
     * @method nodedit.message.show
     * @param {string} msg The message
     * @param {string} type Error or success
     * 
     */
    show: function (msg, type) {
        
        var icon,
            block,
            blockHeight;
        
        // Remove any existing messages
        $("#message").remove();
        
        (type==="success") ? icon = "icon-thumbs-up" : icon = "icon-thumbs-down"; 
        
        // Create new instance
        $("body").append("<div id=\"message\" class=\""+type+"\"><span class=\""+icon+"\"></span>&nbsp;"+msg+"</div>");
        block = $("#message");
        blockHeight = block.outerHeight();
        
        // Slide up and fade in
        block
            // Set start
            .css({"bottom":"-"+blockHeight+"px", "opacity": "0"})
            .animate({"bottom":"0", "opacity": "1"}, 500)
            
            // Wait 3 seconds
            .delay(3000)
            
            // Slide down and fade out
            .animate({"bottom":"-"+blockHeight+"px", "opacity": "0"}, { "complete": function () {
                $(this).remove();
            }}, 500);
        
    },
    
    /**
     * Shows error message
     * @method nodedit.message.error
     * @param {string} msg Message to display
     */
    error: function (msg) {
        nodedit.message.show(msg, "error");
    },
    
    /**
     * Shows success message
     * @method nodedit.message.success
     * @param {string} msg Message to display
     */
    success: function (msg) {
        nodedit.message.show(msg, "success");
    }
};/**
 * Load the template
 * @method nodedit.template
 * @param {string} tpl The template file to be loaded
 * @param {object} [data] Data to be loaded via Handlebars
 * @param {requestCallback} [fn] If passing in data, callback will return compiled template
 */
nodedit.template = function (tpl, data, fn) {
    var template,
        defer,
        tmpl;
    
    // Check for pathing - indicates a plugin template
    if (tpl.indexOf("/") >= 0) {
        
        // This is a template, always load via XHR
        return $.ajax({
            url: tpl,
            type: "GET",
            success: function (tmpl){ 
                // Insert data
                if (data) {
                    template = Handlebars.compile(tmpl);
                    tmpl = template({"data": data});
                    fn(tmpl);
                }
            },
            error: function (){
                nodedit.message.error("Could not load template");
            }
        });
        
    } else {
        
        // This is a system template
    
        // In src environment, load each template via xhr
        if (nodedit.env === "src") {
        
            return $.ajax({
                url: nodedit.templates+tpl,
                type: "GET",
                success: function (tmpl){ 
                    // Insert data
                    if (data) {
                        template = Handlebars.compile(tmpl);
                        tmpl = template({"data": data});
                        fn(tmpl);
                    }
                },
                error: function (){
                    nodedit.message.error("Could not load template");
                }
            });
        
        // In dist environment, templates loaded as single file into DOM, pulled from DOM when needed
        } else {
    
            // Return a Deferred after the promise has been completed.
            defer = new $.Deferred();
            
            // Setup template
            tmpl = $("script[id=\"" + tpl + "\"]").html();
            template = Handlebars.compile(tmpl);
            tmpl = template({"data" : data });
            
            // Resolve the defer, pass in tmpl to call .done()
            defer.resolve(tmpl);
            
            // Check for callback if not using .done()
            if ( typeof fn === "function" ) {
                fn(tmpl);
            }
            
            // Return promise to callee
            return defer.promise();
        }
        
    }

};

// Handlebars helper for object key-value
Handlebars.registerHelper("eachkeys", function (context, options) {
    var fn = options.fn, inverse = options.inverse,
        ret = "",
        empty = true,
        key;
    
    for (key in context) { empty = false; break; }
    
    if (!empty) {
        for (key in context) {
            ret = ret + fn({ "key": key, "value": context[key]});
        }
    } else {
        ret = inverse(this);
    }
    return ret;
});

// Hanldebars helper for comparison operators
Handlebars.registerHelper("ifCond", function (v1, operator, v2, options) {
    switch (operator) {
    case "==":
        return (v1 == v2) ? options.fn(this) : options.inverse(this);
    case "===":
        return (v1 === v2) ? options.fn(this) : options.inverse(this);
    case "<":
        return (v1 < v2) ? options.fn(this) : options.inverse(this);
    case "<=":
        return (v1 <= v2) ? options.fn(this) : options.inverse(this);
    case ">":
        return (v1 > v2) ? options.fn(this) : options.inverse(this);
    case ">=":
        return (v1 >= v2) ? options.fn(this) : options.inverse(this);
    default:
        return options.inverse(this);
    }
});
/**
 * Handles all remote filesystem requests and responses
 * @namespace nodedit.fsapi
 */
nodedit.fsapi = {
    
    /**
     * Used by nodedit.connect to check if session is valid
     * @method nodedit.fsapi.check
     * @param {object} session The object containing remote url and key
     */
    check: function (session) {
        return $.get(session.url+"/"+session.key+"/dir/");    
    },
    
    /**
     * Makes request against remote server
     * @method nodedit.fsapi.request
     * @param {string} url The remote url with key
     * @param {string} type The type of request (GET, POST, PUT, DELETE)
     * @param {object} params Any data (POST/PUT) to be sent
     * @param {{requestCallback}} fn The callback after success or error
     */
    request: function (url, type, params, fn) {
        $.ajax({
            url: url,
            type: type,
            data: params,
            success: function (res) {
                if (res.status === "success") {
                    // Success response
                    if (!res.data) {
                        // No data, but successful
                        fn(true);
                    } else {
                        // Success with data
                        fn(res.data);
                    }
                } else {
                    // Fail response
                    fn(false);
                }
            },
            error: function () {
                fn(false);
            }
        });
    },
    
    /**
     * Opens and returns contents of file
     * @method nodedit.fsapi.open
     * @param {string} path The full path to the file
     * @param {requestCallback} fn The callback on success
     */
    open: function (path, fn) {
        var url = nodedit.session().url + "/" + nodedit.session().key + "/file" + path;
        nodedit.fsapi.request(url, "GET", null, fn);
    },
    
    /**
     * Returns the contens of a directory
     * @method nodedit.fsapi.list
     * @param {string} path The full path to the file
     * @param {requestCallback} fn The callback on success
     */
    list: function (path, fn) {
        var url = nodedit.session().url + "/" + nodedit.session().key + "/dir" + path;
        nodedit.fsapi.request(url, "GET", null, fn);
    },
    
    /**
     * Create (POST)
     */
    
    /**
     * Creates a file or directory
     * @method nodedit.fsapi.create
     * @param {string} path The full path to the file
     * @param {string} type Either "file" or "dir"
     * @param {requestCallback} fn The callback on success
     */
    create: function (path, type, fn) {
        var url = nodedit.session().url + "/" + nodedit.session().key + "/" + type + path;
        nodedit.fsapi.request(url, "POST", null, fn);
    },
    
    /**
     * Proxy for create
     * @method nodedit.fsapi.createFile
     * @param {string} path The full path to the file
     * @param {requestCallback} fn The callback on success
     */
    createFile: function (path, fn) {
        this.create(path, "file", fn);
    },
    
    /**
     * Proxy for create
     * @method nodedit.fsapi.createDirectory
     * @param {string} path The full path to the file
     * @param {requestCallback} fn The callback on success
     */
    createDirectory: function (path, fn) {
        this.create(path, "dir", fn);
    },
    
    /**
     * Copies a file or directory (and all contents)
     * @method nodedit.fsapi.copy
     * @param {string} path The full path to the file
     * @param {string} detsination The full path of the copy destination
     * @param {requestCallback} fn The callback on success
     */
    copy: function (path, destination, fn) {
        var url = nodedit.session().url + "/" + nodedit.session().key + "/copy" + path;
        nodedit.fsapi.request(url, "POST", { destination: destination }, fn);
    },
    
    /**
     * Similar to "Cut+Paste", copies the file, then deletes original
     * @method nodedit.fsapi.move
     * @param {string} path The full path to the file
     * @param {string} destination The full path of the move-to destination
     * @param {requestCallback} fn The callback on success
     */
    move: function (path, destination, fn) {
        var _this = this;
        this.copy(path, destination, function (data) {
            if (data.status === "success") {
                _this.delete(path, fn);   
            } else {
                fn(data);
            }
        });
    },
    
    /**
     * Saves contents to a file
     * @method nodedit.fsapi.save
     * @param {string} path The full path to the file
     * @param {sting} data The data to be placed in the file
     * @param {requestCallback} fn The callback on success
     */
    save: function (path, data, fn) {
        var url = nodedit.session().url + "/" + nodedit.session().key + "/save" + path;
        nodedit.fsapi.request(url, "PUT", { data: data }, fn);
    },
    
    /**
     * Renames a file or directory
     * @method nodedit.fsapi.rename
     * @param {string} path The full path to the file
     * @param {string} name The new name of the file or directory
     * @param {requestCallback} fn The callback on success
     */
    rename: function (path, name, fn) {
        var url = nodedit.session().url + "/" + nodedit.session().key + "/rename" + path;
        nodedit.fsapi.request(url, "PUT", { name: name }, fn);
    },
    
    /**
     * Deletes a file or directory
     * @method nodedit.fsapi.delete
     * @param {string} path The full path to the file
     * @param {requestCallback} fn The callback on success
     */
    delete: function (path, fn) {
        var url = nodedit.session().url + "/" + nodedit.session().key + path;
        nodedit.fsapi.request(url, "DELETE", { name: name }, fn);
    } 
    
};/**
 * Sets or gets session information
 * @method nodedit.session
 * @param {object|string} arg With format { url: "ENDPOINT", key: "API_KEY" } sets the session, "clear" removes it, no value returns current session (or bool false)
 */
nodedit.session = function () {
    
    // Set or get
    if (arguments.length) {
        if (typeof arguments[0] === "object") {
            // Session object passed in; store
            nodedit.store("nodedit_session", arguments[0]); 
        } else if (arguments[0] === "clear") {
            // Clear session
            nodedit.store("nodedit_session", null);
        }
    } else {
        // No object passed
        if (nodedit.store("nodedit_session")) {
            // Session set, return data
            var session = JSON.parse(nodedit.store("nodedit_session"));
            return {
                url: session.url,
                key: session.key
            };
        } else {
            // No session, return false
            return false;
        }
    }
    
};/**
 * Stores and retrieves data from localstorage
 * @method nodedit.store
 * @param {string} The key used to identify the storage obejct
 * @param {object|string} [value] The value to set, null to remove object, or not specified to get
 */
nodedit.store = function (key, value) {

    // If value is detected, set new or modify store
    if (typeof value !== "undefined" && value !== null) {
        // Stringify objects
        if(typeof value === "object") {
            value = JSON.stringify(value);
        }
        // Add to / modify storage
        localStorage.setItem(key, value);
    }

    // No value supplied, return value
    if (typeof value === "undefined") {
        return localStorage.getItem(key);
    }

    // Null specified, remove store
    if (value === null) {
        localStorage.removeItem(key);
    }

};/**
 * Handles loading of the connection view and processing of form submission
 * @namespace nodedit.connect
 */
nodedit.connect = {
    
    /**
     * Loads the connect template and handles form submission
     * @method nodedit.connect.view
     */
    view: function () {
        nodedit.template("connect.tpl")
            .done(function (tmpl) {
                // Load DOM
                nodedit.$el.html(tmpl);
                // Bind submission
                $("form#connect").on("submit", function (e) {
                    e.preventDefault();
                    nodedit.connect.process($(this).serializeArray());
                });
            });
    },
    
    /**
     * Handles procesing of form data
     * @method nodedit.connect.process
     * @param {object} formData Data passed from connect.view form submission
     */
    process: function (formData) {
        var i = 0, 
            z = formData.length,
            session = {};
        for (i=0; i<=z-1; i++) {
            session[formData[i].name] = $.trim(formData[i].value);
        }
        // Run connection check
        nodedit.fsapi.check(session)
            .done(function (data) {
                if (data.status === "success") {
                    //If return good, save to session
                    nodedit.session(session);
                    // Initialize the workspace
                    nodedit.workspace.init();
                } else {
                    nodedit.message.error("Could not connect to server");
                }
            })
            .fail(function () {
                nodedit.message.error("Could not connect to server");
            });
    },
    
    /**
     * Closes the connect by clearing the session
     * @method modedit.connect.close
     */
    close: function () {
        nodedit.session("clear");
        window.location.reload();
    }
};/**
 * Namespace for pub/sub
 * @namespace nodedit.observer
 */
nodedit.observer = {
    
    topics: {},
    
    topic_id: 0,
    
    /**
     * Publishes events to the observer
     * @method nodedit.observer.publish
     * @param {string} name An idenditfier for the observer
     * @param {string|object} data The data associated with the observer
     */
    publish: function (topic, data) {
        var _this = this;
        if (!_this.topics.hasOwnProperty(topic)) {
            return false;
        }
        setTimeout(function () {
            var subscribers = _this.topics[topic],
                len;

            if (subscribers.length) {
                len = subscribers.length;
            } else {
                return false;
            }

            while (len--) {
                subscribers[len].fn(data);
            }
        }, 0);
        return true;
    },
    
    /**
     * Listens for events triggered
     * @method nodedit.observer.subscribe
     * @param {string} name Identifier of the observer
     * @param {requestCallback} fn The function to fire when event triggered
     * @returns {number} A token assigned to the subscription
     */
    subscribe: function (topic, fn) {
        var _this = this,
            id = ++this.topic_id,
            max,
            i;
        
        // Create new topic
        if (!_this.topics[topic]) {
            _this.topics[topic] = [];
        }
        
        // Prevent re-subscribe issues (common on route-reload)
        for (i = 0, max = _this.topics[topic].length; i < max; i++) {
            if (_this.topics[topic][i].fn.toString() === fn.toString()) {
                return _this.topics[topic][i].id;
            }
        }
        
        _this.topics[topic].push({
            id: id,
            fn: fn
        });

        return id;
    },
    
    /**
     * Unsubscribes an observer
     * @method nodedit.observer.unsubscribe
     * @param {number} token Token of the subscription
     */
    unsubscribe: function (token) {
        var _this = this,
            topic,
            i,
            max;
        for (topic in _this.topics) {
            if (_this.topics.hasOwnProperty(topic)) {
                for (i = 0, max = _this.topics[topic].length; i < max; i++) {
                    if (_this.topics[topic][i].id === token) {
                        _this.topics[topic].splice(i, 1);
                        return token;
                    }
                }
            }
        }
        return false;
    },
    
};/**
 * Controls for modal window actions
 * @namespace nodedit.modal
 */
nodedit.modal = {
    
    el: "#modal",
    
    overlay: "#modal-overlay",

    /**
     * Opens an instance of the modal
     * @method nodedit.modal.open
     * @param {number} width The width of the modal
     * @param {string} title The title to display
     * @param {string} template The template to load
     * @param {string|object} [data] Any data to be loaded into the template
     * @param {requestCallback} [fn] Callback function
     */
    open: function (width, title, template, data, fn) {
        // Close any open modals
        this.close();
        
        data = data || {};
        fn = fn || null;
        
        // Declare variables
        var _this = this;
        
        // Build DOM container
        nodedit.$el.append("<div id=\""+_this.overlay.replace("#","")+"\"></div><div id=\""+_this.el.replace("#","")+"\"></div>");
        
        // Create DOM element
        nodedit.$el.find(_this.el).css({ "width": width+"px", "margin-left":"-"+Math.round(width/2)+"px" });
        
        // Load content template
        nodedit.template(template, data, function (content) {
            // Load modal template
            nodedit.template("modal.tpl", { title: title }, function (tmpl) {
                // Show content
                nodedit.$el.find(_this.el).html(tmpl).children("#modal-content")
                    .html(content)
                    .find("input:not([type=hidden]):first")
                    .focus();
                // Fire callback
                if (fn) {
                    fn();
                }
            });
        });
        
        // Bind close
        nodedit.$el.find(_this.el).on("click", "a.icon-remove, #btn-modal-close", function (e) {
            e.preventDefault();
            _this.close();
        });
    },
    
    /**
     * Closes the modal window
     * @method nodedit.modal.close
     */
    close: function () {
        var _this = this;
        // Remove DOM element
        nodedit.$el.find(_this.el+","+_this.overlay).remove();
    }

};/**
 * Hanldes settings get and set
 * @namespace nodedit.settings
 */
nodedit.settings = {
    
    /**
     * Checks for saved settings or sets defaults
     * @method nodedit.settings.init
     */
    init: function () {
        // Check for local storage
        if (!nodedit.store("nodedit_settings")) {
            // Set defaults
            nodedit.store("nodedit_settings", {
                theme: "twilight",
                fontsize: 14,
                printmargin: false,
                highlightline: true,
                indentguides: true,
                wrapping: false
            });
        }
    },
    
    /**
     * Returns the settings from localStorage
     * @method nodedit.settings.get
     */
    get: function () {
        return JSON.parse(nodedit.store("nodedit_settings"));
    },
    
    /**
     * Stores settings in localStorage
     * @method nodedit.settings.set
     * @param {object} settings The object with user settings
     */
    set: function (settings) {
        nodedit.store("nodedit_settings", settings);
        // Update editors
        nodedit.editor.setConfig();
    },
    
    /**
     * Opens the settings dialog and handles for response
     * @method nodedit.settings.edit
     */
    edit: function () {
        var _this = this,
            settings = _this.get();
        
        // Open settings dialog in modal
        nodedit.modal.open(500, "Settings", "settings.tpl", settings, function () {
            // Listen for changes - update settings real-time
            var isBool = function (v) {
                if (v==="true") {
                    return true;
                } else if (v==="false") {
                    return false;
                } else {
                    return v;
                }
            };
            nodedit.$el.find(nodedit.modal.el).on("change", "select", function () {
                settings[$(this).attr("name")] = isBool($(this).val());
                _this.set(settings);
            });
        });
    }
    
};/**
 * Used to manage the nodedit workspace (filemanager and editor) loading
 * @namespace nodedit.workspace
 */
nodedit.workspace = {
    
    /**
     * Starts up the workspace after a successful session is establshed
     * @method nodedit.workspace.init
     */
    init: function () {
        
        // Ensure the session
        if (nodedit.session()) {
            // Load the workspace
            nodedit.template("workspace.tpl")
                .done(function (tmpl) {
                    // Load DOM
                    nodedit.$el.html(tmpl);
                    // Initial Settings
                    nodedit.settings.init();
                    // Start filemanager
                    nodedit.filemanager.init();
                    // Start editor
                    nodedit.editor.init();
                });
        } else {
            // Failed session
            nodedit.message.error("Could not load session");
        }
        
    }
    
};/**
 * Controls for the editor tabs
 * @namespace nodedit.tabs
 */
nodedit.tabs = {
    
    el: "#tabs",
    
    overflow_timeout: null,
    
    /**
     * Opens a new tab
     * @method nodedit.tabs.open
     * @param {number} id The id of the editor/tab instance
     */
    open: function (id) {
        var _this = this,
            path = nodedit.editor.getPath(id),
            name = nodedit.filemanager.getFileName(path);

        // Compile template
        nodedit.template("tab.tpl", {id: id, path: path, name: name}, function(tmpl) {
            // Add tab
            nodedit.$el.find(_this.el).append(tmpl); 
            _this.setActive(id);
            _this.bindClose(id);
            _this.bindClick(id);
            _this.sortable();
            _this.overflow();
        });
    },
    
    /**
     * Initializes tab sortable functionality
     * @method nodedit.tabs.sortable
     */
    sortable: function () {
        var _this = this;
        nodedit.$el.find(_this.el).sortable({ 
            axis: "x", 
            items: "li",
            containment: "parent",
            placeholder: "tab-sort-placeholder",
            distance: 5
        });  
    },
    
    /**
     * Handles overflow of tabs expanding past horizontal space available
     * @method nodedit.tabs.overflow
     */
    overflow: function () {
        var _this = this,
            tab_els = nodedit.$el.find(_this.el).children("li"),
            w_available = nodedit.$el.find(_this.el).outerWidth(),
            tab_w, tab_count, cur_tab, new_tab, remainder;
        
        // Get tab width
        tab_w = tab_els.outerWidth();
        // Get tab count
        tab_count = tab_els.length;
        
        var bindNewTab = function (new_tab) {
            
            // Bind click on tab
            new_tab.on("click", function () {
                nodedit.editor.gotoInstance($(this).data("id"));
            });
            
            // Bind click on close
            new_tab.on("click","a", function () {
                nodedit.editor.close($(this).parent("li").data("id")); 
            });
            
        };
        
        // Out of space?
        if ((tab_w*tab_count) > w_available-30) {
            // Clear any existing contents
            nodedit.$el.find("#tabs-reveal-menu").remove();
            // Find remainder
            remainder = Math.ceil(((tab_w*tab_count)-(w_available-30))/tab_w);
            // Create reveal icon
            nodedit.$el.find(_this.el).append("<a id=\"tabs-reveal\" class=\"icon-double-angle-right\"></a>");
            // Create reveal menu
            nodedit.$el.append("<ul id=\"tabs-reveal-menu\"></ul>");
            
            // Loop in remainder tabs
            for (var i=tab_count-remainder, z=tab_count; i<z; i++){
                // Get current tab
                cur_tab = nodedit.$el.find(_this.el).children("li:eq("+i+")");
                
                // Add element to menu
                nodedit.$el.find("#tabs-reveal-menu").append("<li data-id=\""+cur_tab.data("id")+"\">"+cur_tab.html()+"</li>");
                
                // Get new tab
                new_tab = nodedit.$el.find("#tabs-reveal-menu").children("li[data-id=\""+cur_tab.data("id")+"\"]");
                
                bindNewTab(new_tab);
                
            }
            
            // Bind click to show menu
            nodedit.$el.find(_this.el).children("#tabs-reveal").on("click", function () { 
                nodedit.$el.find("#tabs-reveal-menu").show();    
            });
            
            // Hide menu on mouseleave
            nodedit.$el.find("#tabs-reveal-menu").on("mouseleave", function() {
                $(this).hide();
            });
            
            // Set active pointer
            _this.setActive(_this.getActive());
            
        } else {
            nodedit.$el.find(_this.el).children("#tabs-reveal").remove();
            nodedit.$el.find("#tabs-reveal-menu").remove();
        }
        
        // Bind to resize, use timeouts to prevent rapid-fire during resize
        $(window).resize(function () {
            window.clearTimeout(_this.overflow_timeout);
            _this.overflow_timeout = setTimeout(function () {
                _this.overflow();
            }, 250);
            
        });
        
    },
    
    /**
     * Closes a tab
     * @method nodedit.tabs.close
     * @param {number} id The id of the editor/tab instance
     */
    close: function (id) {
        var _this = this,
            tab = nodedit.$el.find(_this.el).children("li").filterByData("id", id),
            index = tab.index(),
            maxIndex = (nodedit.$el.find(_this.el).children("li").size())-1,
            openIndexOf;
            
        tab.remove();
        // Find and switch to neighboring tab (if this is the active tab)
        if (tab.hasClass("active")) {
            if (index>0) {
                // Prefer move to left, check that this isn"t first tab
                openIndexOf = index-1;
            } else if (index<maxIndex) {
                // If not the last item, open the item to right (will match the closed item"s index)
                openIndexOf = index;
            }
            
            if (openIndexOf!==undefined) {
                var newId = nodedit.$el.find(_this.el).children("li:eq("+openIndexOf+")").attr("data-id");
                nodedit.editor.gotoInstance(newId);
            }
        }
        
        //Rebind sortable and overflow handlers
        _this.sortable();
        _this.overflow();
    },
    
    /**
     * Handles rename of any open files and path changes
     * @method nodedit.tabs.rename
     * @param {string} oldPath The existing path
     * @param {string} newPath The new path
     * @param {number} id The id of the instance
     */
    rename: function (oldPath, newPath, id) {
        var _this = this,
            tab = nodedit.$el.find(_this.el).children("li").filterByData("id", id),
            curPath = tab.attr("title");
        
        // Change title attr
        tab.attr("title", tab.attr("title").replace(oldPath, newPath));
        
        if (curPath===oldPath) {
            // Full path match, change label
            tab.children("label").text(nodedit.filemanager.getFileName(newPath));
        }
        
    },
    
    /**
     * Sets active tab
     * @method nodedit.tabs.setActive
     * @param {number} id The id of the editor/tab instance
     */
    setActive: function (id) {
        var _this = this;
        nodedit.$el.find(_this.el).children("li").removeClass("active");
        nodedit.$el.find("#tabs-reveal-menu").children("li").removeClass("active");
        nodedit.$el.find(_this.el).children("li").filterByData("id", id).addClass("active");
        nodedit.$el.find("#tabs-reveal-menu").children("li").filterByData("id", id).addClass("active");
    },
    
    /**
     * Return the active tab or false
     * @method nodedit.tabs.getActive
     */
    getActive: function () {
        var _this = this;
        if (nodedit.$el.find(_this.el).children("li.active").length!==0) {
            return nodedit.$el.find(_this.el).children("li.active").data("id");
        } else {
            return false;
        }
    },
    
    /**
     * Binds click to close button
     * @method nodedit.tabs.bindClose
     * @param {number} id The id of the editor/tab instance
     */
    bindClose: function (id) {
        var _this = this;
        nodedit.$el.find(_this.el).find("li").filterByData("id", id).on("click", "a", function (e) {
            e.stopPropagation(); // Stop propagation to tab (li) item
            nodedit.editor.close(id);
        });
    },
    
    /**
     * Binds click to the tab
     * @method nodedit.tabs.bindClick
     * @param {number} id The id of the editor/tab instance
     */
    bindClick: function (id) {
        var _this = this;
        nodedit.$el.find(_this.el).find("li").filterByData("id", id).on("click", function () {
            nodedit.editor.gotoInstance(id);
        });
    },
    
    /**
     * Marks the tab to show editor has unsaved changes
     * @method nodedit.tabs.markChanged
     * @param {number} id The id of the editor/tab instance
     */
    markChanged: function (id) {
        var _this = this,
            label = nodedit.$el.find(_this.el).children("li").filterByData("id", id).children("label");
        
        // Compare to initial state
        if (nodedit.editor.getContent(id)!==nodedit.editor.instances[id].content) {
            label.addClass("changed");
        } else {
            _this.markUnchanged(id);
        }
    },
    
    /**
     * Marks the tab to show editor has NO unsaved changes
     * @method nodedit.tabs.markUnchanged
     * @param {number} id The id of the editor/tab instance
     */
    markUnchanged: function (id) {
        var _this = this;
        nodedit.$el.find(_this.el).children("li").filterByData("id", id).children("label").removeClass("changed");
    },
    
    /**
     * Checks if tab reports unsaved changes
     * @method nodedit.tabs.checkChanged
     * @param {number} [id] Either specifies id of editor/tab or checks all (if not specified)
     */
    checkChanged: function (id) {
        var _this = this,
            i;
        if (id) {
            // Check for specific editor with unsaved changes
            if (nodedit.$el.find(_this.el).children("li").filterByData("id", id).children("label").hasClass("changed")) {
                return true;
            }
        } else {
            for (i in nodedit.editor.instances) {
                if (nodedit.$el.find(_this.el).children("li").filterByData("id", id).children("label").hasClass("changed")) {
                    return true;
                }
            }
        }
        
        // No returns, return false
        return false;
        
    }
    
};/**
 * Bookmark controller
 * @namespace nodedit.bookmarks
 */
nodedit.bookmarks = {
    
    // Nodedit bookmarks file (saves to root)
    nebfile: "/.nebmarks",
    
    /**
     * Retreives list of bookmarks from node
     * @method nodedit.bookmarks.getList
     * @param {requestCallback} fn Processed after sucessful return
     */
    getList: function (fn) {
        var _this = this;
        // Open the bookmarks file stored in the root
        nodedit.fsapi.open(_this.nebfile, function (res) {
            if (res.length < 3 || !res) {
                // Return false, not long enough to constitute true bookmark return
                fn(false);
            } else {
                // Parse and return results in callback
                fn(JSON.parse(res));
            }
        });
    },
    
    /**
     * Loads and displays the bookmark select list
     * @method nodedit.bookmarks.showList
     * @param {object} e The event triggering the list display
     */
    showList: function (e) {
        // Create element
        nodedit.$el.append("<div id=\"bookmark-menu\"><ul></ul><hr><a id=\"edit-bookmarks\"><span class=\"icon-edit\"></span> Edit Bookmarks</a></div>");
        
        var _this = this,
            output,
            menu = nodedit.$el.find("#bookmark-menu"),
            trigger = nodedit.$el.find(e.target),
            trigger_pos = trigger.position();
        
        // Get list
        _this.getList(function (list) {
            if (!list) {
                nodedit.message.error("No bookmarks. Right-click directory to bookmark.");
                menu.remove();
            } else {
                menu.css({
                    // Set top and left relative to trigger
                    top: (trigger_pos.top + trigger.outerHeight() + 5)+"px", 
                    left: trigger_pos.left-10+"px" 
                })
                .on("mouseleave click", function () {
                    // Remove on mouseleave
                    menu.remove();
                });
                
                // Set root first
                output = "<li><a data-name=\""+nodedit.filemanager.root_name+"\" data-path=\"/\"><span class=\"icon-cloud\"></span> "+nodedit.filemanager.root_name+"</a></li>";
                
                // Build list
                for (var item in list) {
                    output += "<li><a data-name=\""+item+"\" data-path=\""+list[item]+"\"><span class=\"icon-star\"></span> "+item+"</a></li>";
                }
                
                // Set in menu and show
                menu.show().children("ul").html(output);
                
                // Bind click on items
                menu.find("a").click(function () {
                    if ($(this).data("path")==="/") {
                        // Clear bookmark if root
                        _this.clearCurrent();
                    } else if ($(this).attr("id")==="edit-bookmarks"){
                        _this.openDialog();
                    }else {
                        // Set current bookmark
                        _this.setCurrent($(this).data("name"), $(this).data("path"));
                    }
                });
                
            }   
        });
    },
    
    /**
     * Opens the bookmark manager dialog
     * @method nodedit.bookmarks.openDialog
     * @param {object} [add] Object containing name and path of a new bookmark
     */
    openDialog: function (add) {
        var _this = this;
        
        // Get list of current bookmarks
        _this.getList(function (list) {
            var tmpl_data = {},
                item,
                i = 0, z,
                save_data_raw = [],
                save_data_formatted = {},
                cur_node;
            
            // If adding, create new node for template
            if (add) {
                tmpl_data[i] = { name: add.name, path: add.path, create: true };
                i++;
            }
            
            // Modify list object for template
            for (item in list) {
                tmpl_data[i] = { name: item, path: list[item], create: false };
                i++;
            }
            
            // Open modal and load template
            nodedit.modal.open(500, "Bookmarks", "bookmarks.tpl", tmpl_data, function () {
                
                // Bind to delete icons
                nodedit.$el.find(nodedit.modal.el).on("click", ".icon-trash", function () {
                    $(this).parent("td").parent("tr").remove();
                });
                
                var fixHelper = function(e, tr) {
                    var $originals = tr.children();
                    var $helper = tr.clone();
                    $helper.children().each(function (index) {
                        $(this).width($originals.eq(index).width());
                    });
                    return $helper;
                };
                
                nodedit.$el.find(nodedit.modal.el).find("table tbody").sortable({ 
                    items: "tr",
                    handle: ".icon-resize-vertical",
                    start: function(e, ui){
                        ui.placeholder.height(ui.item.height());
                        ui.item.css("border","none");
                    },
                    helper: fixHelper
                }).disableSelection(); 
                
                // Handle form submission
                nodedit.$el.find(nodedit.modal.el).on("submit", "form", function (e) {
                    e.preventDefault();
                    // Serialize form data to array
                    save_data_raw = $(this).serializeArray();
                    // Format data to object
                    for (i=0, z=save_data_raw.length; i<z; i++) {
                        if(save_data_raw[i].name==="name"){
                            // Sets the key
                            cur_node = save_data_raw[i].value;
                        } else {
                            // Set the value based on key and associated array value
                            save_data_formatted[cur_node] = save_data_raw[i].value;
                        }
                    }
                    // Save data to file
                    _this.saveList(save_data_formatted);
                });
                
            });
        });
        
    },

    /**
     * Checks if bookmark already exists before sending through to openDialog
     * @method nodedit.bookmarks.addBookmark
     * @param {object} [add] Object containing name and path of a new bookmark
     */
    addBookmark: function (add) {
        var _this = this;
        _this.getList(function (list) {
            var item;
            for (item in list) {
                if (list[item]===add.path) {
                    // Bookmark already exists
                    nodedit.message.error("Already bookmarked as "+item);
                    return false;
                }
            }
            
            // Can"t bookmark root
            if (add.path==="/") {
                nodedit.message.error("You don&apos;t need to bookmark root");
                return false;
            }
            
            // No errors, open dialog
            _this.openDialog(add);  
        });
    },
    
    /**
     * Saves JSON-formatted list back to root of node
     * @method nodedit.bookmarks.saveList
     * @param {object} bookmarks The object retrutned from the serialized array of the form
     */
    saveList: function (bookmarks) {
        var _this = this;
        // Ensure file exists
        nodedit.fsapi.createFile(_this.nebfile, function () {
            // Put contents in file
            nodedit.fsapi.save(_this.nebfile, JSON.stringify(bookmarks, null, 4), function () {
                nodedit.message.success("Bookmarks successfully saved");    
            });
        });
    },
    
    /**
     * Sets the current bookmark in localStorage
     * @method nodedit.bookmarks.setCurrent
     * @param {string} name The name of the bookmark
     * @param {string} path The path (from root)
     */
    setCurrent: function (name, path) {
        nodedit.store("nodedit_bookmark", { name: name, path: path });
        // Reinitialize filemanager
        nodedit.filemanager.init();
    },
    
    /**
     * Clears out the current bookmark
     * @method nodedit.bookmarks.clearCurrent
     */
    clearCurrent: function () {
        nodedit.store("nodedit_bookmark", null);
        // Reinitialize filemanager
        nodedit.filemanager.init();
    },
    
    /**
     * Returns object containing current bookmark name and path
     * @method nodedit.bookmarks.getCurrent
     */
    getCurrent: function () {
        return JSON.parse(nodedit.store("nodedit_bookmark"));
    }
    
};/**
 * Handles all filemanager related actions
 * @namespace nodedit.filemanager
 */
nodedit.filemanager = {
    
    el: "#filemanager",
    
    clipboard: null,
    
    root_name: "Node Root",

    /**
     * Starts the filemanager
     * @method nodedit.filemanager.init
     */
    init: function () {
        var _this = this,
            root = "/",
            root_name = _this.root_name,
            isBookmark = false;
            
        // Clear out filemanager
        nodedit.$el.find(_this.el).html("");
            
        // Check for bookmark
        if (nodedit.bookmarks.getCurrent()) {
            root = nodedit.bookmarks.getCurrent().path;
            root_name = nodedit.bookmarks.getCurrent().name;
            isBookmark = true;
        }
        
        // Check and destroy resize binding
        if (_this.hasOwnProperty("bound")) {
            nodedit.$el.find(_this.el).resizable( "destroy" );
        }
        
        // Load up filemanager
        nodedit.template("filemanager.tpl", {root: root, root_name: root_name, bookmark: isBookmark}, function (tmpl) {
            // Load DOM
            nodedit.$el.find(_this.el).html(tmpl);
            // Open root 
            _this.openDirectory(root); 
            // Bind actions
            _this.bindActions();
        });
    },
    
    /**
     * Binds dom elements to actions
     * @method nodedit.filemanager.bindActions
     */
    bindActions: function () {
        var _this = this;
        
        // Resize
        nodedit.$el.find(_this.el).resizable({  
            handles: { "e": "#resize-handle", "w": "#resize-handle" },
            minWidth: 65,
            resize: function(event, ui){
                // Resize editors
                nodedit.editor.resize(ui.size.width+"px");
            }
        });
        
        // Prevent re-binds
        if (!_this.hasOwnProperty("bound")) {
            
            // Bind directory click
            nodedit.$el.find(_this.el).on("click", "a.directory", function () {
                var path = $(this).parent("li").data("path");
                if($(this).parent("li").hasClass("open")) {
                    _this.closeDirectory(path);
                } else {
                    _this.openDirectory(path);
                }
            });
            
            // Bind file click
            nodedit.$el.find(_this.el).on("click", "a.file", function () {
                nodedit.filemanager.openFile($(this).parent("li").data("path"));
            });
            
            // Add data transfer to jQ props
            $.event.props.push("dataTransfer");
            // Bind Upload Handlers
            nodedit.$el.find(_this.el).on("dragover", "a.directory", function (e) {
                e.stopPropagation();
                e.preventDefault();
                e.dataTransfer.dropEffect = "copy";
                $(".dragover").removeClass("dragover");
                $(this).addClass("dragover");
                // Remove class
                nodedit.$el.on("mouseover dragover", function () {
                    $(".dragover").removeClass("dragover");
                });
            });
            
            // Bind drop of files
            nodedit.$el.find(_this.el).on("drop", "a.directory", function (e) {
                e.stopPropagation();
                e.preventDefault();
                _this.uploadDropFiles(e, $(this).parent("li").data("path"));
            });
            
            // Bind context menu
            nodedit.$el.find(_this.el).on("contextmenu", "a", function (e) {
                if($(this).parent().attr("class") !== "top-bar") {
                    _this.contextMenu($(this).attr("class"), $(this).parent("li").data("path"), e);
                }
            });
            
            // Bind Exit Button
            nodedit.$el.find(_this.el).on("click", "#disconnect", function () {
                nodedit.connect.close();
            });
            
            // Bind Bookmarks Button
            nodedit.$el.find(_this.el).on("click", "#bookmarks", function (e) {
                nodedit.bookmarks.showList(e);
            });
            
            // Bind Plugins Button
            nodedit.$el.find(_this.el).on("click", "#plugins", function (e) {
                nodedit.plugins.showList(e);
            });
            
            // Bind Settings Button
            nodedit.$el.find(_this.el).on("click", "#settings", function () {
                nodedit.settings.edit();
            });
            
            // Bind Rescan Buton
            // Bind Settings Button
            nodedit.$el.find(_this.el).on("click", "#rescan", function () {
                _this.rescan();
            });
            
            // Set re-bind prevention property
            _this.bound = true;
            
        }
    },
    
    /**
     * Shows the appropriate context menu
     * @method nodedit.filemanager.contextMenu
     * @param {string} type Directory or file
     * @param {string} path The path of the element
     * @param {object} e The event object
     */
    contextMenu: function (type, path, e) {
        
        // Remove existing context menus
        nodedit.$el.find(this.el).find(".context-menu").remove();
        
        // Prevent default context menu
        e.preventDefault();
        
        var _this = this,
            object = nodedit.$el.find(_this.el).find("li").filterByData("path", path).children("a"),
            tplDir;
            
        (type==="directory") ? tplDir = "dir" : tplDir = null;
        
        nodedit.template("filemanager_context_menu.tpl", { dir: tplDir, clipboard: _this.clipboard }, function (tmpl) {
            nodedit.$el.find(_this.el).append(tmpl);
            nodedit.$el.find(_this.el).children(".context-menu").css({
                top: e.pageY-20,
                left: e.pageX-20
            });
            
            // Highlight object
            object.addClass("menu-open");
            
            // Bind item click
            $(".context-menu").on("click", "a", function () {
                switch ($(this).attr("id")) {     
                case "new_file":
                    _this.createObject(path, "file");
                    break;
                case "new_directory":
                    _this.createObject(path, "directory");
                    break;
                case "bookmark":
                    nodedit.bookmarks.addBookmark({ name: _this.getFileName(path), path: path });
                    break;
                case "rename":
                    _this.renameObject(path);
                    break;
                case "copy":
                    _this.copyObject(path);
                    break;
                case "paste":
                    _this.pasteObject(path);
                    break;
                case "delete":
                    _this.deleteObject(path);
                    break;
                }   
            });
            
            // Hide on click
            $("body").on("click", function () {
                nodedit.$el.find(_this.el).children(".context-menu").remove();
                // Remove highlighting from node
                object.removeClass("menu-open");
            });
            
            // Hide on mouseleave
            $(".context-menu").on("mouseleave", function () {
                $(this).remove();
                // Remove highlighting from node
                object.removeClass("menu-open");
            });
        });
    },
    
    /**
     * Handles uploading of files dropped
     * @method nodedit.filemanager.uploadDropFiles
     * @param {object} e The event object
     * @param {string} path The drop path
     */
    uploadDropFiles: function (e, path) {        
        var _this = this;
        
        $.each(e.dataTransfer.files, function () {
            var file = this, reader = new FileReader(), content, object;
            reader.onload = function () {
                content = this.result;
                (path!=="/") ? object = path+"/"+file.name : object = path+file.name;
                
                nodedit.fsapi.createFile(object, function (res) {
                    if (res) {
                        nodedit.fsapi.save(object, content, function (res) {
                            if (res) {
                                // Success, save object
                                _this.appendObject(path, object, "file");
                                nodedit.message.success("Successfully uploaded "+file.name);
                            } else {
                                nodedit.message.error("Could not save contents of "+file.name);
                            }
                        });
                    } else {
                        // Error
                        nodedit.message.error("Could not create "+file.name);
                    }
                });
            };
            
            // Always read binary to send to server
            reader.readAsBinaryString(file);
            
        });

    },
    
    /**
     * Rescans current directory tree to check for remote syncronization
     * @method nodedit.filemanager.rescan
     */
    rescan: function () {
        var _this = this,
            objects = [],
            i = 0,
            spinner = nodedit.$el.find(_this.el).children("#fm-container").children("#rescan");
            
        // Spinner
        spinner.addClass('icon-spin');
        
        // Populate array
        nodedit.$el.find(_this.el).children("#fm-container").find("li").filterByData("type","directory").each(function () {
            if ($(this).hasClass("open")) {
                objects.push($(this).attr("data-path"));
            }
        });
        
        // Runs the rescan by firing openDirectory, waiting for response publisher, then moving to next iteration
        var runRescan = function(i, objects, spinner, _this) {
            _this.openDirectory(objects[i]);
            // Wait for emitter
            var listen = nodedit.observer.subscribe('filemanager_opendir', function (data) {
                // Ensure correct publish instance
                if (data === objects[i]) {
                    // Unsubscribe the observer
                    nodedit.observer.unsubscribe(listen);
                    if (i<(objects.length)-1) {
                        // Iterate and rescan next node
                        i++;
                        runRescan(i, objects, spinner, _this);
                    } else {
                        // Stop spinner
                        spinner.removeClass('icon-spin');
                    }
                }
            });
        };
        
        // Start rescan
        runRescan(i, objects, spinner, _this);
        
    },
    
    /**
     * Opens a directory and displays contents
     * @method nodedit.filemanager.openDirectory
     * @param {string} path The path to load contents of
     */
    openDirectory: function (path) {
        var _this = this;
        nodedit.fsapi.list(path, function (data) {
            if (data) {
                // Add icon property to object
                for (var item in data) {
                    if (data[item].type==="directory") {
                        data[item].icon = "icon-folder-close";
                    } else {
                        data[item].icon = "icon-file";
                    }
                }
                // Load and compile template
                nodedit.template("filemanager_dir.tpl", data, function (tmpl) {
                    var object;
                    object = nodedit.$el.find(_this.el+" li").filterByData("path", path);
                    // Remove any existing content (rescan)
                    object.children("ul").remove();
                    // Open and append content
                    object.addClass("open").append(tmpl);
                    // Change icon (except root)
                    if (object.attr("id")!=="root") {
                        object.children("a").children("span").attr("class","icon-folder-open");
                    }
                    // Fire emitter (short timeout allows DOM to catch-up on large traversals)
                    setTimeout(function() {
                        nodedit.observer.publish('filemanager_opendir', path);
                    }, 15);
                    
                });
            } else {
                nodedit.message.error("Could not load directory");
            }
        });
    },
    
    /**
     * Closes a directory
     * @method nodedit.filemanager.closeDirectory
     * @param {string} path The path to close contents of
     */
    closeDirectory: function (path) {
        var _this = this;
        var object = nodedit.$el.find(_this.el+" li").filterByData("path", path);
        
        // Don"t close root
        if (object.attr("id")==="root") {
            return false;
        }
        
        // Close and remove content
        object.removeClass("open").children("ul").remove();
        // Change icon
        object.children("a").children("span").attr("class","icon-folder-close");
    },
    
    /**
     * Opens a file and instantiates new nodeditor.editor
     * @method nodedit.filemanager.openFile
     * @param {string} path The path of the file
     */
    openFile: function (path) {
        nodedit.fsapi.open(path, function (contents) {
            if (contents) {
                // Returns "true" on blank file, fix that s#@t
                (contents.toString()==="true") ? contents = "" : contents = contents;
                nodedit.editor.open(path, contents);
            } else {
                nodedit.message.error("Could not open file");
            }
        });
    },
    
    /**
     * Saves a file contents
     * @method nodedit.filemanager.saveFile
     * @param {string} path The path of the file
     * @param {string} contents The contents to be saved
     * @param {requestCallback} [fn] Callback with status returned
     */
    saveFile: function (path, content, fn) {
        nodedit.fsapi.save(path, content, function (status) {
            // Check status
            if (status) {
                // Show success
                nodedit.message.success("File has been successfully saved");
            } else {
                // Show error
                nodedit.message.error("The file could not be saved");
            }
            
            // Fire callback if preset
            if (fn) {
                fn(status);
            }
            
        });
    },
    
    /**
     * Returns (only) the name of the file
     * @method nodedit.filemanager.getName
     * @param {string} path The path of the file
     */
    getFileName: function (path) {
        var arrPath = path.split("/");
        return arrPath[arrPath.length-1];
    },
    
    /**
     * Returns the file extension
     * @method nodedit.filemanager.getFileExtension
     * @param {string} path The path of the file
     */
    getFileExtension: function (path) {
        var arrName = this.getFileName(path).split(".");
        return arrName[arrName.length-1];
    },
    
    /**
     * Opens dialog and processes new file/directory creation
     * @method nodedit.filemanager.createObject
     * @param {string} path The path of the directory
     * @param {string} type Type of create, file or directory
     */
    createObject: function (path, type) {
        var _this = this,
            newObj,
            newName,
            createType;
        // Open dialog
        nodedit.modal.open(350, "Create "+type, "filemanager_create.tpl", {type: type}, function () {
            // Listen for submit
            nodedit.$el.find(nodedit.modal.el).on("submit", "form", function (e) {
                e.preventDefault();
                newName = $(this).children("[name=\"name\"]").val();
                if (newName==="") {
                    nodedit.message.error("Please enter a "+type+" name");
                } else {
                    newObj = (path + "/" + newName).replace("//","/");
                    // Create object
                    (type==="directory") ? createType = "dir" : createType = type;
                    nodedit.fsapi.create(newObj, createType, function (res) {
                        if (res) {
                            // Success, create object
                            _this.appendObject(path, newObj, type);
                            // Close modal
                            nodedit.modal.close();
                        } else {
                            // Error
                            nodedit.message.error("Could not create "+type);
                        }
                    });
                }
            });
        });
    },
    
    /**
     * Appends a DOM object to the filemanager parent object
     * @method nodedit.filemanager.appendObject
     * @param {string} parent The object to append to
     * @param {string} object The object to append
     * @param {string} type The type of object, file/directory
     */
    appendObject: function (parent, object, type) {
        var _this = this,
            parentObj = nodedit.$el.find(_this.el).find("li").filterByData("path", parent),
            name = _this.getFileName(object),
            icon;
            
        // Prevent duplicates
        if (parentObj.find("li").filterByData("path", object).length!==0) {
            return false;
        }
        
        // Ensure folder is open
        if (parentObj.hasClass("open")) {
            (type==="directory") ? icon = "icon-folder-close" : icon = "icon-file";
            parentObj.children("ul")
                .append("<li data-path=\""+object+"\"><a class=\""+type+"\"><span class=\""+icon+"\"></span>"+name+"</a></li>");
        }
    },
    
    /**
     * Opens dialog and processes file/directory rename
     * @method nodedit.filemanager.renameObject
     * @param {string} path The path of the object
     */
    renameObject: function (path) {
        var _this = this,
            origName = _this.getFileName(path),
            object = nodedit.$el.find(_this.el).find("li").filterByData("path", path),
            type,
            newName,
            newObject,
            newPath;
            
        // Don"t rename root
        if (object.attr("id")==="root") {
            nodedit.modal.close();
            nodedit.message.error("Cannot rename the node root");
            return false;
        }
        
        // Get type
        (object.children("a").attr("class").indexOf("directory") !== -1) ? type = "directory" : type = "file";
        
        // Open dialog
        nodedit.modal.open(350, "Rename", "filemanager_rename.tpl", {path: path, name: origName }, function () {
            // Listen for submit
            nodedit.$el.find(nodedit.modal.el).on("submit", "form", function (e) {
                e.preventDefault();
                newName = $(this).children("[name=\"name\"]").val();
                // Ensure new name is supplied
                if (newName==="" || newName===origName) {
                    nodedit.message.error("Please enter a new "+type+" name");
                } else {
                    // Process rename
                    nodedit.fsapi.rename(path, newName, function (res) {
                        if (res) {
                            // Change object
                            newPath = path.replace(origName, newName);
                            object.data("path",newPath);
                            newObject = object.children("a").html().replace(origName, newName);
                            object.children("a").html(newObject);
                            // Change any children paths
                            if (type==="directory") {
                                // Change any sub-paths
                                $.each(nodedit.$el.find(_this.el).find("li"), function () {
                                    if ($(this).data("path").indexOf(path)===0 && $(this).data("path")!==newPath) {
                                        $(this).data("path", $(this).data("path").replace(path, newPath));   
                                    } 
                                });
                            }
                            // Change any open editor instances
                            nodedit.editor.rename(path, newPath);
                            // Close modal
                            nodedit.modal.close();
                        } else {
                            nodedit.message.error("Could not rename "+type);
                        }    
                    });
                }
            });
        });
    },
    
    /**
     * Adds file/directory to the clipboard
     * @method nodedit.filemanager.copyObject
     * @param {string} path The path of the object
     */
    copyObject: function (path) {
        var _this = this;
        _this.clipboard = path;
        nodedit.message.success("Copied to clipboard");
    },
    
    /**
     * Pastes object to path from path stored in clipboard
     * @method nodedit.filemanager.pasteObject
     * @param {string} path The path of the object
     */
    pasteObject: function (path) {
        var _this = this,
            name = _this.getFileName(_this.clipboard),
            type = nodedit.$el.find(_this.el).find("li").filterByData("path", _this.clipboard).children("a").attr("class");
            
        // Check for duplicate condition
        if(nodedit.$el.find(_this.el).find("li").filterByData("path", path+"/"+name).length>0) {
            name = "copy_of_"+name;
        }
        
        // Create copy
        nodedit.fsapi.copy(_this.clipboard, path+"/"+name, function (res) {
            if (res) {
                // Append to filemanager
                _this.appendObject(path, path+"/"+name, type);
            } else {
                // Copy procedure failed
                nodedit.message.error("Could not create a copy");
            }
        });
    },
    
    /**
     * Opens dialog and processes file/directory delete
     * @method nodedit.filemanager.deleteObject
     * @param {string} path The path of the object
     */
    deleteObject: function (path) {
        var _this = this;
        
        // Block deleting root
        if (path==="/") {
            nodedit.modal.close();
            nodedit.message.error("Cannot delete the node root");
            return false;
        }
        
        // Open dialog
        nodedit.modal.open(350, "Delete?", "filemanager_delete.tpl", {path: path}, function () {
            // Listen for submit
            nodedit.$el.find(nodedit.modal.el).on("submit", "form", function (e) {
                e.preventDefault();
                // Delete object
                nodedit.fsapi.delete(path, function (res) {
                    if (res) {
                        // Remove object
                        nodedit.$el.find(_this.el).find("li").filterByData("path", path).remove();
                        // Close modal
                        nodedit.modal.close();
                    } else {
                        // Failed to delete
                        nodedit.message.error("Could not delete object");
                    }
                });
            });
        });
    }

};
/**
 * Handles all functions for the editor
 * @namespace nodedit.editor
 */
nodedit.editor = {
    
    el: "#editor",
    
    instance_el: "#instances",
    
    instances: {},
    instance_modes: {},

    /*
    Here you can define the available editor extensions, the format is a valid json array, each key of the array is the extensions used and the value of that element is the editor type that should be interpreted.
    */

    available_extensions: {
        "coffee": "coffee",
        "css": "css",
        "html": "html",
        "htm": "html",
        "tpl": "html",
        "twig": "html",
        "js": "javascript",
        "json": "json",
        "jsp": "jsp",
        "less": "less",
        "md": "markdown",
        "php": "php",
        "php5": "php",
        "py": "python",
        "rb": "ruby",
        "sass": "sass",
        "scss": "scss",
        "sh": "sh",
        "sql": "sql",
        "txt": "text",
        "text": "text",
        "xml": "xml",
        "svg": "xml"  
    }, 

    /**
     * Starts the editor
     * @method nodedit.editor.init
     */
    init: function () {
        var _this = this,
            savebind,
            observer = nodedit.observer;
        
        // Load editor template
        nodedit.template("editor.tpl")
            .done(function (tmpl) {
                // Load DOM
                nodedit.$el.find(_this.el).html(tmpl);
                // Adjust height for top-bar
                var calcHeight = nodedit.$el.outerHeight() - nodedit.$el.find(".top-bar").outerHeight(true);
                nodedit.$el.find(_this.el).css({"height":calcHeight+"px"});
            });
        
        // Bind save key
        savebind = new nodedit.keybind({
            code: "ctrl s",
            callback: function () {
                nodedit.editor.saveActive();
            }
        });
        
        // Subscribe to changes to editors
        observer.subscribe("editor_change", function (id) {
            nodedit.tabs.markChanged(id);
        });
        
        // Subscribe to cursor change
        observer.subscribe("editor_cursor", function (pos_data) {
            var position = nodedit.$el.find(_this.el).children('#position');
            clearTimeout(_this.postimer);
            position.css({ 'opacity': 0.7 });
            position.children('.ln').html('Line '+pos_data.line);
            position.children('.ch').html('Char '+pos_data.char);
            _this.postimer = setTimeout(function () {
                position.css({ 'opacity': 0.3 });
            }, 1000);
            
        });
        
    },
    
    /**
     * Starts a new editor instance and loads any contents
     * @method nodedit.editor.open
     * @param {string} path The path of the file
     * @param {string} contents The contents of the file
     */
    open: function (path, content) {
        
        var _this = this,
            ext = nodedit.filemanager.getFileExtension(path),
            mode = _this.getMode(ext),
            i,
            id,
            exists = false;
        
        // Check for path in instances
        for (i in _this.instances) {
            if (_this.instances[i].path===path) {
                exists = true;
                id = i;
            }
        }
        
        // Check for invalid mode/extension
        if (!mode) {
            // Mode not supported
            nodedit.message.error("Can not open file type "+ext);
            return false;
        }
        
        // Check that file instance not already present
        if (!exists) {
            
            // Create new ID
            id = +new Date();
            
            // Add to instances
            _this.instances[id] = {
                path: path,
                content: content
            };
            
            // New Editor Instance
            nodedit.$el.find(_this.instance_el).append("<li class=\"editor\" id=\"editor"+id+"\" data-id=\""+id+"\"></li>");
            
            // Instantiates Ace editor
            _this.instances[id].editor = ace.edit("editor"+id);
            
            // Set editor mode
            _this.setMode(mode, id);
            
            // Set editor config from settings
            _this.setConfig(id);

            // Bind to emitter
            _this.emitter(id);
            
            // Bind context menu
            _this.bindContextMenu(id);
            
            // Set contents
            _this.setContent(content, id);
            
            // New tab
            nodedit.tabs.open(id);
            
            // Focus
            _this.instances[id].editor.focus();
            
        }
        
        // Show/Goto Instance
        _this.gotoInstance(id);
    },
    
    /**
     * Sets the configuration of the editor
     * @method nodedit.editor.setConfig
     * @param {object} config Object containing config properties
     * @param {number} [id] The id of the editor instance (or will change all)
     */
    setConfig: function (id) {
        var _this = this,
            config = nodedit.settings.get(),
            i,
            setConf = function(_this, config, id) {
                _this.setTheme(config.theme, id);
                _this.setFontSize(parseInt(config.fontsize,10), id);
                _this.setPrintMargin(config.printmargin, id);
                _this.setHighlightLine(config.highlightline, id);
                _this.setIndentGuides(config.indentguides, id);
                _this.setWrapping(config.wrapping, id);
            };
        
        // Check for ID
        if (id) {
            // Single instance
            setConf(_this,config,id);
        } else {
            // All active instances
            for (i in _this.instances) {
                setConf(_this, config, i);
            }
        }
    },
    
    /**
     * Binds the context menu
     * @method nodedit.editor.bindContextMenu
     * @param {number} id The id of the editor
     */
    bindContextMenu: function (id) {
        var _this = this,
            mode;
        _this.instances[id].editor.textInput.onContextMenu = function (e) {
            e.preventDefault();
            
            // Get current mode
            mode = _this.instances[id].mode;
            
            nodedit.template("editor_context_menu.tpl", { id: id, curmode: mode }, function (tmpl) {
                nodedit.$el.find(_this.el).append(tmpl);
                nodedit.$el.find(_this.el).children(".context-menu").css({
                    top: e.pageY-20,
                    left: e.pageX-20
                });
                
                // Bind item click
                $(".context-menu").on("click", "a", function () {
                    switch ($(this).attr("id")) {     
                    case "save":
                        _this.saveActive();
                        break;
                    case "close":
                        _this.close(id);
                        break;
                    case "mode":
                        _this.changeMode(id, mode);
                        break;
                    case "settings":
                        nodedit.settings.edit();
                        break;
                    }
                });
                
                // Hide on mouseleave
                $(".context-menu").on("mouseleave", function (e) {
                    e.stopPropagation();
                    $(this).remove();
                });
            });
        };
    },
    
    /**
     * Opens mode selector dialog and processes change
     * @method nodedit.editor.changeMode
     * @param {number} id The id of the editor instance
     * @param {string} curmode The current selected mode
     */
    changeMode: function (id, curmode) {
        
        var _this = this,
            mode, modes = {}, sel;
        
        // Build available modes array
        for (mode in _this.available_extensions) {
            if ($.inArray(_this.available_extensions[mode], modes) === -1) {
                sel = false;
                if (_this.available_extensions[mode]===curmode) {
                    sel = true;
                }
                modes[_this.available_extensions[mode]] = sel;
            }
        }
        
        // Open dialog
        nodedit.modal.open(350, "Editor Mode", "editor_change_mode.tpl", { modes: modes, curmode: curmode }, function () {
            // Process mode change
            nodedit.$el.find(nodedit.modal.el).find("form").on("submit", function (e) {
                e.preventDefault();
                _this.setMode($(this).children("select[name=\"mode\"]").children("option:selected").val(), id);
                nodedit.modal.close();
            });
        });
        
    },
    
    /**
     * Resizes the editor when the sidebar is resized
     * @method nodedit.editor.resize
     * @param {number} w The width of the sidebar (translates to margin-left of #editor)
     */
    resize: function(w){
        var _this = this,
            i;
        nodedit.$el.find(_this.el).css({ 
            "margin-left": w
        });
        for (i in _this.instances) {
            _this.instances[i].editor.resize();
        }
    },
    
    /**
     * Closes an instance of the editor and associated tab
     * @method nodedit.editor.close
     * @param {number} id The id of the editor instance
     */
    close: function (id) {
        var _this = this;
        
        // Closes the editor and tab
        var closeIt = function (_this, id) {
            // Close tab
            nodedit.tabs.close(id);
            // Remove editor instance from DOM
            nodedit.$el.find(_this.instance_el).children("li").filterByData("id", id).remove();    
            // Remove instance
            delete _this.instances[id];
        };
        
        // Check for unsaved changes
        if (nodedit.tabs.checkChanged(id)) {            
            // Open dialog
            nodedit.modal.open(500, "Close Without Saving?", "editor_confirm_close.tpl", {}, function () {
                // Show diff
                $(nodedit.modal.el).find("#diffreg").html(_this.getDiff(id));
                // Listen for submit
                nodedit.$el.find(nodedit.modal.el).on("submit", "form", function (e) {
                    e.preventDefault();
                    // Close
                    closeIt(_this, id);
                    // Close modal
                    nodedit.modal.close();
                });
            });
        } else {
            closeIt(_this, id);
        }
    },
    
    /**
     * Returns diff table between starting point and current changes
     * @method nodedit.editor.getDiff
     * @param {number} id The id of the editor instance
     */
    getDiff: function (id) {
        // Get diff
        var _this = this,
            base = difflib.stringAsLines(_this.instances[id].content),
            newtxt = difflib.stringAsLines(_this.getContent(id)),
            sm = new difflib.SequenceMatcher(base, newtxt),
            opcodes = sm.get_opcodes(),
            diffoutput = diffview.buildView({
                baseTextLines: base,
                newTextLines: newtxt,
                opcodes: opcodes,
                // set the display titles for each resource
                baseTextName: "Base Text",
                newTextName: "New Text",
                contextSize: null,
                viewType: 1
            });
        return diffoutput;
    },
    
    /**
     * Handles rename of any open files and path changes
     * @method nodedit.editor.rename
     * @param {string} oldPath The existing path
     * @param {string} newPath The new path
     */
    rename: function (oldPath, newPath) {
        var _this = this, i;
        for (i in _this.instances) {
            if (_this.instances[i].path.indexOf(oldPath)===0) {
                // Found, change path
                _this.instances[i].path = _this.instances[i].path.replace(oldPath, newPath);
                // Change tab
                nodedit.tabs.rename(oldPath, newPath, i);
            }
        }  
    },
    
    /**
     * Saves the active instance
     * @method nodedit.editor.saveActive
     */
    saveActive: function () {
        
        var _this = this,
            id = nodedit.tabs.getActive(),
            content;
        
        // Check for active tab
        if (!id) {
            // No active tabs, show error
            nodedit.message.error("No active files to save");
        } else {
            // Get content
            content = _this.getContent(id);
            // Save file
            nodedit.filemanager.saveFile(_this.instances[id].path, content, function (status) {
                if (status) {
                    // Set tab indicator back to none
                    nodedit.tabs.markUnchanged(id);
                    // Set instance content to new save
                    _this.instances[id].content = content;
                }
            });
        }
        
    },
    
    /**
     * Goes to a specific instance (tab)
     * @method nodedit.editor.gotoInstance
     * @param {number} id The id of the editor instance
     */
    gotoInstance: function (id) {
        var _this = this;
        
        // Set active tab
        nodedit.tabs.setActive(id);
        
        // Show editor
        nodedit.$el.find(_this.instance_el).children("li").hide();
        nodedit.$el.find(_this.instance_el).children("li").filterByData("id", id).show();
    },
    
    /**
     * Returns the path associated with the editor instance
     * @method nodedit.editor.getPath
     * @param {number} id The id of the editor instance
     */
    getPath: function(id){
        var _this = this,
            cur_id;
        for (cur_id in _this.instances) {
            if (parseInt(cur_id,10) === parseInt(id,10)) {
                return _this.instances[id].path; 
            }
        }
        // Makes it through without return, send false
        return false;
    },
    
    /**
     * Sets the content of the editor instance
     * @method nodedit.editor.setContent
     * @param {sting} c The content to set
     * @param {int} id The id of the editor instance
     */
    setContent: function (c,id) {
        var _this = this;
        _this.instances[id].editor.getSession().setValue(c);
    },
    
    /**
     * Returns the contents from the editor instance either by specified id or active
     * @method nodedit.editor.getContent
     * @param {int} [id] The id of the editor instance
     */
    getContent: function(id){
        var _this = this;
            
        // Eiter pull contents of specified editor or get active instance
        id = id || nodedit.tabs.getActive();
            
        // Return data
        if (!id) {
            // No active editor
            return false;
        } else {
            return _this.instances[id].editor.getSession().getValue();    
        } 
    },
    
    
    /**
     * Returns the correct mode based on extension
     * @method nodedit.editor.getMode
     * @param {string} ext The extension of the file
     */
    getMode: function (ext) {
        // Check for hidden (.xxxxxx) files
        (ext.length>4) ? ext = "text" : ext = ext;
        // Is the extensions available?
        if (this.available_extensions[ext]) {
            return this.available_extensions[ext];
        } else {
            return false;
        }
    },
    
    /**
     * Sets the mode of the editor instance
     * @method nodedit.editor.setMode
     * @param {sting} m The mode to set
     * @param {number} id The id of the editor instance
     */
    setMode: function (m,id) {
        var _this = this;
        // Set editor
        _this.instances[id].editor.getSession().setMode("ace/mode/"+m);
        // Store current mode
        _this.instances[id].mode = m;
    },
    
    /**
     * Sets the theme of the editor instance
     * @method nodedit.editor.setTheme
     * @param {sting} t The theme to set
     * @param {number} id The id of the editor instance
     */
    setTheme: function (t,id) {
        var _this = this;
        _this.instances[id].editor.setTheme("ace/theme/"+t);
    },
    
    /**
     * Sets the font size for the editor
     * @method nodedit.editor.setFontSize
     * @param {number} s The size of the font
     * @param {number} id The id of the editor instance
     */
    setFontSize: function (s,id) {
        var _this = this;
        _this.instances[id].editor.setFontSize(s);
    },
    
    /**
     * Sets whether or not the active line will be highlighted
     * @method nodedit.editor.setHighlightLine
     * @param {bool} h Whether or not to highlight active line
     * @param {number} id The id of the editor instance
     */
    setHighlightLine: function (h,id) {
        var _this = this;
        _this.instances[id].editor.setHighlightActiveLine(h);
    },
    
    /**
     * Sets whether or not the print margin will be shown
     * @method nodedit.editor.setPrintMargin
     * @param {bool} p The mode to set
     * @param {number} id The id of the editor instance
     */
    setPrintMargin: function (p,id) {
        var _this = this;
        _this.instances[id].editor.setShowPrintMargin(p);
    },
    
    /**
     * Sets whether or not indent guides will be shown
     * @method nodedit.editor.setIndentGuides
     * @param {bool} g Whether or not to show indent guides
     * @param {number} id The id of the editor instance
     */
    setIndentGuides: function (g,id) {
        var _this = this;
        _this.instances[id].editor.setDisplayIndentGuides(g);
    },
    
    /**
     * Sets whether or not to wrap lines
     * @method nodedit.editor.setWrapping
     * @param {bool} w Whether or not to wrap lines
     * @param {number} id The id of the editor instance
     */
    setWrapping: function(w, id){
        var _this = this;
        _this.instances[id].editor.getSession().setUseWrapMode(w);
    },
    
    /**
     * Binds events to emit through nodedit.observer
     * @method nodedit.editor.emitter
     * @param {number} id The id of the editor instance
     * @fires nodedit.observer.publish#editor_change
     * @fires nodedit.observer.publish#editor_blur
     * @fires nodedit.observer.publish#editor_focus
     * @fires nodedit.observer.publish#editor_cursor
     */
    emitter: function (id) {
        var _this = this,
            observer = nodedit.observer;
        
        /**
         * Editor content change event
         * @event nodedit.observer.publish#editor_change 
         * @type {object}
         * @property {number} id The ID of the editor instance
         */
        _this.instances[id].editor.on("change", function () {
            observer.publish("editor_change", id);
        });
        
        /**
         * Editor blur event
         * @event nodedit.observer.publish#editor_blur 
         * @type {object}
         * @property {number} id The ID of the editor instance
         */
        _this.instances[id].editor.on("blur", function () {
            observer.publish("editor_blur", id);
        });
        
        /**
         * Editor focus event
         * @event nodedit.observer.publish#editor_focus 
         * @type {object}
         * @property {number} id The ID of the editor instance
         */
        _this.instances[id].editor.on("focus", function () {
            observer.publish("editor_focus", id);
        });
        
        /**
         * Editor cursor change event
         * @event nodedit.observer.publish#editor_cursor 
         * @type {object}
         * @property {number} id The ID of the editor instance
         * @property {number} line The current line number
         * @property {number} char The current character position
         * @property {number} top The top coordinate relative to the document
         * @property {number} left The left coordinate relative to the document
         */
        _this.instances[id].editor.selection.on("changeCursor", function () {
            var line, char, cursor_el, cursor_offset, cursor_top, cursor_left;
            // Get line and char
            line = _this.instances[id].editor.getCursorPosition().row + 1;
            char = _this.instances[id].editor.getCursorPosition().column + 1;
            // Get cursor top and left
            cursor_el = nodedit.$el.find(_this.instance_el).children("li").filterByData("id", id).find(".ace_cursor");
            // Force brief delay for DOM catch-up
            setTimeout(function () {
                cursor_offset = cursor_el.offset();
                cursor_top = cursor_offset.top;
                cursor_left = cursor_offset.left;
                nodedit.observer.publish("editor_cursor", { id: id, line: line, char: char, top: cursor_top, left: cursor_left });
            }, 4);
        });
    }
    
};
/**
 * Creates namespace for individual plugins, no additional native methods or properties
 * @namespace nodedit.plugin
 */
nodedit.plugin = {};

/**
 * Handles activation and integration of plugins
 * @namespace nodedit.plugins
 */
nodedit.plugins = {
    
    plugin_menu: {},
    
    /**
     * Checks plugins/plugins.json and loads up plugins
     * @method nodedit.plugins.init
     */
    init: function () {
        var _this = this;
        
        // Set plugin_dir based on environment
        if(nodedit.env==="dist") {
            nodedit.plugins.plugin_dir = "plugins/";
        } else {
            nodedit.plugins.plugin_dir = "../plugins/";
        }
        
        // Get plugins
        $.getJSON(nodedit.plugins.plugin_dir+"plugins.json", function (list) {
            var plugin;
            for (plugin in list) {
                // Send to register method
                _this.register(plugin, list[plugin]);
            }
        });
    },
    
    /**
     * Registers a plugin by loading plugin.js file
     * @method nodedit.plugins.register
     * @param {string} name The name of the plugin
     * @param {string} directory The directory name inside of /plugins
     */
    register: function (name, directory) {
        var _this = this;
        
        $.get(_this.plugin_dir+directory+"/plugin.js", function (plugin) {
            var tpl;
            // This is an appropriate use-case for eval(). I don"t want to see an issue in GitHub about
            // eval === evil unless you have imperical proof and code showing a more efficient way to 
            // accomplish this...
            plugin = eval(plugin);
            
            // Add to menu list
            if (plugin.hasOwnProperty("onMenu")) {
                _this.plugin_menu[name] = {
                    icon: plugin.icon,
                    object: directory
                };
            }
            
            // Properly path templates
            if (plugin.hasOwnProperty("templates")) {
                for (tpl in plugin.templates) {
                    plugin.templates[tpl] = nodedit.plugins.plugin_dir + directory + "/" + plugin.templates[tpl];
                }
            }
            
            // Check for and load dependencies
            if (plugin.hasOwnProperty("dependencies") && plugin.dependencies.length>0) {
                // Load dep"s
                _this.loadDependencies(plugin.dependencies, nodedit.plugins.plugin_dir+directory+"/", function () {
                    // Fire init (if available)
                    if (plugin.hasOwnProperty("init")) {
                        plugin.init();
                    }
                });
            } else {
                // No dep"s, fire init (if available)
                if (plugin.hasOwnProperty("init")) {
                    plugin.init();
                }
            }
        });
    },
    
    /**
     * Load plugin dependencies
     * @method nodedit.plugins.loadDependencies
     * @param {array} scripts The paths to the dependencies
     * @param {requestCallback} fn The callback to fire on completion
     */
    loadDependencies: function(scripts, base_path, fn) {
        var loadCount = 0,
            totalRequired = scripts.length;
        
        // Record loaded and callback once all scripts loaded
        var loaded = function () {
            loadCount++;
            if (loadCount === totalRequired && typeof fn === "function") {
                fn.call();
            }
        };
        
        // Writes out dependency
        var writeScript = function (src) {
            var ext = src.split(".").pop(),
                s;
                
            if (ext === "js") {
                // Create script ref
                s = document.createElement("script");
                s.type = "text/javascript";
                s.async = true;
                s.src = base_path+src;
                s.addEventListener("load", function (e) { loaded(e); }, false);
                var body = document.getElementsByTagName("body")[0];
                body.appendChild(s);
            } else if (ext === "css") {
                // Create css link
                s = document.createElement("link");    
                s.type = "text/css";
                s.rel = "stylesheet";
                s.href = base_path+src;
                s.async = true;
                s.addEventListener("load", function (e) { loaded(e); }, false);
                var head = document.getElementsByTagName("head")[0];
                head.appendChild(s);
            } else {
                // Not supported, call loaded
                loaded({});
            }
        };
        
        // Loop through dep"s
        for (var i = 0; i < scripts.length; i++) {
            writeScript(scripts[i]);
        }
    },
    
    /**
     * Loads and displays the plugins select list
     * @method nodedit.plugins.showList
     * @param {object} e The event triggering the list display
     */
    showList: function (e) {
        // Create element
        nodedit.$el.append("<div id=\"plugin-menu\"><ul></ul></div>");
        
        var _this = this,
            output = "",
            menu = nodedit.$el.find("#plugin-menu"),
            trigger = nodedit.$el.find(e.target),
            trigger_pos = trigger.position();
            
        if ($.isEmptyObject(_this.plugin_menu)) {
            nodedit.message.error("No plugins have been installed");
            menu.remove();
        } else {
            menu.css({
                // Set top and left relative to trigger
                top: (trigger_pos.top + trigger.outerHeight() + 5)+"px", 
                left: trigger_pos.left-10+"px" 
            })
            .on("mouseleave click", function () {
                // Remove on mouseleave
                menu.remove();
            });
            
            // Loop through and create DOM elements
            for (var plugin in _this.plugin_menu) {
                // Output
                output += "<li><a id=\"plugin-"+_this.plugin_menu[plugin].object+"\"><span class=\""+_this.plugin_menu[plugin].icon+"\"></span> "+plugin+"</a></li>";
            }
            
            // Set in menu and show
            menu.show().children("ul").html(output);
            
            // Plugin bind
            var bindPluginOnMenu = function (plugin) {
                $("#plugin-"+plugin).bind("click", function () {
                    if (nodedit.plugin[plugin].hasOwnProperty('onMenu')) {
                        nodedit.plugin[plugin].onMenu();
                    }
                });
            };
            
            // Bind onMenu calls
            for (plugin in nodedit.plugin) {
                bindPluginOnMenu(plugin);
            }
            
        }
    }
    
};