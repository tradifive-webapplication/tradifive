import re

with open('src/pages/Home.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add import
content = content.replace('import CommentModal from "@/components/CommentModal";', 'import FeedCard from "@/components/FeedCard";')

# Remove lightboxImage state
content = re.sub(r'const \[lightboxImage, setLightboxImage\] = useState<string \| null>\(null\);\n\s*', '', content)

# Remove onImageClick from FeedCard
content = content.replace('onImageClick={(url) => setLightboxImage(url)}', '')

# Remove lightbox render block
# The render block looks like this:
# {/* Real-time Image Zoom Lightbox Overlay */}
# {lightboxImage && createPortal( ... )}
lightbox_pattern = r'\{\/\* Real-time Image Zoom Lightbox Overlay \*\/\}.*?<\/AnimatePresence>\s*\}'
content = re.sub(lightbox_pattern, '', content, flags=re.DOTALL)

# Let's use a simpler regex for the createPortal block just in case
lightbox_pattern_2 = r'\{\/\* Real-time Image Zoom Lightbox Overlay \*\/\}.*?\{lightboxImage && createPortal\(.*?\)\}'
content = re.sub(lightbox_pattern_2, '', content, flags=re.DOTALL)


with open('src/pages/Home.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Updated Home.tsx')
