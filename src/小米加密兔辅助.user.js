// ==UserScript==
// @name         小米加密兔辅助
// @namespace    http://tampermonkey.net/
// @version      0.1.3.1
// @description  抢小米加密兔专用
// @author       Mars Shen
// @require      https://code.jquery.com/jquery-latest.js
// @match        https://jiamitu.mi.com/home*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    //============Configuration===========
    var XIAOMI_HOME = 'https://jiamitu.mi.com';
    var AJAX_REQUEST_URL = XIAOMI_HOME + '/pet/rush/pet';
    var START_TIME_URL = XIAOMI_HOME + '/pet/rush/startTime';
    var SHOW_DEBUG_BUTTON = false;      //Show debug button or not
    var CLICK_INTERVAL_MIN = 50;        //Request interval min time(ms)
    var CLICK_INTERVAL_MAX = 500;       //Request interval max time(ms)
    var MAX_REQUEST = 10;               //10 Request one time
    var LOG_LEVEL = 0;                  //0 only show success, 1 show success and error, 2 show all
    var BUTTON_ID = '.mitu-btn';        //Button id or class
    //====================================

    //============Global Var===========
    var DEBUG = true;
    var AJAX_BTN_FLAG = false;
    var ADD_HEIGHT = 300;
    var ajaxTimeidArr = {};
    var height = $('.mitu-hm-oper').height();
    var width = $('.mitu-hm-oper').width();
    var infoHeight = $('.mitu-info').height();
    var requestCounter = 0;
    var hasRabbit = null;
    var hasEvent = null;
    var judgeHasEventTimeTimeId = -1;
    //====================================

    $(BUTTON_ID).attr('id','mitu_btn_tools');
    $('#mitu_btn_tools').after('<hr>');
    $('#mitu_btn_tools').after('<div class="debug-text" id="show-request-count" style="display:none;text-align:left;padding-top: 10px;">剩余请求数: <span id="show-request-count-span">0</span></div>');
    $('#mitu_btn_tools').after('<div class="debug-text" id="debug-text-area" style="display:none;overflow-y:scroll;text-align:left;background:white;"></div>');
    $('#mitu_btn_tools').after('<br class="debug-text" style="display:none;">');
    if(SHOW_DEBUG_BUTTON){
        $('#mitu_btn_tools').after('<input type="button" class="mitu-btn" id="debug-btn" value="" />');
        $('#mitu_btn_tools').after('<br>');
    }
    $('#mitu_btn_tools').after('<input type="button" class="mitu-btn" id="ajax-start-btn" value="" />');
    $('#mitu_btn_tools').after('<br>');
    var buttonHeight = $('#mitu_btn_tools').height();

    if(SHOW_DEBUG_BUTTON){
        height += buttonHeight * 3.2;
        infoHeight += buttonHeight * 3.2;
    }else{
        height += buttonHeight * 2;
        infoHeight += buttonHeight * 2;
    }

    changeAjaxBtnValueByFlag();
    changeValueByFlagForDebug();

    $('#debug-btn').click(function(){
        DEBUG = !DEBUG;
        changeValueByFlagForDebug();
    });

    $('#ajax-start-btn').click(function(){
        AJAX_BTN_FLAG = !AJAX_BTN_FLAG;
        changeAjaxBtnValueByFlag();
        if(AJAX_BTN_FLAG){
            judgeHasEventTime();
            for(var i=0;i<MAX_REQUEST;i++){
                setAjaxIntervalClick(i);
            }
            $('#debug-text-area').html('');
        }else{
            stopAllRequest();
            window.clearInterval(judgeHasEventTimeTimeId);
        }
    });

    function clickAjax(timeArrId){
        var isSuccess = false;
        $.ajax({
            url : AJAX_REQUEST_URL,
            dataType : 'json',
            beforeSend(data){
                requestCounter++;
                $('#show-request-count-span').html(requestCounter);
            },
            complete(data, textStatus){
                if(requestCounter > 0){
                    requestCounter--;
                }
                $('#show-request-count-span').html(requestCounter);
            },
            success : function(result) {
                if(result.success == true){
                    if(result.result.got){
                        if(DEBUG){
                            logInfoSuccess('成功抢到加密兔! 加密兔编号为"' + result.result.id + '"!');
                        }
                        alert('成功抢到加密兔! 加密兔编号为"' + result.result.id + '"!');
                        isSuccess = true;
                        stopAllRequest();
                    }else{
                        if(hasEvent == null){
                            logInfoSuccess('没有抢到加密兔,继续尝试中.');
                        }else{
                            if(hasEvent){
                                if(hasRabbit){
                                    logInfoSuccess('活动进行中,但没有抢到加密兔,继续尝试中.');
                                }else{
                                    logInfoSuccess('活动进行中,但加密兔被抢完了,请明天再试.');
                                }
                            }else{
                                logInfoSuccess('活动已经结束或者尚未开始.');
                            }
                        }
                    }
                }else{
                    if(DEBUG){
                        logInfoSuccess(result.failMsg);
                    }
                }
            },
            error : function(result) {
                if(DEBUG){
                    logInfoError('Error Status: '+ result.status + ', Error Status Text: '+ result.statusText);
                }
            }
        });
        if(!isSuccess){
            setAjaxIntervalClick(timeArrId);
        }
    }

    function judgeHasEventTime(){
        judgeHasEventTimeTimeId = window.setInterval(function(){
            $.ajax({
                url : START_TIME_URL,
                dataType : 'json',
                success : function(result) {
                    if(result.success == true){
                        hasRabbit = result.result.hasRabbit;
                        hasEvent = result.result.hasEvent;
                    }
                }
            });
        },100);
    }

    function stopAllRequest(){
        for(var c_i=0;c_i<MAX_REQUEST;c_i++){
            clearAjaxInterval(c_i);
        }
    }

    function setAjaxIntervalClick(timeArrId){
        clearAjaxInterval(timeArrId);
        var intervalTime = randomNum(CLICK_INTERVAL_MIN,CLICK_INTERVAL_MAX);
        ajaxTimeidArr[timeArrId] = window.setInterval(function(){
            clickAjax(timeArrId);
        },intervalTime);
        if(DEBUG){
            logInfo('Ajax trigger interval time: ' + intervalTime + 'ms');
        }
    }

    function clearAjaxInterval(timeArrId){
        if(typeof ajaxTimeidArr[timeArrId] !== 'undefined' && ajaxTimeidArr[timeArrId] !== null ){
            window.clearInterval(ajaxTimeidArr[timeArrId]);
        }
    }

    function changeAjaxBtnValueByFlag(){
        if(AJAX_BTN_FLAG){
            $('#ajax-start-btn').val('停止抢加密兔');
        }else{
            $('#ajax-start-btn').val('开始抢加密兔');
        }
    }

    function changeValueByFlagForDebug(){
        if(DEBUG){
            $('#debug-btn').val('Debug(开启中)');
            logInfo('Debug Mode ON.');
            $('.debug-text').show();
            $('.mitu-hm-oper').height(height + ADD_HEIGHT);
            $('.mitu-info').height(infoHeight + ADD_HEIGHT);
            $('#debug-text-area').width(width).height(ADD_HEIGHT - 20);
        }else{
            $('#debug-btn').val('Debug(关闭中)');
            logInfo('Debug Mode OFF.');
            $('.debug-text').hide();
            $('#debug-text-area').html('');
            $('.mitu-hm-oper').height(height);
            $('.mitu-info').height(infoHeight);
        }
    }
    function logInfoSuccess(msg){
        var time = new Date().toLocaleString();
        if(LOG_LEVEL >= 0){
            var newMessage = "<b>[请求成功(" + time + ")]:</b> " + msg;
            log(newMessage);
        }
    }
    function logInfoError(msg){
        var time = new Date().toLocaleString();
        if(LOG_LEVEL >= 1){
            var newMessage = "<b>[Error(" + time + ")]:</b> " + msg;
            log(newMessage);
        }
    }

    function logInfo(msg){
        var time = new Date().toLocaleString();
        if(LOG_LEVEL >= 2){
            var newMessage = "<b>[Info(" + time + ")]:</b> " + msg;
            log(newMessage);
        }
    }

    function log(msg){
        $('#debug-text-area').append(msg + '<br>');
        var scrollTop = $("#debug-text-area")[0].scrollHeight;
        $("#debug-text-area").scrollTop(scrollTop);
    }

    function randomNum(minNum,maxNum){
        switch(arguments.length){
            case 1:
                return parseInt(Math.random()*minNum+1);
            case 2:
                return parseInt(Math.random()*(maxNum-minNum+1)+minNum);
            default:
                return 0;
        }
    }
})();
