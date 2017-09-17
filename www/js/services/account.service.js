angular.module('account.service', [])
    .factory('Account', ["$http", "$q", "$ionicPlatform", "$cordovaCamera", "$cordovaToast", "$cordovaDatePicker", "$cordovaContacts", "base",
        function($http, $q, $ionicPlatform, $cordovaCamera, $cordovaToast, $cordovaDatePicker, $cordovaContacts, base) {
            var account = {
                /**
                 * [signined description]
                 * @type {[type]}
                 */
                signined: (localStorage.getItem("account") ? true : false),
                /**
                 * [singIn description]
                 * @param  {[type]} data [description]
                 * @return {[type]}      [description]
                 */
                singIn: function(data) {
                    var deferred = $q.defer();
                    base.request("user/mapi/login", 1, data)
                        .then(function(rep) {
                            deferred.resolve(rep);
                        }, function(rep) {
                            deferred.reject(rep);
                        });
                    return deferred.promise;
                },
                /**
                 * 存储用户数据
                 * @param  {[type]} arg [description]
                 * @return {[type]}     [description]
                 */
                storeUser: function(arg) {
                    this.signined = true;
                    localStorage.setItem("account", JSON.stringify(arg));
                },


                reload: function() {
                    var deferred = $q.defer(),
                        self = this;
                    base.request("user/mapi/reload", 1, {uuid: self.getUser().uuid })
                        .then(function(resp) {
                            if (resp.state == "ok") {
                                self.storeUser(resp.data);
                            }
                            deferred.resolve(resp.data);
                        }, function(resp) {
                            deferred.reject(resp);
                        })
                    return deferred.promise;
                },
                /**
                 * 注册 检查用户数据是否通过验证
                 * @param  {[type]} arg [description]
                 * @return {[type]}     [description]
                 */
                checkusr: function(arg) {
                    var deferred = $q.defer();
                    //$http.jsonp(s.getUrl("mblr_checkreg"), s.handleParams(arg))
                    base.request("mblr_checkreg", arg)
                        .then(function(resp) {
                            deferred.resolve(resp);
                        }, function(resp) {
                            deferred.reject(resp);
                        });
                    return deferred.promise;
                },
                /**
                 * [getUser description]
                 * @return {[type]} [description]
                 */
                getUser: function() {
                    return JSON.parse(localStorage.getItem("account"));
                },
                /**
                 * 扫码 获取推荐人
                 * @param  {[type]} usersid [description]
                 * @return {[type]}        [description]
                 */
                gainUserById: function(usersid) {
                    var defer = $q.defer(),
                        _this = this,
                        sender = { 'usersid': usersid };
                    //$http.jsonp(s.getUrl('mbus_gainUserById'), s.handleParams(sender))
                    base.request('mbus_gainUserById', sender)
                        .then(function(resp) {
                            if (resp) {
                                if (resp.state == 'no') {
                                    base.prompt('获取推荐人失败');
                                } else {
                                    defer.resolve(resp.data);
                                }
                            } else {
                                base.prompt('获取推荐人失败');
                            }
                        }, function(resp) {
                            base.prompt('error');
                            defer.reject(resp);
                        });
                    return defer.promise;
                },

                /**
                 * [signOut description]
                 * @return {[type]} [description]
                 */
                signOut: function() {
                    this.signined = false;
                    localStorage.removeItem("account");
                },
                /**
                 * [getUserDetail description]
                 * @return {[type]} [description]
                 */
                getUserDetail: function() {
                    var _this = this,
                        defer = $q.defer();
                    var params = {
                            usersid: _this.getUser().usersid
                        }
                        //$http.jsonp(s.getUrl("mbus_getUserDetails"), s.handleParams(params))
                    base.request("mbus_getUserDetails", params)
                        .then(function(resp) {
                            defer.resolve(resp);
                        }, function(resp) {
                            defer.reject(resp)
                        });
                    return defer.promise;
                },
                /**
                 * 更新用户
                 * @param  {[type]} arg [description]
                 * @return {[type]}     [description]
                 */
                updateUser: function(arg, usersId) {
                    var _user = {},
                        defer = $q.defer();
                    base.request("usupduser", {'user.usersEmail': arg.email, 'user.usersId': usersId})
                        .then(function(resp) {
                            console.log(resp);
                            defer.resolve(resp);
                        }, function(resp) {
                            defer.reject(resp);
                        })
                    return defer.promise;
                },
                /**
                 * 会员升级，请求支付信息
                 * @param  {[type]} params [description]
                 * @return {[type]}        [description]
                 */
                upgrade: function(params) {
                    var defer = $q.defer();
                    params.usersid = this.getUser().usersid;
                    //$http.jsonp(s.getUrl("mbus_mobile_AccUpgrade"), s.handleParams(params))
                    base.request("mbus_mobile_AccUpgrade", params)
                        .then(function(resp) {
                            if (resp) {
                                defer.resolve(resp);
                            }
                        }, function(resp) {
                            defer.reject(resp);
                        });
                    return defer.promise;
                },
                /**
                 * [获取余额]
                 * @return {[type]} [description]
                 */
                getBalance: function() {
                    var deferred = $q.defer();
                    var sender = {
                            usersid: this.getUser().usersid
                        }
                        //$http.jsonp(s.getUrl("mbus_balance"), s.handleParams(sender))
                    base.request("mbus_balance", sender)
                        .then(function(resp) {
                            deferred.resolve(resp);
                        }, function(resp) {
                            deferred.reject(resp);
                        })
                    return deferred.promise;
                },

                /**
                 * 获取银行列表
                 * @return {[type]} [description]
                 */
                getBanks: function() {
                    var deferred = $q.defer();
                    //$http.jsonp(s.getUrl("mbul_gainbank"), s.handleParams())
                    base.request("mbul_gainbank")
                        .then(function(resp) {
                            deferred.resolve(resp);
                        }, function(resp) {
                            deferred.reject(resp);
                        })
                    return deferred.promise;
                },

                /**
                 * 发送验证码
                 * @param  {[type]} arg    [description]
                 * @param  {[type]} effect [description]
                 * @return {[type]}        [description]
                 */
                sendCode: function(arg) {
                    var deferred = $q.defer();
                    base.request("sms/mapi/sendcode", 0, {'phone': arg})
                        .then(function(resp) {
                            deferred.resolve(resp);
                        }, function(resp) {
                            deferred.reject(resp);
                        });
                    return deferred.promise;
                },

                /**
                 * 修改密码
                 * @param  {[type]} arg [description]
                 * @return {[type]}     [description]
                 */
                modPass: function(arg) {
                    var deferred = $q.defer();
                    //$http.jsonp(s.getUrl("uschangePass"), s.handleParams(arg))
                    base.request("uschangePass", arg)
                        .then(function(resp) {
                            deferred.resolve(resp);
                        }, function(resp) {
                            deferred.reject(resp);
                        });
                    return deferred.promise;
                },

                /**
                 * 注册
                 * @param  {[type]} arg [description]
                 * @return {[type]}     [description]
                 */
                register: function(arg) {
                    var deferred = $q.defer();
                    base.request("user/mapi/register", 1, arg)
                        .then(function(resp) {
                            deferred.resolve(resp);
                        }, function(resp) {
                            deferred.reject(resp);
                        })
                    return deferred.promise;
                },

                /**
                 * 用户收货人
                 * @return {[type]} [description]
                 */
                takeAddrs: function() {
                    var defer = $q.defer(),
                        _this = this;
                    var params = {
                            'address.usersid': _this.getUser().usersid
                        }
                        //$http.jsonp(s.getUrl("mbus_takeAddrs"), s.handleParams(params, false))
                    base.request("adtakeAddrs", params, false)
                        .then(function(resp) {
                            defer.resolve(resp);
                        }, function(resp) {
                            defer.reject(resp);
                        });
                    return defer.promise;
                },

                /**
                 * 添加修改用户收货人信息
                 * @param  {[type]} addr [description]
                 * @return {[type]}      [description]
                 */
                addressAction: function(addr, method) {
                    var defer = $q.defer(),
                        _addr = {};
                    for (item in addr) {
                        var _prop = 'address.' + item;
                        _addr[[_prop]] = addr[item];
                    }
                    _addr.method = method;
                    _addr["address.usersid"] = this.getUser().usersid;
                    // $http.jsonp(s.getUrl("mbus_addressAction"), s.handleParams(_addr, false))
                    base.request("adaddressAction", _addr, false)
                        .then(function(resp) {
                            defer.resolve(resp);
                        }, function(resp) {
                            defer.reject(resp);
                        });
                    return defer.promise;
                },

                /**
                 * 删除地址
                 * @param  {[type]} addr [description]
                 * @return {[type]}      [description]
                 */
                delAddress: function(addr) {
                    var defer = $q.defer(),
                        _addr = {};
                    for (item in addr) {
                        var _prop = 'address.' + item;
                        _addr[[_prop]] = addr[item];
                    }
                    _addr["address.usersid"] = this.getUser().usersid;

                    //$http.jsonp(s.getUrl("mbus_delAddress"), s.handleParams(_addr))
                    base.request("addelAddress", _addr)
                        .then(function(resp) {
                            defer.resolve(resp);
                        }, function(resp) {
                            defer.reject(resp);
                        });
                    return defer.promise;
                },
                /**
                 * 获取省市区信息
                 * @param  {[type]} areaId [description]
                 * @return {[type]}        [description]
                 */
                takeArea: function(code) {
                    var defer = $q.defer();
                    var params = {
                            code: code
                        }
                        //$http.jsonp(s.getUrl("mbul_searchRegion"), s.handleParams(params))
                    base.request("adsearchRegion", params)
                        .then(function(resp) {
                            defer.resolve(resp.data);
                        }, function(resp) {
                            defer.reject(resp);
                        })
                    return defer.promise;
                },
                /**
                 * 获取订单数据
                 * @param  {[type]} arg 订单状态
                 * @return {[type]}     [description]
                 */
                getOrder: function(arg, _page) {
                    var _this = this,
                        params = {
                            userid: _this.getUser().usersid,
                            status: arg,
                            pageno: _page
                        },
                        defer = $q.defer();
                    base.request("osorders", params)
                        .then(function(resp) {
                            var data = resp;
                            switch (arg) {
                                case 0:
                                    data = _this.handleOrder_all(data);
                                    break;
                                case 1:
                                    data = _this.handleOrder_waitPay(data);
                                    break;
                                case 2:
                                    data = _this.handleOrder_waitSent(data);
                                    break;
                                case 3:
                                    data = _this.handleOrder_waitTake(data);
                                    break;
                                case 4:
                                    data = _this.handleOrder_compalte(data);
                                    break;
                            }
                            defer.resolve(data);
                        }, function(resp) {
                            defer.reject(resp);
                        });
                    return defer.promise;
                },
                handleOrder_all: function(data) {
                    angular.forEach(data, function(sen, inx) {
                        if (sen.status == "待收货" || sen.status == "待发货") {
                            sen.default10 = false;
                        } else {
                            sen.default10 = true;
                        }
                    });
                    return data;
                },
                handleOrder_waitPay: function(data) {
                    angular.forEach(data, function(sen, inx) {
                        sen.default10 = true;
                    });
                    return data;
                },
                handleOrder_waitSent: function(data) {
                    angular.forEach(data, function(sen, inx) {
                        sen.default10 = false;
                    });
                    return data;
                },
                handleOrder_waitTake: function(data) {
                    angular.forEach(data, function(sen, inx) {
                        sen.default10 = false;
                    });
                    return data;
                },
                handleOrder_compalte: function(data) {
                    angular.forEach(data, function(sen, inx) {
                        sen.default10 = true;
                    });
                    return data;
                },

                chooseDate: function(_date) {
                    var defer = $q.defer();
                    if (!_date) {
                        _date = new Date();
                    } else {
                        if (_date.getMonth() == 0) {
                            _date.setFullYear(_date.getFullYear() - 1);
                            _date.setMonth(11);
                        } else {
                            _date.setMonth(_date.getMonth() - 1);
                        }
                    }

                    $ionicPlatform.ready(function() {
                        var options = {
                            mode: 'date',
                            date: _date,
                            allowOldDates: true,
                            allowFutureDates: false
                        }
                        $cordovaDatePicker.show(options).then(function(date) {
                            defer.resolve(date);
                        });
                    });
                    return defer.promise;
                },

                chooseContact: function() {
                    var defer = $q.defer();
                    $ionicPlatform.ready(function() {
                        $cordovaContacts.pickContact().then(function(contcat) {
                            var arr = new Array();
                            angular.forEach(contcat.phoneNumbers, function(o, i) {
                                var temp = o.value;
                                while (temp.includes('-') || temp.includes(' ')) {
                                    temp = temp.replace(' ', '').replace(/(-)/, '');
                                }
                                arr.push(temp);
                            });
                            var _contcat = {
                                displayName: contcat.displayName,
                                name: contcat.name,
                                phones: arr
                            }
                            defer.resolve(_contcat);
                        }, function(error) {
                            var errMsg = undefined;
                            switch (error) {
                                case ContactError.UNKNOWN_ERROR:
                                    errMsg = "未知原因, 获取联系人失败"
                                    break;
                                case ContactError.INVALID_ARGUMENT_ERROR:
                                    errMsg = "参数无效, "
                                    break;
                                case ContactError.TIMEOUT_ERROR:
                                    errMsg = "加载超时, 获取联系人失败"
                                    break;
                                case ContactError.IO_ERROR:
                                    errMsg = "读取错误, 获取联系人失败"
                                    break;
                                case ContactError.NOT_SUPPORTED_ERROR:
                                    errMsg = "暂不支持您的设备"
                                    break;
                                case ContactError.PERMISSION_DENIED_ERROR:
                                    errMsg = "没有权限获取联系人"
                                    break;
                            }
                            if (errMsg) {
                                $cordovaToast.showShortCenter(errMsg);
                            }
                        })
                    });
                    return defer.promise;
                }
            };
            return account;
        }
    ])
