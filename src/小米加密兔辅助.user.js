// ==UserScript==
// @name         小米加密兔辅助
// @namespace    http://tampermonkey.net/
// @version      0.1.0
// @description  抢小米加密兔专用
// @author       Mars Shen
// @require      https://code.jquery.com/jquery-latest.js
// @match        https://jiamitu.mi.com/home
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    //============Configuration===========
    var AJAX_REQUEST_URL = 'https://jiamitu.mi.com/pet/rush/pet?followUp=https:%2F%2Fjiamitu.mi.com%2Fhome';
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
    var requestErrorCounter = 0;
    //====================================

    $(BUTTON_ID).attr('id','mitu_btn_tools');
    $('#mitu_btn_tools').after('<hr>');
    $('#mitu_btn_tools').after('<div class="debug-text" id="show-error-count" style="display:none;text-align:left;padding-top: 10px;">请求错误统计: <span id="show-error-count-span">0</span></div>');
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
            for(var i=0;i<MAX_REQUEST;i++){
                setAjaxIntervalClick(i);
            }
            requestErrorCounter = 0;
            $('#debug-text-area').html('');
        }else{
            stopAllRequest();
        }
    });

    function clickAjax(timeArrId){
        var isSuccess = false;
        $.ajax({
            url : AJAX_REQUEST_URL,
            dataType : 'json',
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
                        logInfoSuccess('活动进行中,但没有抢到加密兔,继续尝试中.');
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
                    requestErrorCounter++;
                    $('#show-error-count-span').html(requestErrorCounter);
                }
            }
        });
        if(!isSuccess){
            setAjaxIntervalClick(timeArrId);
        }
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
        if(LOG_LEVEL >= 0){
            var newMessage = "<b>[请求尝试成功]:</b> " + msg;
            log(newMessage);
        }
    }
    function logInfoError(msg){
        if(LOG_LEVEL >= 1){
            var newMessage = "<b>[Error]:</b> " + msg;
            log(newMessage);
        }
    }

    function logInfo(msg){
        if(LOG_LEVEL >= 2){
            var newMessage = "<b>[Info]:</b> " + msg;
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