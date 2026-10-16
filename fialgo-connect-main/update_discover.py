import re

with open('src/pages/Discover.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

mentors_pattern = r"(?s)(\{\/\* Featured Channels heading / Mentors \*\/\}.*?)\n\s*\{\/\* People \*\/\}"
people_pattern = r"(?s)(\{\/\* People \*\/\}.*?)\n\s*\{\/\* Competitions \*\/\}"

mentors_match = re.search(mentors_pattern, content)
people_match = re.search(people_pattern, content)

if mentors_match and people_match:
    mentors_code = mentors_match.group(1)
    people_code = people_match.group(1)
    
    # 1. Modify mentors code to add finalMentors.length > 0 condition and add some top padding
    mentors_code = mentors_code.replace('!searchQuery && (', '!searchQuery && finalMentors.length > 0 && (')
    mentors_code = mentors_code.replace('className="space-y-3"', 'className="space-y-3 pt-6"')
    
    # 2. Modify people code to add h2 People title
    people_code_modified = people_code.replace(
        '<motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">',
        '<motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">\n                            <h2 className="text-xl font-bold text-[#060607] dark:text-[#F2F3F5]">\n                                People\n                            </h2>'
    )
    
    # Replace in content
    full_pattern = r"(?s)\{\/\* Featured Channels heading / Mentors \*\/\}.*?\n\s*\{\/\* Competitions \*\/\}"
    new_combined = people_code_modified + "\n\n                    " + mentors_code + "\n\n                    {/* Competitions */}"
    
    new_content = re.sub(full_pattern, new_combined, content)
    
    with open('src/pages/Discover.tsx', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Successfully updated Discover.tsx")
else:
    print("Could not find the sections!")
    if not mentors_match: print("Mentors missing")
    if not people_match: print("People missing")
