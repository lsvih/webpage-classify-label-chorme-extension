// First launch.
chrome.storage.sync.get(info => {
    if (!info.hasOwnProperty('server'))
        chrome.storage.sync.set({
            'server': 'http://127.0.0.1:8080/'
        })
    if (!info.hasOwnProperty('count'))
        chrome.storage.sync.set({
            'count': 0
        })
})
// Get server address and test it.
getServer(server => {
    toggle(false)
    $.ajax({
        url: `${server}ping`,
        type: 'GET',
        timeout: 1000,
    }).then(res => toggle(true), err => {
        alert('连接服务器失败，请注意标注工具插件限在实验室局域网使用。插件已自动关闭。')
        toggle(false)
    })
})

let imageQuality = 1.0 // 图像质量
let isCompress = true // 是否开启压缩
let imageWidth = 1280 // 图片宽度

chrome.extension.onMessage.addListener((objRequest, _, sendResponse) => {
    switch (objRequest.type) {
        case "submit":
            let clazz = objRequest.index
            let url = objRequest.url
            let html = objRequest.html
            getCapture(data => {
                // 通知页面已截图完毕
                chrome.tabs.sendMessage(_.tab.id, {
                    type: "finishedCapture"
                }, () => {
                    // 对截图进行缩放
                    function dataURLToCanvas(dataurl, cb) {
                        let canvas = document.createElement('canvas')
                        let ctx = canvas.getContext('2d')
                        let img = new Image()
                        img.onload = () => {
                            canvas.width = isCompress ? imageWidth : img.width
                            let scale = canvas.width / img.width
                            canvas.height = img.height * scale
                            ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
                            cb(canvas)
                        };
                        img.src = dataurl
                    }

                    function fileOrBlobToDataURL(obj, cb) {
                        var a = new FileReader()
                        a.readAsDataURL(obj)
                        a.onload = function (e) {
                            cb(e.target.result)
                        }
                    }

                    function BlobToCanvas(blob, cb) {
                        fileOrBlobToDataURL(blob, dataurl => {
                            dataURLToCanvas(dataurl, cb)
                        })
                    }
                    BlobToCanvas(data[0], canvas => {
                        getServer(server => {
                            $.ajax({
                                url: `${server}labels`,
                                type: 'POST',
                                contentType: "application/json;charset=UTF-8",
                                data: JSON.stringify({
                                    "clazz": clazz,
                                    "url": url,
                                    "html": html,
                                    "image": canvas.toDataURL("image/png", imageQuality)
                                }),
                            })
                        })
                    })
                })
            })
            break
        case "alert":
            alert(objRequest.msg)
            break
        case "switch":
            toggle(objRequest.state)
            break
        case "getCapture":
            getCapture()
            break
        case "checkUrl":
            getServer(server => {
                $.ajax({
                    url: `${server}findLabelByUrl?url=${encodeURIComponent(objRequest.url)}`,
                    type: 'GET',
                    contentType: "application/json;charset=UTF-8",
                    timeout: 2000,
                }).then(res => {
                    if (typeof res != "object")
                        chrome.tabs.sendMessage(_.tab.id, {
                            type: "notExist"
                        })
                }, err => console.log(err))
            })
            break
        default:
            break
    }
});

// chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
//     if (changeInfo.status == 'complete')
//         continue
// })

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

function getCapture(callback) {
    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, tabs => {
        var tab = tabs[0]
        CaptureAPI.captureToBlobs(tab, callback, err => alert(err))
    });
}

function getServer(callback) {
    chrome.storage.sync.get(info => {
        let server = info["server"]
        callback(server)
    })
}