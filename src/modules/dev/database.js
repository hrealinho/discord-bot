// client@U7NCKJhKBVx5vB9T
// app@QB8t39GXqq8lOos8
/**
 *
 * @author Henrique Realinho
 */
var mongoose = require('mongoose');

const db = mongoose.connect('mongodb+srv://app:QB8t39GXqq8lOos8@eu-west-cluster0-vkyik.mongodb.net/test?retryWrites=true&w=majority', { useNewUrlParser: true });

var Schema = mongoose.Schema;
// what to save for each guild
 var guildSchema = new Schema({
   name: String,
   guildId: Number,
   songs: [{ name: String, url: String }],
   play: { name: String, url: String },
   volume: Number,
   prefix: String
 });

var Guild = mongoose.model('Guild', guildSchema);



guildSchema.index({ guildId: 1}); // schema level
// TODO

  // INSERT


  // UPDATE


  // delete


  // find

  // LOAD ALL


  //Guild.find({ size: 'small' }).where('createdDate').gt(oneYearAgo).exec(callback);
