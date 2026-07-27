import re
import sys

def main():
    try:
        with open('src/pages/RiskGuard.tsx', 'r', encoding='utf-8') as f:
            content = f.read()
            
        # We need to insert a </div> just before {/* SIDEBAR */} to close the flex-1 column
        
        sidebar_idx = content.find("{/* SIDEBAR */}")
        
        # Check if we already have the missing div
        # By looking at the 50 characters before sidebar
        before_sidebar = content[sidebar_idx-100:sidebar_idx]
        
        # We know we replaced everything up to SIDEBAR with new_layout which ends with:
        #            </div>
        #            
        #
        # Let's count divs in RiskGuard.tsx
        # Actually it's easier to just add the missing div
        
        # In the previous step, my new_layout ended with </div>
        # but the original block ended with </div> </div>
        # So I am missing one </div>!
        
        new_content = content[:sidebar_idx] + "            </div>\n            {/* Closes flex-1 main content column */}\n            " + content[sidebar_idx:]
        
        with open('src/pages/RiskGuard.tsx', 'w', encoding='utf-8') as f:
            f.write(new_content)
            
        print("Added missing div")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == '__main__':
    main()
