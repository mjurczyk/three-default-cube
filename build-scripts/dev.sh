npm run build:all > build.log
PACKAGE_NAME=$(tail -1 build.log)
rm build.log
cd docs/demos
npm i -D -f ../../$PACKAGE_NAME
rm ../../$PACKAGE_NAME
npm start & cd ../..
