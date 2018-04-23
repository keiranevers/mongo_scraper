 // Dependencies
var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");

var axios = require("axios");
var cheerio = require("cheerio");

var db = require("./models");
// Express
var app = express();

// Use morgan and body-parser
app.use(logger("dev"));
app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static("public"));

//db configuration


// var db = mongoose.connection;

if (process.env.MONGODB_URI) {
  mongoose.connect("mongodb://heroku_r0d2fq1c:ruel3vp7gqoqh2g3spvd14k7mr@ds229648.mlab.com:29648/heroku_r0d2fq1c");
} else {
	mongoose.connect("mongodb://localhost/mongonews");
}

// Routes

// A GET route for scraping the echoJS website
app.get("/scrape", function(req, res) {
  // First, we grab the body of the html with request
  axios.get("http://www.echojs.com/").then(function(response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);

    // Now, we grab every h2 within an article tag, and do the following:
    $("article h2").each(function(i, element) {
      // Save an empty result object
      var result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this)
        .children("a")
        .text();
      result.link = $(this)
        .children("a")
        .attr("href");

      // Create a new Article using the `result` object built from scraping
      db.Article.create(result)
        .then(function(dbArticle) {
          // View the added result in the console
          console.log(dbArticle);
        })
        .catch(function(err) {
          // If an error occurred, send it to the client
          return res.json(err);
        });
    });

    // If we were able to successfully scrape and save an Article, send a message to the client
    res.send("Scrape Complete");
  });
});

// Route for getting all Articles from the db
app.get("/articles", function(req, res) {
  // TODO: Finish the route so it grabs all of the articles
  db.Article.find({})
  .then(function(dbArticle) {
    res.json(dbArticle);
  })
  .catch(function(err) {
    res.json(err);
  });
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {
  // TODO
  // ====
  // Finish the route so it finds one article using the req.params.id,
  db.Article.findOne({ _id: req.params.id })
  // and run the populate method with "note",
  .populate("note")
  // then responds with the article with the note included
  .then(function(dbArticle) {
    res.json(dbArticle);
  })
  .catch(function(err) {
    res.json(err);
  });
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function(req, res) {
  // TODO
  // ====
  // save the new note that gets posted to the Notes collection
  db.Note.create(req.body)
  // then find an article from the req.params.id
  .then(function(dbNote) {
    return db.Article.findOneAndUpdate({ _id: req.param.id }, { note: dbNote._id}, {new: true});
  })
  // and update it's "note" property with the _id of the new note
  .then(function(dbArticle) {
    res.json(dbArticle);
  })
  .catch(function(err) {
    res.json(err);
  });
});

var port = process.env.PORT || 8080;
// start server
app.listen(port, function() {
  console.log("App running on port "+port);
});
 