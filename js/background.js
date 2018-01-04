// First launch
const server = 'http://192.168.120.215:9999/'
toggle(false)

$.ajax({
    url: `${server}ping`,
    type: 'GET',
}).then(res => toggle(true), err => {
    alert('连接服务器失败，请注意标注工具插件限在实验室局域网使用。插件已自动关闭。')
    toggle(true)
})

chrome.storage.sync.get(info => {
    if (!info.hasOwnProperty('count'))
        chrome.storage.sync.set({
            'count': 0
        })
})


chrome.extension.onMessage.addListener((objRequest, _, sendResponse) => {
    switch (objRequest.type) {
        case "submit":
            let clazz = objRequest.index
            let url = objRequest.url
            $.ajax({
                url: `${server}labels`,
                type: 'POST',
                contentType: "application/json;charset=UTF-8",
                data: JSON.stringify({
                    "clazz": clazz,
                    "url": url
                }),
            }).then(res => {
                sendResponse({
                    'status': 200
                });
                updateCount()
            }, err => {
                sendResponse({
                    'status': 500
                })
            })
            break
        case "alert":
            alert(objRequest.msg)
            break
        case "switch":
            toggle(objRequest.state)
            break
        default:
            break
    }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status == 'complete')
        continue
})

/**
 * @name toggle
 * @description 控制工具的开启与关闭
 * 
 * @param {bool} state 
 */
function toggle(state) {
    chrome.storage.sync.set({
        'switch': state
    })
    if (state)
        chrome.browserAction.setIcon({
            path: "resource/logo.png"
        })
    else
        chrome.browserAction.setIcon({
            path: "resource/logo-disable.png"
        })
}
/**
 * @name updateCount
 * @description 更新标记统计计数
 * 
 */
function updateCount() {
    chrome.storage.sync.get(info => {
        chrome.storage.sync.set({
            'count': info.count + 1
        })
    })
}