deploy:
	npm run build
	./node_modules/.bin/git-update-ghpages rstacruz/weedlecalc.com public -b gh-pages

images:
	cd src/assets/pokemon; \
		for id in {1..9}; do wget "http://pldh.net/media/pokecons/00$${id}.png"; done; \
		for id in {10..99}; do wget "http://pldh.net/media/pokecons/0$${id}.png"; done; \
		for id in {100..151}; do wget "http://pldh.net/media/pokecons/$${id}.png"; done
