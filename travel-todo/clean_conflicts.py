#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""Script to remove Git merge conflict markers"""

with open('chatbot/bot_intelligence.py', 'r', encoding='utf-8') as f:
    lines = f.readlines()

cleaned = []
in_conflict = False
take_ours = False

for line in lines:
    stripped = line.strip()
    
    if stripped.startswith('<<<<<<<'):
        in_conflict = True
        take_ours = True
        continue
    elif stripped.startswith('=======') and in_conflict:
        take_ours = False
        continue
    elif stripped.startswith('>>>>>>>'):
        in_conflict = False
        continue
    
    # Keep lines that are not in the "theirs" section
    if not in_conflict or take_ours:
        cleaned.append(line)

with open('chatbot/bot_intelligence.py', 'w', encoding='utf-8') as f:
    f.writelines(cleaned)

print(f"Cleaned {len(lines) - len(cleaned)} conflict lines")
print(f"Result: {len(cleaned)} lines")
