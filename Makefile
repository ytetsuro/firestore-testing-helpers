all:	clean build	;

clean:
	rm -rf ./dist

build:	./src
	find ./src -name '*.ts' | grep -v '/__tests__/' | grep -v '/bin/' | grep -v 'index.ts' | sed "s/\.\/src\/\(.*\)\.ts/export * from '.\/\1';/g" > ./src/index.ts \
	&& ./node_modules/.bin/tsc -b \
	&& find ./dist/ -name '*.ts' \
	&& rm src/index.ts
