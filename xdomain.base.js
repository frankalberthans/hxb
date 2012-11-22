/**
 * Wan360 Cross-domain Version 2.1 2012-11-14
 * Copy Right Reserved By hanxuebin
 * Contact : hanxuebin@360.cn
 */
var wan360 = wan360 || {};
wan360.xdomain = wan360.xdomain || function() {
    if(!window.postMessage) {
        window.name = '';
    }
    var callbacks = [], handlers = [], timer = []; //监听事件处理函数池
    function listen(cb) {
        var key, prop, hash = '';
        function _removeHandler(key) {
            if(window.removeEventListener){
                window.removeEventListener("message",handlers[key],false);
            } else if(window.detachEvent) {
                window.detachEvent("onmessage",handlers[key]);
            }
            delete callbacks[key];
            delete handlers[key];
        }
        function _addHander(key) {
            //添加到监听事件处理函数池
            callbacks[key] = cb[key] || cb;
            handlers[key] = function(e) {
                //筛选处理函数
                var messages = e.data.split('||');
                //兼容旧版本message,不带||
                if(!messages[1]) {
                    callbacks[key](e.data);
                } else if(messages[0] == key) {
                    callbacks[key](messages[1]);
                }
            };
            //添加事件监听
            if(window.addEventListener) {
                window.addEventListener("message",handlers[key],false);
            } else if(window.attachEvent) {
                window.attachEvent("onmessage",handlers[key]);
            }
        }
        function _removeTimer(key) {
            clearInterval(timer[key]);
            window.name = '';
            delete timer[key];
            delete callbacks[key];
        }
        function _addTimer(key) {
            callbacks[key] = cb[key] || cb;
            timer[key] = setInterval(function(){
                if(window.name!=hash && window.name != ''){
                    hash = window.name;
                    var messages = hash.split('||');
                    //兼容旧版本message,不带||
                    if(!messages[1]) {
                        callbacks[key](hash);
                    } else if(messages[0] == key) {
                        callbacks[key](messages[1]);
                    }
                }
            },100);
        }
        if(window.postMessage) {
            //新版本监听，传入事件处理函数的格式: { key1: function(){}, key2: function(){} }
            if(typeof cb === 'object') {
                for(key in cb) {
                    for(prop in callbacks) {
                        //如果已存在传入的处理函数的key值，则移除已存在的处理函数
                        if(prop == key) {
                            _removeHandler(key);
                            break;
                        }
                    }
                    _addHander(key);
                }
            } else if(typeof cb === 'function') {
                key = 'xdomainDefaultKey';
                if(callbacks[key]) {
                    _removeHandler(key);
                }
                _addHander(key);
            }
        } else {
            if(typeof cb === 'object') {
                for(key in cb) {
                    for(prop in timer) {
                        //如果已存在监听计时器，移除之
                        if(prop == key) {
                            _removeTimer(key);
                            break;
                        }
                    }
                    //添加监听计时器
                    _addTimer(key);
                }
            } else if(typeof cb === 'function') {
                key = 'xdomainDefaultKey';
                if(timer[key]) {
                    _removeTimer(key, cb);
                }
                _addTimer(key);
            }
        }
    }
    function sendMessage(windowObject, data, name) {
        var message = '';
        if(name) {
            message = name + '||' + data;         
        } else {
            message = data;
        }
        if(window.postMessage){
            windowObject.postMessage(message,'*');
        } else {
            windowObject.name = message;          
        }
    }
    return {
        listen : listen,
        sendMessage : sendMessage
    };
}();
