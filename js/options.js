let server
$(document).ready(() => {
    chrome.storage.sync.get(info => {
        server = info["server"]
        $("[name=server]").val(server)
        if (info.switch) {
            $("[name=switch]").attr("checked", "checked")
        } else {
            $("[name=switch]").removeAttr("checked")
        }
        layui.form.render('checkbox');
    })

    layui.form.on("submit(testServer)", data => {
        const newServer = data.field.server
        let loading = layer.load(1, {
            shade: [0.2, '#000'] //0.1透明度的白色背景
        });
        $.ajax({
            url: `${newServer}/ping`,
            type: 'GET',
            timeout: 2000,
        }).then(res => {
            layer.msg('连接成功', {
                icon: 6
            })
            layer.close(loading)
            chrome.storage.sync.set({
                'server': newServer
            })
        }, err => {
            layer.msg('连接服务器失败，请注意标注工具插件限在实验室局域网使用。')
            layer.close(loading)
            $("[name=server]").val(server)
        })
        return false
    })
    layui.form.on('switch(switch)', function (data) {
        if (data.elem.checked) {
            let loading = layer.load(1, {
                shade: [0.2, '#000'] //0.1透明度的白色背景
            });
            chrome.storage.sync.get(info => {
                const server = info["server"]
                $.ajax({
                    url: `${server}ping`,
                    type: 'GET',
                    timeout: 1000
                }).then(res => {
                    chrome.extension.sendMessage({
                        type: 'switch',
                        state: data.elem.checked
                    })
                    layer.close(loading)
                    layer.msg("插件成功开启")
                }, err => {
                    chrome.extension.sendMessage({
                        type: 'switch',
                        state: false
                    })
                    alert("连接服务器失败，请注意标注工具插件限在实验室局域网使用。插件已自动关闭。")
                    layer.close(loading)
                })
            })
        } else {
            chrome.extension.sendMessage({
                type: 'switch',
                state: data.elem.checked
            })
        }
    });
})