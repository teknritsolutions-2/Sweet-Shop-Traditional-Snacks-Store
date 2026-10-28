"""Requires Pillow. Export consistent 1200x900 cards with EXIF rotation normalized."""
from pathlib import Path
import json
from PIL import Image, ImageOps
root = Path(__file__).resolve().parents[1]
path = root / 'assets/js/products.js'
products = json.loads(path.read_text().removeprefix('window.PRODUCTS = ').strip().removesuffix(';'))
folder = root / 'assets/images/catalog'
folder.mkdir(exist_ok=True)
for product in products:
    source = product.get('sourceImage', product['image'])
    if product['id'] == 14: source = 'assets/images/14.jpg'
    if product['id'] == 15: source = 'assets/images/cashews-landscape.jpg'
    product['sourceImage'] = source
    target = folder / f'{product["id"]}.jpg'
    with Image.open(root / source) as original:
        upright = ImageOps.exif_transpose(original).convert('RGB')
        photo = ImageOps.fit(upright, (1200, 900), method=Image.Resampling.LANCZOS)
        photo.save(target, 'JPEG', quality=85, optimize=True)
    product['image'] = f'assets/images/catalog/{product["id"]}.jpg'
path.write_text('window.PRODUCTS = ' + json.dumps(products, indent=2) + ';\n')
(root / 'documentation/catalog-image-map.json').write_text(json.dumps([
    {'id': p['id'], 'source': p['sourceImage'], 'derivative': p['image'],
     'size': '1200x900', 'treatment': 'EXIF normalized; centered 4:3 crop; no stretching or padding. Original license retained.'}
    for p in products
], indent=2))
print('Prepared 24 upright, consistent 1200 × 900 catalog photographs.')
