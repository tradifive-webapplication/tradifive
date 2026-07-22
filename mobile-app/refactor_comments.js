const fs = require('fs');
let code = fs.readFileSync('app/(tabs)/index.tsx', 'utf8');

const startIdx = code.indexOf('<View style={{ flex: 1 }}>', code.indexOf('{/* Comments Bottom Sheet Drawer Modal */}'));
const endIdx = code.indexOf('</Modal>', startIdx);

if (startIdx !== -1 && endIdx !== -1) {
  const innerContent = code.substring(startIdx, endIdx);
  
  const renderMethod = `
  const renderCommentsSheet = () => (
    <View style={{ flex: 1, position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }}>
${innerContent.split('\\n').map(l => '    ' + l).join('\\n')}
    </View>
  );

`;
  
  // Find where to insert it: before 'return (' that returns the main layout
  // We can insert it right before '{/* Create Post Modal */}' which is around line 3012
  const insertTarget = '{/* Create Post Modal */}';
  const insertIdx = code.indexOf(insertTarget);
  
  if (insertIdx !== -1) {
    code = code.substring(0, insertIdx) + renderMethod + code.substring(insertIdx);
    
    // Now replace the old Modal content with the new renderMethod
    const newModalStart = code.indexOf('{/* Comments Bottom Sheet Drawer Modal */}');
    const newModalEnd = code.indexOf('</Modal>', newModalStart) + 8;
    
    const newModalCode = `{/* Comments Bottom Sheet Drawer Modal */}
      <Modal
        visible={!!activeCommentPost && !activeViewerPostId}
        transparent={true}
        animationType="none"
        onRequestClose={() => {
          Animated.spring(translateY, {
            toValue: SNAP_POINTS.CLOSE,
            useNativeDriver: true,
            tension: 65,
            friction: 11
          }).start(() => {
            setActiveCommentPost(null);
            setReplyingToComment(null);
            setCommentInput('');
          });
        }}
      >
        {renderCommentsSheet()}
      </Modal>`;
      
    code = code.substring(0, newModalStart) + newModalCode + code.substring(newModalEnd);
    
    // Now inject it into ImageViewerModal
    code = code.replace(
      '<ImageViewerModal\\n        visible={!!activeViewerPostId}',
      '<ImageViewerModal\\n        children={!!activeCommentPost ? renderCommentsSheet() : null}\\n        visible={!!activeViewerPostId}'
    );
    
    fs.writeFileSync('app/(tabs)/index.tsx', code);
    console.log('Success!');
  } else {
    console.log('Failed to find insert target');
  }
} else {
  console.log('Failed to find modal boundaries');
}
