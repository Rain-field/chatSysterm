var patt,errorMsg,inputVal,state=0;//正则匹配规则、错误信息输出、保存输入框的值、状态（用于注册时三个正则都未点击的情况）
var li_this;//申请好友的this
var send_this//发送消息的this
var arr = []//定义一个数组添加user_id
var timeFrdList,timeOlList,timeNews,timeFrdReq;//获取在线用户定时器、获取好友列表定时器、获取消息定时器、获取好友申请定时器
var sta = 0;
F5();
// 再次刷新页面
  function F5(){
    // 获取当前时间至1970的秒数
    var date = parseInt(+ new Date()/1000);
    // 获取本地保存的时间戳(当前登录时间+870s)
    var ov = localStorage.getItem("sign_overtime");
    // 如果本地签名字符串存在并且时间戳未过期
    if( (ov - date>=0) && localStorage.getItem("sign_str")){
      var nickname = localStorage.getItem("sign_nickname")
      // 登录界面隐藏，写在这里是为了不显示效果
      $('#page1').attr("style"," ").hide();
      sta = 1;
      // 调用登陆后执行的操作
      loginReady(nickname);
    }else{
    	logout();
    }
  }
// 点击注册
  $(document).on("click","#register",function(){
    // 如果正则规则不存在则不能调用（即在输入框未失去焦点直接点击注册时会报错）
    if(patt){
      // 如果正则结果匹配则调用
      if(patt.test(inputVal)==true&&state >= 3) {
        // 调用注册接口
        register();
      }
    }
  })
// 正则验证
  // 用户名验证
  $('#reg_userName').on("blur",function(){
    // 正则规则
    patt = /^[A-z][A-z 0-9]{5,99}/;
    // 错误信息输出
    errorMsg = "*字母开头,长度6-100！";
    // 调用正则判断信息
    check($(this));
  })
  // 密码验证
  $('#reg_pwd').on("blur",function(){
    patt = /^[A-Za-z0-9!@#$%&*]{6,}$/;
    errorMsg = "*长度6位以上！";
    check($(this));
  })
  // 昵称验证
  $('#reg_nickName').on("blur",function(){
    patt = /^[\u4E00-\u9FA5A-Za-z0-9_]{1,20}$/;
    errorMsg = "*长度20字以内";
    check($(this));
  })
  // 正则判断提示信息
  function check(a){
    inputVal = a.val().trim();
    if (patt.test(inputVal) === false) {
      a.parent().find(".msg").remove().end().append("<span class='msg msg1'>" + errorMsg + "</span>")
    }else{
      a.parent().find(".msg").remove();
    }
    state++;
  }
// 点击登录
  $(document).on("click","#page1 #login",function(){
      login();
  })
  // 点击进入注册页面
  $(document).on("click",".choose",function(){
    // 注册界面旋转显示，登录界面旋转隐藏
    $('#page1').css({'transform':'rotate(720deg) scale(0)','transition':'all .8s'});
    $('#page2').css({'transform':'rotate(-720deg) scale(1)','transition':'all 1.4s .7s'});
   })
// 选项卡
  $(document).on("click",".myGroup span",function(){
  	// F5();
    var index = $(this).index();
    // 当前点击项添加类样式
    $(this).addClass("active").siblings().removeClass("active");
    // 对应的列表项显示和其余项隐藏
    $('.list ul').eq(index).fadeIn(500).siblings().fadeOut(500);
  })
// 点击好友弹出聊天框
  $(document).on("click",".friendList li",function(){
    console.log("sdfs");
  	// F5();
    // 保存当前点击项上的自定义属性昵称和id
    var nickName=$(this).attr("data-nickname");
    var frd_id=$(this).attr("data-user_id");
    // 必须进行字符串拼接！！！！！！！！
    var pin = 'data-user_id='+frd_id;
    var str = `<div class="right" data-user_id="${frd_id}">
                <div class="toFriendName">
                  <span class="friendName"><i class="radius"></i>${nickName}</span>
                </div>
                <div class="talkBox">
                </div>
                <div class="inputBox">
                  <div class="inputMsg" contenteditable="true"></div>
                  <div class="inputSelect">
                    <div class="close">关闭</div>
                    <div class="sendMsg">发送</div>
                  </div>
                </div>
              </div>`
    // 判断当前点击元素是否存在于这个数组中，如果不存在则将此id添加到数组并且创建聊天框加入到页面中
    if (!isInArray(arr,frd_id)) {
      arr.push(frd_id);
      $('.content').append(str);
    }
    //移除掉当前点击的提示
    $(this).find(".tips").remove();
    // 切换聊天框的效果，不加setTimeout就没有提示
    setTimeout(function(){
      // 做下角出现，右上角消失
      $('.right['+pin+']').css({"transform":"scale(1)","transform-origin":"left bottom"}).siblings(".right").not(".scale").css({"transform":"scale(0)","transform-origin":"right top"});
      // 另一种效果，左边出现，右边消失(需要修改部分样式)
      // $('.right['+pin+']').css({"transform":"scale(1)","transform-origin":"left center"}).siblings(".right").not(".scale").css({"transform":"scale(0,1)","transform-origin":"right center"});
    })
  })
  // 失去焦点后删除消息提示
    $(document).on("focus",".inputMsg",function(){
      var a = $(this).parents('.right').attr("data-user_id");
      var b = "data-user_id ="+a;
      $(".friendList li["+b+"]").find(".tips").remove();
    })
// 发送消息按钮(动态)
  $(document).on("click",".sendMsg",function(){
  	// F5();
    // 保存全局this
    send_this = $(this);
    var receive_user_id = $(this).parents('.right').attr("data-user_id");
    var msg = $(this).parent().siblings('.inputMsg').text();
    // 调用发送消息接口
    sendMessage(receive_user_id,msg);
  })
// 关闭聊天框
  $(document).on("click",".close",function(){
  	// F5();
    $(this).parents(".right").css({"transform":"scale(0)","transform-origin":"right top"});
  })
// 添加好友
  $(document).on("click",".addFriend",function(){
  	// F5();
    addFriend($(this).parent().attr("data-user_id"));
  })
// 处理好友申请
  $(document).on("click",".systermMsg li",function(){
  	// F5();
    li_this = $(this);
    var a = li_this.attr("data-user_id");
    var b = li_this.attr("data-request_id");
    var c = li_this.data("request_id")
    console.log(typeof b);
    console.log(typeof c);
    layer.msg("是否同意"+li_this.attr("data-nickname")+"的好友申请",{
      time:5000,
      btn: ['同意','拒绝','拉黑'],
      yes:function(){
        layer.msg("可以和好友开始聊天啦！",{time:1000},function(){
        processFriendRequest(li_this.attr("data-user_id"),li_this.attr("data-request_id"),1);
        li_this.remove();//移除处理的这项好友申请
        })
      },
      btn2:function(){
        processFriendRequest(li_this.attr("data-user_id"),li_this.attr("data-request_id"),2);
        li_this.remove();//移除处理的这项好友申请
      },
      btn3:function(){
        // data-user_id为申请人的id，data-request_id为本次好友申请的请求id，process_result为处理结果
        processFriendRequest(li_this.attr("data-user_id"),li_this.attr("data-request_id"),3);
        li_this.remove();//移除处理的这项好友申请
      }
    })
  });
// 删除好友
  $(document).on("click",".delFriend",function(event){
  	// F5();
    // 阻止冒泡， 防止点击删除后还弹出聊天框
    event.stopPropagation();
    var _this =$(this);
    layer.msg("是否删除好友？",{time:10000,btn:['确定','取消'],
      yes:function(){
        layer.msg("好友删除成功",{icon:1,time:1000},function(){
        removeFriend(_this.parent().attr("data-user_id"));
        _this.parent().remove();
        getFriendList();
      })
      }
    })
  })
// 点击登出
  $(document).on("click",".logout",function(){
  	// F5();
    layer.msg("坚持要退出吗？",{time:5000,
      btn:['我确定','我再想想'],
      yes:function(){
        layer.msg("再见咯！",{time:500},function(){
          logout();
        })
      },
      btn2: function(){
        layer.msg("好的,让我们继续！",{time:1000})
      }
    })
  })

// 登陆账号接口
  function login(){
    $.ajax({
      url:"https://onlinechat.jinyingyi.com.cn/interface/login.php",
      type:"POST",
      async: false,
      data:{
        username:$("#login_userName").val(),
        password:$("#login_pwd").val(),
      },
      success:function(res){
        // console.log(this);
        var data = res.data;
        // console.log(res);
        if (res.code === 0) {
        	if (!data.login_time) {
          	layer.msg("登陆成功,上一次登录时间:"+data.login_time,{time:2000});
        	}
          // 保存过期时间戳、签名字符串、用户名id、用户昵称
          localStorage.sign_overtime = data.sign_overtime;
          localStorage.sign_str = data.sign_str;
          localStorage.sign_id = data.id;
          localStorage.sign_nickname = data.nickname;
          sta = 1;
          //localStorage.setItem("sign_str",data.sign_str);另一种保存值的方式，与上类似
          //登录界面隐藏，写在这里是为了显示效果
          $('#page1').attr("style"," ").slideUp(400);
          //登录后执行的代码
          loginReady(data.nickname);
        }
        else{
          layer.msg("用户名或密码错误");
        }
      }
    })
  }
// 注册账号接口
  function register(){
    $.ajax({
      url:"https://onlinechat.jinyingyi.com.cn/interface/reg.php",
      type:"POST",
      async: false,
      data:{
        username:$("#reg_userName").val(),
        password:$("#reg_pwd").val(),
        nickname:$("#reg_nickName").val(),
      },
      success:function(res){
        console.log(res);
        if(res.code === 0){
          layer.msg("注册成功",{time:1000});
          // 登录界面旋转显示，注册界面旋转隐藏
          $('#page1').css({'transform':'rotate(1440deg) scale(1)','transition':'all .8s .7s'});
          $('#page2').css({'transform':'rotate(-1440deg) scale(0)','transition':'all .8s'});
          $('input[type!=submit]').val("");//清空输入框
        }
        else if(res.code === 4){
          layer.msg("用户名已存在");
        }
        else{
          layer.msg(res.msg);
        }
      }
    })
  }
// 获取在线用户接口（轮询）
  function getOnlineUsers(){
    $.ajax({
      url:"https://onlinechat.jinyingyi.com.cn/interface/getOnlineUsers.php",
      type:"POST",
      data:{
        sign_str: localStorage.getItem("sign_str"),
        user_id: localStorage.getItem("sign_id")
      },
      success:function(res){
      	if (res.code == 0) {
	        console.log(res);
	        var data = res.data;
	        var str = "";
	        // 遍历服务器获取的在线用户
	        $.each(data,function(index,element){
	          // li上保存自定义属性id
	         str += `<li data-user_id = "${element.user_id}">
	                  <span class="friendName"><i></i>${element.nickname}</span>
	                  <span class="message addFriend" title="添加好友">+</span>
	                 </li>`
	        })
	        // 将遍历的每一项添加到在线用户列表中
	        // $(".onlineList").children().remove().end().append(str);
	        $(".onlineList").html(str);
	        // 在选项卡中渲染用户数量
	        $(".tab1").html(`(${data.length})`);
      	}
      	else{
      		layer.msg(res.msg);
      	}
      },
      complete:function(){
      	if (sta==1) {
	        // 无论是否请求成功都会再次调用自身
	        timeOlList = setTimeout(function(){
	          getOnlineUsers();
	        },10000)
      	}
      }
    })
  }
// 申请好友接口
  function addFriend(a){
    console.log(a);
    $.ajax({
      url:"https://onlinechat.jinyingyi.com.cn/interface/addFriend.php",
      type:"POST",
      async: false,
      data:{
        sign_str: localStorage.getItem("sign_str"),
        user_id: localStorage.getItem("sign_id"),
        friend_user_id: a //想要添加为好友的对方的user_id
      },
      success:function(res){
        layer.msg(res.msg,{icon:1,time:1000});
        localStorage.setItem("sign_str",data.sign_str);
        localStorage.setItem("sign_overtime",data.sign_overtime);
        console.log(res);
      }
    })
  }
// 获取好友申请接口（长轮询）
  function getFriendRequest(){
    $.ajax({
      url:"https://onlinechat.jinyingyi.com.cn/interface/processFriendRequest.php",
      type:"GET",
      data:{
        sign_str: localStorage.getItem("sign_str"),
        user_id: localStorage.getItem("sign_id")
      },
      success:function(res){
        var data = res.data;
        var str = "",str2="";
        // 遍历服务器获取的好友申请
        $.each(data,function(index,element){
          // li上保存自定义属性id，好友本次请求所对应的id，昵称
          str+= `<li data-user_id="${element.user_id}" data-request_id="${element.request_id}" data-nickname="${element.nickname}">
                  <span class="friendName"><i></i>${element.nickname}<span>请求添加您为好友</span></span>
                </li>`
        })
        // 将遍历的每一项添加到通知里
        $('.systermMsg').html(str);
	      $(".tab3").html(`(${data.length})`);
      },
      complete:function(){
      	if (sta==1) {
	        timeFrdReq = setTimeout(function(){
	          getFriendRequest();
	        },1000)
      	}
      }
    })
  }
// 处理好友申请接口
  function processFriendRequest(a,b,c){
    $.ajax({
      url:"https://onlinechat.jinyingyi.com.cn/interface/processFriendRequest.php",
      type:"POST",
      data:{
        sign_str: localStorage.getItem("sign_str"),
        user_id: localStorage.getItem("sign_id"),
        from_user_id: a,//申请人的id
        request_id: b,//本次好友申请的请求id
        process_result: c,//处理结果1为同意，2为拒绝，3为拒绝并不再接收此人好友申请
      },
      success:function(res){
      	// console.log(res);
        // 调用获取好友申请接口和获取好友列表接口
        getFriendRequest();
        getFriendList();
      }
    })
  }
// 获取好友列表接口（轮询）
  function getFriendList(a){
    $.ajax({
      url:"https://onlinechat.jinyingyi.com.cn/interface/getFriends.php",
      type:"GET",
      data:{
        sign_str: localStorage.getItem("sign_str"),
        user_id: localStorage.getItem("sign_id")
      },
      success:function(res){
        var data = res.data;
        var str = "",str2 = "";
        $.each(data,function(index,element){
        	var pin1 = 'data-user_id='+element.user_id;
          // li上保存自定义属性id，昵称，是否在线标记
          // if(element.online == 0){
          //   str+=  `<span class="friendName"><i class="gray"></i>${element.nickname}</span>`
          // // 否则不做任何处理
          // }else{
          //   str+=  `<span class="friendName"><i></i>${element.nickname}</span>`
          // }
          // // 如果包含提示类就再次加上提示类(判断是否包含span标签，即判断长度是否为0或1)
          // if($(".friendList li["+pin1+"]").children(".friendName").find("span").length){
          // 	str+=  `<span class="friendName"><i></i>${element.nickname}<span class="tips"></span></span>`
          // }else{
          // 	str+=  `<span class="friendName"><i></i>${element.nickname}</span>`
          // }
					// 如果好友不在线就加上gray类(滤镜让图片变成黑白)
          if(element.online == 0){
          	str += `<li data-user_id="${element.user_id}" data-nickname="${element.nickname}" data-online="${element.online}">`
          	// 如果包含提示类就再次加上提示类(判断是否包含span标签，即判断长度是否为0或1)
            if($(".friendList li["+pin1+"]").children(".friendName").find("span").length){
	          	str+=  `<span class="friendName"><i class="gray"></i>${element.nickname}<span class="tips"></span></span>`
	          }else{
	          	str+=  `<span class="friendName"><i class="gray"></i>${element.nickname}</span>`
	          }
	          str +=`<span class="message delFriend" title="删除好友">-</span>
	                  </li>`
          // 否则不做任何处理
          }else{
          	str2 += `<li data-user_id="${element.user_id}" data-nickname="${element.nickname}" data-online="${element.online}">`
            if($(".friendList li["+pin1+"]").children(".friendName").find("span").length){
	          	str2+=  `<span class="friendName"><i></i>${element.nickname}<span class="tips"></span></span>`
	          }else{
	          	str2+=  `<span class="friendName"><i></i>${element.nickname}</span>`
	          }
	          str2 +=`<span class="message delFriend" title="删除好友">-</span>
	                  </li>`
          }

        })
        $(".friendList").children().remove().end().append(str2+str);
        $('.tab2').html(`(${data.length})`);
        // $(".friendList").html(str);
      },
      complete:function(){
      	if (sta==1) {
	        timeFrdList = setTimeout(function(){
	          getFriendList();
	        },10000)
      	}
      }
    })
  }
// 删除好友接口
  function removeFriend(a){
    $.ajax({
      url:"https://onlinechat.jinyingyi.com.cn/interface/removeFriend.php",
      type:"POST",
      async: false,
      data:{
        sign_str: localStorage.getItem("sign_str"),
        user_id: localStorage.getItem("sign_id"),
        friend_id: a
      },
      success:function(res){
        console.log(res);
      }
    })
  }
// 发送消息接口
  function sendMessage(a,b){
    $.ajax({
      url:"https://onlinechat.jinyingyi.com.cn/interface/sendMessage.php",
      type:"POST",
      async: false,
      data:{
        sign_str: localStorage.getItem("sign_str"),
        user_id: localStorage.getItem("sign_id"),
        receive_user_id:a,//发送给目标好友的id
        message:b//发送对的信息
      },
      success:function(res){
        console.log(res);
        if (res.code == 0) {
          var str = "";
          var data = res.data.data;
          // 主要是获取自身发送消息的时间
          var date = new Date();
          str = `<div class="talkMsg">
                  <div class="clearfix">
                    <div class="msgTime">${date.toLocaleString()}</div>
                    <div class="myHeadPic rHeadPic fr"></div>
                    <div class="msgContent mr fr">${b}</div>
                  </div>
                </div>`
          // 当前发送按键的聊天框中的输入框中添加对话信息
          send_this.parents(".inputBox").siblings(".talkBox").append(str);
          // 清除当前发送按钮所在的输入框的内容
          send_this.parent().siblings('.inputMsg').text(" ");
          // 更新字符串签名和过期时间
          localStorage.setItem("sign_str",data.sign_str);
          localStorage.setItem("sign_overtime",data.sign_overtime);
        }
        else{
          layer.msg(res.msg);
        }
      }
    })
  }
// 获取消息接口（长轮询）
  function getMessages(){
    $.ajax({
      url:"https://onlinechat.jinyingyi.com.cn/interface/getMessages.php",
      type:"GET",
      data:{
        sign_str: localStorage.getItem("sign_str"),
        user_id: localStorage.getItem("sign_id")
      },
      success:function(res){
      	console.log(123);
        var str ="",str2="";//str2获取消息的提示
        var data = res.data;
        $.each(data,function(index,element){
          // 定义对象保存自定义属性名和值，主要用于属性选择器
          var pi = 'data-user_id='+element.user_id;
          // 如果此条消息的用户id不在数组，在此id加到数组中，并且新建一个聊天框
          if (!isInArray(arr,element.user_id)) {
            str+= `<div class="right" data-nickName = ${element.nickname} data-user_id="${element.user_id}">
                    <div class="toFriendName">
                      <span class="friendName"><i class="radius"></i>${element.nickname}</span>
                    </div>
                    <div class="talkBox">
                      <div class="talkMsg">
                        <div class="msgTime">${element.message_send_time}</div>
                        <div>
                          <span class="myHeadPic"></span>
                          <span class="msgContent ml">${element.message}</span>
                        </div>
                      </div>
                    </div>
                    <div class="inputBox">
                      <div class="inputMsg" contenteditable="true"></div>
                      <div class="inputSelect">
                        <div class="close">关闭</div>
                        <div class="sendMsg">发送</div>
                      </div>
                    </div>
                  </div>`
            arr.push(element.user_id);
            $('.content').append(str);
          // 否则如果存在于数组中，只需将此条消息添加到相对应的消息框里
          }else{
            str+= `<div class="talkMsg">
                    <div class="msgTime">${element.message_send_time}</div>
                    <div>
                      <span class="myHeadPic"></span>
                      <span class="msgContent ml">${element.message}</span>
                    </div>
                  </div>`
            // 属性选择器拼接！！！！
            $('.right['+pi+']').children('.talkBox').append(str);
          }
          // 消息提示：接收到消息后在好友列表项中相对应的id项给上提示小圆点
          str2 = `<span class="tips"></span>`
          $(".friendList li["+pi+"]").find(".friendName").append(str2);
        })
      },
      complete:function(){
      	if (sta==1) {
	        timeNews = setTimeout(function(){
	          getMessages();
	        },300)
      	}
      }
    })
  }
// 登出接口
  function logout(){
    $.ajax({
      url:"https://onlinechat.jinyingyi.com.cn/interface/logout.php",
      type:"POST",
      async: false,
      data:{
        sign_str: localStorage.getItem("sign_str"),
        user_id: localStorage.getItem("sign_id")
      },
      success:function(res){
        console.log(res);
        //清除所有的本地存储
        localStorage.clear();
        //登陆页面隐藏，主页面显示
        $(".main").fadeOut(500);
        $('#page1').slideDown(400);
        sta=0;
        // 清除所有的setTimeout
        clearTimeout(timeFrdList);
        clearTimeout(timeOlList);
        clearTimeout(timeNews);
        clearTimeout(timeFrdReq);
        // 退出后再登陆会恢复原状
        $('.myGroup span').eq(0).addClass("active").siblings().removeClass("active");
        $('.list ul').eq(0).show().siblings().hide();//选项卡列表第一项显示，其余项隐藏
        $('.scale').show().siblings(".right").hide();//默认聊天页面显示，其余隐藏
        $('ul li').remove();//移除所有的列表项
        $('.right').not('.scale').remove();//移除除默认聊天页面外所有的聊天框
        arr = [];
      }
    })
  }

// 登录后执行的操作
 function loginReady(a){
  $('.myUserName').html(`<i></i>${a}`)// 渲染用户昵称
  $('.main').fadeIn();// 主页面显示
  $('.scale').show().siblings(".right").hide();//默认聊天页面显示，其余隐藏
  $('input[type!=submit]').val("");// 清空输入框
  getOnlineUsers();//获取在线好友
  getFriendRequest();//获取好友申请
  getFriendList();//获取好友列表
  getMessages();//获取消息接口
 }
// 在DOM结构中发生任何变化时触发
  $(document).on("DOMNodeInserted",".talkBox",function(){
    $(this).scrollTop(200000000);
  })
// 判断一个元素是否存在于这个数组中
  // 方法一
    // 将user_id不重复地添加到一个数组中
    // if(!arr.includes(frd_id)){
    //   arr.push(frd_id);
    //   $('.content').append(str);
    // }
  //方法二
  function isInArray(arr,value){
    for(var i = 0; i < arr.length; i++){
          if(value === arr[i]){
              return true;
          }
      }
      return false;
  }