import re

with open('app/(tabs)/index.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

start = -1
end = -1
for i, l in enumerate(lines):
    if '{/* Comments Bottom Sheet Drawer Modal */}' in l:
        start = i
    if start != -1 and '</Modal>' in l and i > start:
        end = i
        break

if start != -1 and end != -1:
    modal_start = start + 1
    inner_start = -1
    for i in range(modal_start, end):
        if '<View style={{ flex: 1 }}>' in lines[i]:
            inner_start = i
            break
    
    if inner_start != -1:
        inner_content = lines[inner_start:end]
        
        render_method = [
            "\n  const renderCommentsSheet = () => (\n",
            "    <View style={{ flex: 1, position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }}>\n"
        ]
        render_method.extend(inner_content)
        render_method.append("    </View>\n")
        render_method.append("  );\n\n")
        
        return_line = 3073 # index is 3073 for line 3074
        
        lines.insert(return_line, "".join(render_method))
        
        offset = len(render_method)
        start += offset
        end += offset
        modal_start += offset
        
        new_modal = [
            "      {/* Comments Bottom Sheet Drawer Modal */}\n",
            "      <Modal\n",
            "        visible={!!activeCommentPost && !activeViewerPostId}\n",
            "        transparent={true}\n",
            "        animationType=\"none\"\n",
            "        onRequestClose={() => {\n",
            "          Animated.spring(translateY, {\n",
            "            toValue: SNAP_POINTS.CLOSE,\n",
            "            useNativeDriver: true,\n",
            "            tension: 65,\n",
            "            friction: 11\n",
            "          }).start(() => {\n",
            "            setActiveCommentPost(null);\n",
            "            setReplyingToComment(null);\n",
            "            setCommentInput('');\n",
            "          });\n",
            "        }}\n",
            "      >\n",
            "        {renderCommentsSheet()}\n",
            "      </Modal>\n"
        ]
        
        lines = lines[:start] + new_modal + lines[end+1:]
        
        iv_start = -1
        iv_end = -1
        for i in range(len(lines)):
            if '<ImageViewerModal' in lines[i]:
                iv_start = i
            if iv_start != -1 and '/>' in lines[i] and i >= iv_start:
                iv_end = i
                break
                
        if iv_start != -1 and iv_end != -1:
            lines[iv_end] = lines[iv_end].replace('/>', '>\n        {!!activeCommentPost && renderCommentsSheet()}\n      </ImageViewerModal>\n')
        
        with open('app/(tabs)/index.tsx', 'w', encoding='utf-8') as f:
            f.writelines(lines)
        print("Successfully refactored comments sheet!")
    else:
        print("Could not find inner start")
else:
    print("Could not find modal")
