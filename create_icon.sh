#!/bin/bash

# 创建图标集目录
ICONSET="NewsWidget.iconset"
mkdir -p "$ICONSET"

# 创建一个简单的 PNG 图标（使用 ImageMagick 或 sips）
# 如果没有 ImageMagick，我们用 Python 创建

python3 << 'PYTHON'
from PIL import Image, ImageDraw, ImageFont
import os

# 创建 1024x1024 的图标
size = 1024
img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)

# 绘制圆角矩形背景（渐变效果）
for i in range(size):
    r = int(255 - (255 - 107) * i / size)
    g = int(107 + (236 - 107) * i / size)
    b = int(107 + (196 - 107) * i / size)
    draw.rectangle([(0, i), (size, i+1)], fill=(r, g, b, 255))

# 绘制圆角遮罩
mask = Image.new('L', (size, size), 0)
mask_draw = ImageDraw.Draw(mask)
mask_draw.rounded_rectangle([(0, 0), (size, size)], radius=180, fill=255)
img.putalpha(mask)

# 添加 emoji 文字
try:
    font = ImageFont.truetype("/System/Library/Fonts/Apple Color Emoji.ttc", 600)
    draw.text((size//2, size//2), "📰", font=font, anchor="mm", embedded_color=True)
except:
    # 如果找不到 emoji 字体，使用普通文字
    try:
        font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 400)
        draw.text((size//2, size//2), "NEWS", font=font, fill=(255, 255, 255, 255), anchor="mm")
    except:
        pass

# 保存不同尺寸
sizes = [16, 32, 64, 128, 256, 512, 1024]
for s in sizes:
    resized = img.resize((s, s), Image.Resampling.LANCZOS)
    if s == 1024:
        resized.save(f'NewsWidget.iconset/icon_{s}x{s}.png')
    else:
        resized.save(f'NewsWidget.iconset/icon_{s}x{s}.png')
        resized.save(f'NewsWidget.iconset/icon_{s}x{s}@2x.png')

print("✅ PNG 图标已创建")
PYTHON

# 转换为 icns
iconutil -c icns "$ICONSET"

if [ -f "NewsWidget.icns" ]; then
    echo "✅ 图标文件已创建: NewsWidget.icns"
    rm -rf "$ICONSET"
else
    echo "❌ 图标创建失败"
fi
