angular.module("cart.controller", ["ionic"])
    //提交订单
    .controller('OrderCtrl', ['$scope', '$state', '$stateParams', 'Cart', 'Account', 'base', function($scope, $state, $stateParams, Cart, Account, base) {
        
        //对提交订单页面数据的处理
         $scope.parameters = {
                product: angular.fromJson($stateParams.product),
                sumcounts: 1,
                sumprices: angular.fromJson($stateParams.product).productprice,
                order: "",
                addressId: 0
            }

        $scope.buyLess = function() {
            if ($scope.parameters.sumcounts > 1) {
                $scope.parameters.sumcounts--;
                $scope.totalPrice();
            }
        }
        $scope.buyAdd = function() {
            $scope.parameters.sumcounts++;
            $scope.totalPrice();
        }
        $scope.totalPrice = function() {
            var tempic = Math.round(parseFloat($scope.parameters.product.productprice * $scope.parameters.sumcounts) * Math.pow(10, 2));
            $scope.parameters.sumprices = (tempic / Math.pow(10, 2)).toFixed(2);
        }

        //选择地址
        $scope.chooseAddrs = function() {
             base.openModal($scope, 'templates/chooseAddress.html', "fadeInRight").then(function(caModal) {
                 caModal.show();

                 $scope.activeAdr = function(item) {
                     $scope.targetAddr = item;
                     angular.forEach($scope.addrs, function(sen, inx) {
                         sen.active = false;
                     });
                     item.active = true;

                     caModal.hide();
                 }

                 $scope.closeCaModal = function() {
                     caModal.hide();
                 }
             })
         }

         //获取用户所填写的所有地址
        $scope.takeArea = function(){
            base.request("adtakeAddrs",{'address.usersid': Account.getUser().usersid}).then(function(data){
                if(data.data){
                    $scope.addrs=data.data;
                    $scope.targetAddr=data.data[0];
                    $scope.parameters.addressId=data.data[0].id;
                    data.data[0].active = true;
                }else{
                    base.prompt($scope, "请先添加收货人地址", function(){
                        $state.go($stateParams.backWhere + "-addrconfig", { action: 'add' });
                    });
                }
            
                console.log(data);
                $scope.formatPhone = function(phone) {
                                        return base.formatPhone(phone);
                                    }
            });
        }

        //点击提交订单进入支付订单
        $scope.goPayOrder = function() {
            base.loading();
            base.request("shsaveOrder", {
                "prostr": $scope.parameters.product.productid+"_"+$scope.parameters.sumcounts+"_商品无属性_0",
                "userid": Account.getUser().usersid,
                "totalamount": $scope.parameters.product.productprice,
                "ordernumber": $stateParams.ordernumber
            }).then(function(data){
                $scope.parameters.order= data;
                base.loaded();
                $state.go($stateParams.backWhere + '-shop-pro-pay', { backWhere: $stateParams.backWhere, product: angular.toJson($scope.parameters) });
                console.log($scope.parameters.order);
            },function(resp){
                base.prompt("提交订单失败");
            });


        }
        
         $scope.$on("$ionicView.enter", function() {
               $scope.takeArea();
            });
    }])

    //支付订单
    .controller('PayCtrl', ['$scope', '$state', "$ionicHistory", '$stateParams', 'Cart', 'base', 'Account', function($scope, $state, $ionicHistory, $stateParams, Cart, base, Account) {
        //对支付订单页面数据的处理
        $scope.parameters = angular.fromJson($stateParams.product);

        //获取微信支付及支付宝支付
        $scope.payways = [
        { img:"img/WePayLogo.png", way: "wx"},
        { img:"img/zhifuboby.png", way: "al"}
        ];

        $scope.data={method: "wx"};

        $scope.getPay = function() {
           //console.log($scope.parameters.order.orderNumber);
           console.log($scope.data.method);
            base.request("shcreatePaymentInfo", {
                // "openid": Account.getUser().openid,
                "userid": Account.getUser().usersid,
                "ordernumber": $scope.parameters.order.orderNumber,
                "amount": $scope.parameters.sumprices,
                "addressid": $scope.parameters.addressId,
                //支付类型:wxpay,alipay,wxalipay分别为app微信支付 app支付宝支付 微信端支付宝支付
                "paytype":$scope.data.method
            }).then(function(data) {
                console.log(data);
                if (data.state != undefined && data.state == "no") {
                    layer.alert(data.reason);
                } else {
                    if ($scope.data.method == 'al') {
                        window.Alipay.Base.pay(data, function(successResults) {
                            var payres = successResults.resultStatus;
                            if (payres === "9000") {
                                base.prompt($scope, "支付成功", function(){
                                    // $state.go("");
                                    $ionicHistory.goBack(2);
                                })
                            } else if (payres == "6001") {
                                base.prompt($scope, "已取消支付");
                            } else if (payres == "6002") {
                                base.prompt($scope, "网络连接出错");
                            } else if (payres == "4000") {
                                base.prompt($scope, "订单支付失败");
                            } else if (payres == "8000") {
                                base.prompt($scope, "正在处理中");
                            }
                        }, function(errorResult) {
                            base.prompt($scope, "发起支付失败");
                        });
                    } else {
                        var params = {
                            partnerid: data.partnerid,
                            prepayid: data.prepayid,
                            noncestr: data.noncestr,
                            timestamp: data.timestamp,
                            sign: data.sign
                        };

                        Wechat.sendPaymentRequest(params, function() {
                            base.prompt("订单支付成功", function() {
                                $state.go();
                            });
                        }, function(reason) {
                            console.log(reason);
                        });
                    }
                }
            }, function(resp) {
                base.prompt('获取支付信息失败');
            });
        }
    }]);
