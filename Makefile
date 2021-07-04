
all:	clean build	;

clean:
	rm -rf ./dist

build:	./src
	./node_modules/.bin/tsc -b \
  && find ./dist/ -name '*.ts' | grep /__tests__/ | xargs rm

