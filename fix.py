import sys
with open('src/app/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()
old = "const [messages, setMessages] = useState<Message[]>([{ role: 'assistant', content: 'Mantlic online. What do you need?' }])"
new = "const [messages, setMessages] = useState<Message[]>([{ role: 'assistant', content: 'Mantlic v1.0.0 \xe2\x80\x94 Terminal for DeFi\\n\\nType commands in natural language.\\n\\nExamples:\\n  > send 0.1 MNT to 0x123...\\n  > best yield\\n  > balance\\n\\nType help for all commands.' }])"
if old in content:
    content = content.replace(old, new)
    with open('src/app/page.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print('SUCCESS')
else:
    print('NOT FOUND')
