# Backend-Developer-Challenge

Name: Le Hong Trieu  
Mobile: +6597547944  
Email: hongtrieule@gmail.com  
Git: https://github.com/lhtrieu87  

#### Pre-conditions:
* mongodb is installed and execute `mongod` to run mongodb at localhost:27017 (default port)
* npm install sails -g
* npm install

#### Commands:
In order to scrape myfitnesspal's foods and store them in a database, execute `node scrape.js`. The scraped food items are stored in `myfitnesspal` database and in collection `fooditem`. If you face TCP connection error, please try again, but scraped data so far should have been persisted into the db. Data scraping is implemented using Highland stream library and x-ray scraping library. 

#### Apis:
* To run the server: `sails lift`
* Search endpoint for autocomplete `curl "http://localhost:1337/fooditems/search?searchKey=chicken"`. The search for autocomplete is implemented using Mongodb full text search. The approach is fast as it is optimized by the db. The limitation is that it is word based, not character based and does not support fuzzy matching. A better approach may be elastic search http://blog.mongodb.org/post/95839709598/how-to-perform-fuzzy-matching-with-mongo-connector.
* Retrieve the nutritional information for a given food id `http://localhost:1337/fooditems/559d0e394c04cdde1a08d0b0`
* Create manually a new food item `curl -H "Content-Type: application/json" -X POST -d '{"name":"Testing food","company":"Test company","nutritionalTable":{"Vitamin A":"1%"}}' "http://localhost:1337/fooditems"`
