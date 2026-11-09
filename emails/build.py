"""Writes apply.bundle.js: apply.js with brand-head.html and brand-footer.html inlined, ready to paste into the
browser console on a notification's Edit code page. Usage: python3 emails/build.py"""
import json, os

here = os.path.dirname(os.path.abspath(__file__))
read = lambda name: open(os.path.join(here, name), encoding='utf-8').read()
bundle = read('apply.js') + '\nconst FM_HEAD = ' + json.dumps(read('brand-head.html')) + ';\nconst FM_FOOT = ' + json.dumps(read('brand-footer.html')) + ';\nfmApply(FM_HEAD, FM_FOOT);\n'
open(os.path.join(here, 'apply.bundle.js'), 'w', encoding='utf-8').write(bundle)
print('apply.bundle.js', len(bundle))
