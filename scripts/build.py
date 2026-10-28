from pathlib import Path
import shutil
root=Path(__file__).resolve().parents[1]
dist=root/'dist'
if dist.exists():shutil.rmtree(dist)
dist.mkdir()
for name in ['index.html','robots.txt','sitemap.xml','.nojekyll']:shutil.copy2(root/name,dist/name)
for name in ['assets','pages']:shutil.copytree(root/name,dist/name)
print('Static publication files prepared in dist/.')
