## How to update docs

(Because I keep forgetting.)

### If demos were updated

- `cd` to `lib/docs/demos/` directory and run `npm install && npm run build`
- Copy contents of `lib/docs/demos/build/` to `lib/docs/static/`
- Move `lib/docs/static/index.html` to `lib/docs/static/static/` (it makes Hugo build easier and I'm lazy, sry)

### Building docs

- Make sure `hugo` cli is installed ([see here](https://gohugo.io/getting-started/installing/))
- Remove `docs/public/`
- run `npm run build:docs`
- Commit the new docs version
- Run `git subtree push --prefix=docs/public/ origin gh-pages`, or:

```bash
git push origin `git subtree split --prefix=docs/public/ develop`:gh-pages --force
```
