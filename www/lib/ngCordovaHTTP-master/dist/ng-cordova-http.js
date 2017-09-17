/*global angular*/

if (typeof angular !== "undefined") {
    angular.module('CordovaHTTP', []).factory('$cordovaHTTP', ['$timeout', '$q', function($timeout, $q) {
        var http = null;

        if (typeof cordova !== "undefined") {
            http = cordova.plugins.CordovaHttpPlugin || window.CordovaHttpPlugin;
        }

        function makePromise(fn, args, async) {
            var deferred = $q.defer();

            var success = function(response) {
                if (async) {
                    $timeout(function() {
                        deferred.resolve(response);
                    });
                } else {
                    deferred.resolve(response);
                }
            };

            var fail = function(response) {
                if (async) {
                    $timeout(function() {
                        deferred.reject(response);
                    });
                } else {
                    deferred.reject(response);
                }
            };

            args.push(success);
            args.push(fail);

            fn.apply(http, args);

            return deferred.promise;
        }

        var cordovaHTTP = {
            useBasicAuth: function(username, password) {
                return makePromise(http.useBasicAuth, [username, password]);
            },
            setHeader: function(header, value) {
                return makePromise(http.setHeader, [header, value]);
            },
            enableSSLPinning: function(enable) {
                return makePromise(http.enableSSLPinning, [enable]);
            },
            acceptAllCerts: function(allow) {
                return makePromise(http.acceptAllCerts, [allow]);
            },
            post: function(url, params, headers) {
                return makePromise(http.post, [url, params, headers], true);
            },
            get: function(url, params, headers) {
                return makePromise(http.get, [url, params, headers], true);
            },
            uploadFile: function(url, params, headers, filePath, name) {
                return makePromise(http.uploadFile, [url, params, headers, filePath, name], true);
            },
            downloadFile: function(url, params, headers, filePath) {
                return makePromise(http.downloadFile, [url, params, headers, filePath], true);
            }
        };
        return cordovaHTTP;
    }]);
}
