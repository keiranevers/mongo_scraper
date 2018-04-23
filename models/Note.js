// Require
var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var NoteSchema = new Schema({

  title: {
    type: String
  },

  body: {
    type: String
  }
});

// Name of Schema
var Note = mongoose.model("Note", NoteSchema);

// Export
module.exports = Note;
