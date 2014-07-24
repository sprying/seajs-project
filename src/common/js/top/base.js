(function(){
    var Base = window.Base = {};

    var eventSplitter = /\s+/,
        slice = Array.prototype.slice;

    Base.Event = {
        on: function (events, callback, context) {
            var calls,
                event,
                node,
                tail,
                list;
            if (!callback) {
                return this;
            }
            events = events.split(eventSplitter);
            calls = this._callbacks || (this._callbacks = {});

            while (event = events.shift()) {
                list = calls[event];
                node = list ? list.tail : {};
                node.next = tail = {};
                node.context = context;
                node.callback = callback;
                calls[event] = {tail: tail, next: list ? list.next : node};
            }
            return this;
        },


        fire: function (events) {
            var event, node, calls, tail, args, all, rest, ret;
            if (!(calls = this._callbacks)) return this;
            all = calls.all;
            events = events.split(eventSplitter);
            rest = slice.call(arguments, 1);

            while (event = events.shift()) {
                if (node = calls[event]) {
                    tail = node.tail;
                    while ((node = node.next) !== tail && (ret = node.callback.apply(node.context || this, rest)) !== false) {
                    }
                }
                if (node = all) {
                    tail = node.tail;
                    args = [event].concat(rest);
                    while ((node = node.next) !== tail) {
                        node.callback.apply(node.context || this, args);
                    }
                }
            }

            return ret;
        },

        off:function(events){
            var event,node,calls,tail;
            if (!(calls = this._callbacks)) return this;
            events = events.split(eventSplitter);
            while (event = events.shift()) {
                if (node = calls[event]) {
                    tail = node.tail;
                    node.next = tail;
                }
            }
        },

        offAll:function(){
            this._callbacks = {};
        }

    };
})();