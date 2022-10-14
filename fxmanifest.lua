version '1.0.0'
author 'Hoppy'
description 'Basic description'

-- compatibility wrapper
fx_version 'adamant'
game 'gta5'

client_script 'client/*.lua'

server_script '@mysql-async/lib/MySQL.lua'
server_script 'server/*.lua'

ui_page "nui/index.html"

files {
    "nui/index.html",
    "nui/main.css",
    "nui/main.js",
    "nui/imgui.umd.js",
    "nui/imgui_impl.umd.js"
}
