from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote

root = Path(__file__).resolve().parents[1]
class Document(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links, self.ids, self.fonts = [], set(), []
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if 'id' in attrs:
            self.ids.add(attrs['id'])
        for key in ['href', 'src']:
            value = attrs.get(key)
            if value:
                self.links.append(value)
                if 'fonts.googleapis.com/css2' in value:
                    self.fonts.append(value)

documents = {}
for file in [root / 'index.html', *(root / 'pages').glob('*.html')]:
    document = Document()
    document.feed(file.read_text())
    documents[file.resolve()] = document
errors = []
for file, document in documents.items():
    for value in document.links:
        url = urlsplit(value)
        if url.scheme or value.startswith('//'):
            continue
        target = (file.parent / unquote(url.path)).resolve() if url.path else file
        if not target.exists():
            errors.append(f'{file.name}: missing {value}')
        elif url.fragment and target in documents and url.fragment not in documents[target].ids:
            errors.append(f'{file.name}: dead anchor {value}')
    if len(document.fonts) != 1 or not all('ital@0;1' in url and 'wght@400;500;600;700;800' in url for url in document.fonts):
        errors.append(f'{file.name}: invalid Google Fonts URL')
if errors:
    raise SystemExit('\n'.join(errors))
print(f'All local links, anchors, assets and font URLs resolve across {len(documents)} HTML pages.')
