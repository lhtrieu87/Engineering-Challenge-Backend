/**
 * FoodItemController
 *
 * @description :: Server-side logic for managing Fooditems
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var _ = require('highland');
var ObjectID = require('sails-mongo/node_modules/mongodb').ObjectID;

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
        return res.status(500).json(error);
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
            return res.status(500).json(error);
          }

          return res.json(list);
        });
    });
  },

  get: function (req, res) {
    if(!ObjectID.isValid(req.params.id)) {
      return res.status(400).json({
        error: 'Malformed id'
      });
    }

    FoodItem.findOne().where({
      id: req.params.id
    }).exec(function (error, item) {
      if(error) {
        return res.status(500).json(error);
      }

      if(!item) {
        return res.status(404).json({
          error: 'Not found'
        });
      }

      return res.json(item);
    });
  },

  create: function (req, res) {
    var foodItemData = req.body;

    FoodItem.create(foodItemData).exec(function (error, item) {
      if(error) {
        return res.status(500).json(error);
      }

      return res.json(item);
    });
  }
};
