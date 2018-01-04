const server = 'http://192.168.120.215:8083/'
let state = false

$(document).ready(() => {
    getCount()
    getState()
    $('.rb-switcher i').click(() => {
        if (state) {
            toggle(false)
            $(".rb-switcher-label").text("off").addClass("disable")
        } else {
            $.ajax({
                url: `${server}ping`,
                type: 'GET',
            }).then(res => {
                toggle(true)
                $(".rb-switcher-label").text("on").removeClass("disable")
            }, err => {
                toggle(false)
                $(".rb-switcher-label").text("off").addClass("disable")
                alert("连接服务器失败，请注意标注工具插件限在实验室局域网使用。插件已自动关闭。")
            })
        }
    })
})


function toggle(state) {
    chrome.extension.sendMessage({
        type: 'switch',
        state
    })
}

function getCount() {
    chrome.storage.sync.get(info => {
        $('.count-number').text(info.count)
    })
}

function getState() {
    chrome.storage.sync.get(info => {
        state = info.switch
        if (state) {
            $(".rb-switcher-label").text("on").removeClass("disable")
            $("input[type='checkbox']").attr('checked',true)
        }
    })
}
/**
 * @name alert
 * @description 重载 alert 函数，将消息发给 background 弹出
 * 
 * @param {string} msg 
 */
function alert(msg) {
    chrome.extension.sendMessage({
        type: 'alert',
        msg
    })
}