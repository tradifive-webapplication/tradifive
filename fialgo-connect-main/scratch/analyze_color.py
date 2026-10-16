from PIL import Image
import os

img_path = r"C:\Users\nikil\.gemini\antigravity\brain\692c643c-8ccc-4255-b3ca-0935d5565db3\media__1779990809573.png"
if os.path.exists(img_path):
    img = Image.open(img_path)
    # Convert to RGB
    img = img.convert('RGB')
    # Get pixel colors
    pixels = list(img.getdata())
    # Find unique colors
    unique_colors = set(pixels)
    print(f"Unique colors count: {len(unique_colors)}")
    # Print first few unique colors or average color
    colors_list = list(unique_colors)
    print(f"Sample colors: {colors_list[:10]}")
    # Get average color
    r_total, g_total, b_total = 0, 0, 0
    for r, g, b in pixels:
        r_total += r
        g_total += g
        b_total += b
    n = len(pixels)
    avg_color = (r_total // n, g_total // n, b_total // n)
    hex_color = '#{:02x}{:02x}{:02x}'.format(*avg_color)
    print(f"Average color: {avg_color} (Hex: {hex_color})")
else:
    print("File not found")
