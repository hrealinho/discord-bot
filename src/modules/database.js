// client@U7NCKJhKBVx5vB9T
/**
 * Mongo DB database for the discord bot.
 * Uses mongoose to model the objects for the database.
 * @author Henrique Realinho
 */
const mongoose = require('mongoose');
const { mongodb_user } = require('../config.json');
// connect to mongo db atlas
const db = mongoose.connect('mongodb+srv://' + mongodb_user + '@eu-west-cluster0-vkyik.mongodb.net/test?retryWrites=true&w=majority',
{ useCreateIndex: true, useNewUrlParser: true });

var Schema = mongoose.Schema;
// what to save for each guild
var guildSchema = new Schema({
   name: { type : String , unique : true, required : true },
   guildId: { type : String , unique : true, required : true },
   songs: [{ name: String, url: String }],
   prefix: String
});
var Guilds = mongoose.model('Guild', guildSchema);
guildSchema.path('guildId').index({ unique: true });

/**
 * Saves a document to the database given the info.
 * @param {string} guildName -
 * @param {string} guildId -
 * @param {[Object]} songs -
 * @param {string} prefix -
 * @returns the created or updated database document
 */
function save(guildName, guildId, songs, prefix, callback) {
    callback = callback || handleError('save fail');
    if (!guildName || !guildId || !prefix) {
      return handleError('save doc failed');
    }
    // TODO -> check if the doc already exists and if so, save instead of create
    Guilds.find({ guildId: guildId },
     function (err) {
      if (err) {
        const doc = {
          name: guildName,
          guildId: guildId,
          songs: songs,
          prefix: prefix,
        };
        return Guilds.create(doc, function (err, document) {
          if (err) {
            handleError(err);
          }
          return callback(document);
        });
      }
      // found doc
      return Guilds.updateOne({ guildId: guildId },{ prefix: prefix },
         function (err, document) {
            if (err) {
              handleError(err);
            }
            return callback(document);
      });
    });
}

/**
 *
 * @param {[guildSchema]} documents -
 */
function saveMany(documents) {
  if (!documents) return;
  return Guilds.create(documents, function (err, docs) {
    if (err) handleError(err);

    console.log('saved to database');
  });
}

/**
 *
 * @param {string} guildId -
 */
function deleteDoc(guildId) {
  return Guilds.deleteOne({ guildId: guildId },
     function (err) {
      if (err) {
        return handleError(err);
      }
      // deleted at most one document
      // ...
    });
}

/**
 *
 * @param {string} guildId -
 * @param {function} callback -
 * @returns the prefix for the given guild
 */
function loadPrefix(guildId, callback) {
  callback = callback || handleError('loading data error');
  if (!guildId) {
    return handleError('load prefix fail');
  }
  Guilds.findOne({ 'guildId': guildId }, 'guildId prefix', function (err, doc) {
    if (err) {
      return handleError(err);
    }
    // success
    return callback(doc);
  });
}

function handleError(error) {
  // ...
  return console.log(error);
}

module.exports = {
  save: save,
  saveMany: saveMany,
  delete: deleteDoc,
  loadPrefix: loadPrefix
};

  //Guild.find({ size: 'small' }).where('createdDate').gt(oneYearAgo).exec(callback);

/*

// pass a spread of docs and a callback
Candy.create({ type: 'jelly bean' }, { type: 'snickers' }, function (err, jellybean, snickers) {
  if (err) // ...
});

// pass an array of docs
var array = [{ type: 'jelly bean' }, { type: 'snickers' }];
Candy.create(array, function (err, candies) {
  if (err) // ...

  var jellybean = candies[0];
  var snickers = candies[1];
  // ...
});

// callback is optional; use the returned promise if you like:
var promise = Candy.create({ type: 'jawbreaker' });
promise.then(function (jawbreaker) {
  // ...
})

// named john and at least 18
MyModel.find({ name: 'john', age: { $gte: 18 }});

// executes, passing results to callback
MyModel.find({ name: 'john', age: { $gte: 18 }}, function (err, docs) {});

// executes, name LIKE john and only selecting the "name" and "friends" fields
MyModel.find({ name: /john/i }, 'name friends', function (err, docs) { })

// passing options
MyModel.find({ name: /john/i }, null, { skip: 10 })

// passing options and executes
MyModel.find({ name: /john/i }, null, { skip: 10 }, function (err, docs) {});

// executing a query explicitly
var query = MyModel.find({ name: /john/i }, null, { skip: 10 })
query.exec(function (err, docs) {});

// using the promise returned from executing a query
var query = MyModel.find({ name: /john/i }, null, { skip: 10 });
var promise = query.exec();
promise.addBack(function (err, docs) {});
*/
