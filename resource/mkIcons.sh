#!/bin/bash 
icon=$1
mkdir icon_pngpic.iconset
sips -z 16 16 $icon --out icon_pngpic.iconset/icon_16x16.png
sips -z 32 32 $icon --out icon_pngpic.iconset/icon_16x16@2x.pngsips -z 32 32 $icon --out icon_pngpic.iconset/icon_32x32.png
sips -z 64 64 $icon --out icon_pngpic.iconset/icon_32x32@2x.pngsips -z 128 128 $icon --out icon_pngpic.iconset/icon_128x128.png
sips -z 256 256 $icon --out icon_pngpic.iconset/icon_128x128@2x.pngsips -z 256 256 $icon --out icon_pngpic.iconset/icon_256x256.png
sips -z 512 512 $icon --out icon_pngpic.iconset/icon_256x256@2x.pngsips -z 512 512 $icon --out icon_pngpic.iconset/icon_512x512.png
sips -z 1024 1024 $icon --out icon_pngpic.iconset/icon_512x512@2x.png
iconutil -c icns icon_pngpic.iconset -o icon.icns
rm -rf icon_pngpic.iconset