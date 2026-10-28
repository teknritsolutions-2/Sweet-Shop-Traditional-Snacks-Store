from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit,unquote
root=Path(__file__).resolve().parents[1]
class Checker(HTMLParser):
 def handle_starttag(self,tag,attrs):
  for k,v in attrs:
   if k in ['href','src'] and v and not urlsplit(v).scheme and not v.startswith(('#','//')):
    path=(self.file.parent/unquote(urlsplit(v).path)).resolve()
    if not path.exists():errors.append(f'{self.file.relative_to(root)}: {v}')
errors=[]
for file in [root/'index.html',*(root/'pages').glob('*.html')]:
 p=Checker();p.file=file;p.feed(file.read_text())
if errors:raise SystemExit('\n'.join(errors))
print('All static local links and assets resolve.')
