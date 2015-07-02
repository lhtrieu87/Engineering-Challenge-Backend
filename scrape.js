// Most interesting interview assignment

var Xray = require('x-ray');
var x = new Xray();

var _ = require('underscore');

var scrapedItemCount = 0;

// For each popular tag T, we scrape the list of food items tagged by T. 
function goToFoodListPagesByTags(error, tags) {
  if(!error) {
    console.log('Scraped popular tags... Travelling to the lists of food items using tags...');
    _.each(tags, function (tagUrl) {
      x(tagUrl, '#new_food_list li', [{
        url: x('.food_description', 'a@href'),
      }])(goToFoodItemDetailsPages);
    });
  } else {
    console.log(error);
  }
}

// For each item in the list, we travel to food detail page and scrape the details.
function goToFoodItemDetailsPages(error, items) {
  if(!error) {
    _.each(items, function (item) {
      x(item.url, '#main', {
        name: '.food-description',
        company: '#other-info .col-1 .secondary-title',
        nutritionalTable: {
          keys: ['td.col-1'],
          values: ['td.col-2'],
        }
      })(function (error, foodItem) {
        foodItem = transformData(cleanData(foodItem));
        // console.log(foodItem);
        ++scrapedItemCount;
        process.stdout.write("Scraped " + scrapedItemCount + " food items...\r");
      });
    });
  } else {
    console.log(error);
  }
}

// Remove trash data from the scraped food item
function cleanData(foodItem) {
  if(foodItem.company)
    foodItem.company = foodItem.company.replace('More from ', '').trim();
  return foodItem;
}

// Transform scraped data into cleaner format
function transformData(foodItem) {
  var keys = foodItem.nutritionalTable.keys;
  var values = foodItem.nutritionalTable.values;

  for(var i = 0; i < keys.length; i++) {
    foodItem.nutritionalTable[keys[i]] = values[i];
  }

  delete foodItem.nutritionalTable.keys;
  delete foodItem.nutritionalTable.values;

  return foodItem;
}

console.log('Please be patient...');
var popularTagsUrl = 'http://www.myfitnesspal.com/food/calorie-chart-nutrition-facts';
x(popularTagsUrl, '#popular_tags li', ['a@href'])(goToFoodListPagesByTags);
