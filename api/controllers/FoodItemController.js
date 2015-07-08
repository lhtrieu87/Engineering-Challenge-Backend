/**
 * FoodItemController
 *
 * @description :: Server-side logic for managing Fooditems
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var _ = require('highland');

module.exports = {
  /**
   * `FoodItemController.search()`
   * Implement autocomplete using full text search
   */
  search: function (req, res) {
    var searchKey = req.query.searchKey;

    // Use native mongo query for full text search
    FoodItem.native(function (error, collection) {
      if(error) {
        return res.json(error);
      }

      _(collection.find({
          $text: {
            $search: searchKey
          }
        }, {
          fields: {
            _id: 1,
            name: 1,
            score: {
              '$meta': "textScore"
            }
          }

        }).sort({
          score: {
            $meta: "textScore"
          }
        }).limit(10)).map(function (item) {
          delete item.score;
          return item;
        })
        .toArray(function (error, list) {
          if(error) {
            return res.json(error);
          }

          return res.json(list);
        });
    });
  }
};
