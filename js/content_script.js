const template = `
<div id="label-tool-message">
    <div class="label-tool-message-title">请选择本网页的类型（快捷键1,2,3,4,esc）</div>
    <div class="label-tool-message-close">X</div>
    <div class="label-tool-message-panel"></div>
</div>
<div id="label-tool-mask"></div>
<style id="label-tool-style">
    #label-tool-mask{
        background-color: rgba(0,0,0,.3);
        position: fixed;
        height: 100%;
        width: 100%;
        z-index: 100000;
        top: 0;
        left: 0;
    }
    #label-tool-message{
        background-color: #fff;
        z-index: 100001;
        border-radius: 5px;
        position: fixed;
        height: 150px;
        width: 400px;
        top: 50%;
        left: 50%;
        margin-top: -150px;
        margin-left: -200px;
    }
    .label-tool-message-close{
        position: absolute;
        right: 20px;
        top: 20px;
        font-size: 10px;
        height: 30px;
        width: 30px;
        line-height: 30px;
        background-color: #eee;
        border-radius: 15px;
        text-align: center;
    }
    .label-tool-message-title{
        height: 50px;
        font-size: 14px;
        padding-left: 30px;
        padding-top: 25px;
    }
    .label-tool-message-panel{
        padding: 20px 30px 0;
    }
    .label-tool-message-panel .section{
        background-color: #eee;
        display: inline-block;
        width: 80px;
        text-align: center;
        line-height: 40px;
        border-radius: 5px;
        margin: 0 2px;
    }
    .label-tool-message-panel .section:hover,.label-tool-message-close:hover{
        background-color: #ddd;
    }
</style>
`

const label = ['1.频道页', '2.列表页', '3.内容页', '4.错误页']

chrome.storage.sync.get(info => {
    console.log(`标注工具开关状态：${info.switch}`)
    if (info.switch)
        initLabelTool()
});

function initLabelTool() {
    document.body.innerHTML += template;

    label.forEach(e => $(".label-tool-message-panel")[0].innerHTML += `<div class="section">${e}</div>`)

    const closeLabelTool = () => $("#label-tool-message,#label-tool-mask").hide()

    $(".label-tool-message-close").click(closeLabelTool)

    $("#label-tool-message .label-tool-message-panel .section").each((index, dom) => {
        $(dom).click(() => {
            submit(index, location.href)
        })
    })

    document.onkeydown = (event) => {
        var e = event || window.event
        if (e.keyCode >= 49 && e.keyCode <= 57)
            submit(e.keyCode - 49, location.href)
        else if (e.keyCode == 27)
            closeLabelTool()
    }
    /**
     * @name submit
     * @description 向 background 发出消息，请求将标注信息上传服务器
     * 
     * @param {number} index 
     * @param {string} url 
     */
    function submit(index, url) {
        let page = $('html').clone(true)
        page.find("#label-tool-message,#label-tool-mask,#label-tool-style").remove()
        const html = page.html()
        closeLabelTool()
        chrome.extension.sendMessage({
            type: 'submit',
            index: index,
            url: url,
            html: html
        })
    }
}