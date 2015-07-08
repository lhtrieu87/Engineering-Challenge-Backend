# Backend-Developer-Challenge

#### Pre-conditions:
* mongodb is installed and run at localhost:27017 (default port)
* npm install sails -g
* npm install

#### Commands:
Scrape myfitnesspal's foods and store them in a database
`node scrape.js`. The scraped food items are stored in `myfitnesspal` database and in collection `foodItems`. If you face TCT connection error, please try again, but scraped data so far should have been persisted into the db.
