import re

# Read the file as text (not JSON)
with open('đề 2.json', 'r', encoding='utf-8') as f:
    content = f.read()

# Show sample before
print("BEFORE:")
idx = content.find('góc ')
print(content[idx:idx+50])
print()

# Replace ${...}$ with $...$
# Using non-greedy matching
count = 0
new_content = content
while True:
    match = re.search(r'\$\{([^}]*)\}\$', new_content)
    if not match:
        break
    new_content = new_content[:match.start()] + '$' + match.group(1) + '$' + new_content[match.end():]
    count += 1

print(f"Replaced {count} instances")

# Write back
with open('đề 2.json', 'w', encoding='utf-8') as f:
    f.write(new_content)

# Show sample after
with open('đề 2.json', 'r', encoding='utf-8') as f:
    content2 = f.read()

print("\nAFTER:")
idx = content2.find('góc ')
print(content2[idx:idx+50])
