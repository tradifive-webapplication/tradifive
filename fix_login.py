import sys
import re

path = 'src/pages/Login.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

target = "}, { onConflict: 'id' });"
replacement = "}, { onConflict: 'id' });\n\n            if (referralCode) {\n              const { error: rpcError } = await supabase.rpc('register_referral', {\n                referral_code_input: referralCode,\n                new_user_id: data.user.id\n              });\n              if (rpcError) console.error('Failed to register referral:', rpcError);\n            }"

content = content.replace(target, replacement)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
