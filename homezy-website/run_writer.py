
import sys
sys.stdout.reconfigure(encoding='utf-8')

page_content = open('page_template.txt', encoding='utf-8').read()
with open('src/app/page.tsx', 'w', encoding='utf-8') as f:
    f.write(page_content)
print('Done! Lines:', len(page_content.splitlines()))
