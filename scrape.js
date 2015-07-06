// Most interesting interview assignment

var Xray = require('x-ray');
var x = new Xray();

var _ = require('highland');

var mongojs = require('mongojs');
var dbUrl = 'myfitnesspal';
var collections = ['foodItems'];
var db = mongojs(dbUrl, collections);

console.log('Please be patient...');
var popularTagsUrl = 'http://www.myfitnesspal.com/food/calorie-chart-nutrition-facts';

// tagUrl -> a readable stream, which retrieves the list of food items under the tag
var visitTagUrl = function(tagUrl) {
  var readable = x(tagUrl, '#new_food_list li', [
    '.food_description a@href'
  ]).write();
  return _(readable);
};

var onlyFoodDetailsUrl = function(url) {
  return url.indexOf('/food/calories/') >= 0;
};

var visitFoodDetailsUrl = function(foodUrl) {
  var readable = x(foodUrl, '#main', {
    name: '.food-description',
    company: '#other-info .col-1 .secondary-title',
    nutritionalTable: {
      keys: ['td.col-1'],
      values: ['td.col-2'],
    }
  }).write();
  return _(readable);
};

var transformFoodData = function(foodItem) {
  foodItem = JSON.parse(foodItem);

  if (foodItem.company)
    foodItem.company = foodItem.company.replace('More from ', '').trim();

  var keys = foodItem.nutritionalTable.keys;
  var values = foodItem.nutritionalTable.values;

  for (var i = 0; i < keys.length; i++) {
    foodItem.nutritionalTable[keys[i]] = values[i];
  }

  delete foodItem.nutritionalTable.keys;
  delete foodItem.nutritionalTable.values;

  return foodItem;
};

var insertFoodItemIntoDb = function(foodItem) {
  return _(function(push) {
    var cb = function(err, x) {
      if (err) {
        push(err);
      } else {
        push(null, x);
      }
      push(null, _.nil);
    };
    db.foodItems.insert(foodItem, cb);
  });
};

var scrapedItemCount = 0;
x(popularTagsUrl, '#popular_tags li', ['a@href'])(function(error, tagUrls) {
  if (!error) {
    _(tagUrls)
      .ratelimit(100, 100)
      .map(visitTagUrl)
      .parallel(200)
      .map(JSON.parse)
      .reduce1(_.concat)
      .flatten()
      .filter(onlyFoodDetailsUrl)
      .ratelimit(20, 1000)
      .map(visitFoodDetailsUrl)
      .parallel(1000)
      .map(transformFoodData)
      .map(insertFoodItemIntoDb)
      // Control the maximum number of db connections
      .parallel(10)
      // Remove errors from the stream and continue with remaining data
      .errors(function(error) {
        console.error('Error!!!', error.stack);
      })
      .each(function() {
        ++scrapedItemCount;
        process.stdout.write("Scraped " + scrapedItemCount + " food items...\r");
      })
      .done(function() {
        db.close();
      });
  } else {
    console.log(error);
  }
});
