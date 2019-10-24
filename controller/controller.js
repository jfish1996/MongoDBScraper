var express = require("express");
var path = require("path");

var axios = require("axios");
var cheerio = require("cheerio");

var Article = require("../models/Article");
var Note = require("../models/Comment");


module.exports = function(app) {

app.get("/", function(req,res){
  res.redirect("/index")
})  

// app.get('/scraper', function(req, res){
//     console.log("hit the route");
//     axios.get("https://www.theverge.com ").then(function(response){

//         var $ = cheerio.load(response.data);

//         console.log("this is the data ", $);

//     $(".c-entry-box--compact__title").each(function(i, element){

//         var result = {};

//        result.title = $(this).children("a").text();
//        result.link = $(this).children("a").attr("href");

//         Article.create(result)
//         .then(function(dbArticle) {
//             // View the added result in the console
//             console.log(dbArticle);
//           })
//           .catch(function(err) {
//             // If an error occurred, log it
//             console.log(err);
       
//       });
//       res.redirect('/');
//     })

//     })


// })

// app.get("/index",function(req, res){

//   Article.find({}).then(function(err, data){
//     if(err){
//       throw err
//     } else{
//       var artcl = { article: data}
//       res.render("index",artcl);
//     }
//   })
// })


app.get("/scrape", function(req, res) {
  //making my axios request
  axios.get("https://www.theverge.com ").then(function(response){
    //loasing the recived data into cheerio
    var $ = cheerio.load(response.data);
    //init titlesArray
    var titlesArray = [];

    $(".c-entry-box--compact__title").each(function(i, element) {
      var result = {};
//attaching data to our results object
      result.title = $(this)
        .children("a")
        .text();
      result.link = $(this)
        .children("a")
        .attr("href");
//setting up an if statment for edge cases of null characters or repeats
//if there is not missing feilds  
      if (result.title !== "" && result.link !== "") {
        //and if the titles array doesnt have the title already
        if (titlesArray.indexOf(result.title) == -1) {
          //push that title to the new titles array
          titlesArray.push(result.title);
          //now checking for repeats in the database
          Article.count({ title: result.title }, function(err, test) {
            //if no repeats 
            if (test === 0) {
              //new entry becomes a new article
              var entry = new Article(result);

              entry.create(function(err, doc) {
                if (err) {
                  console.log(err);
                } else {
                  console.log(doc);
                }
              });
            }
          });
        } else {
          console.log("Article already exists.");
        }
      } else {
        console.log("Not saved to DB, missing data");
      }
    });
    res.redirect("/");
  });
});

app.get("/index", function(req, res) {
  Article.find({})
    .sort({ _id: -1 })
    .exec(function(err, doc) {
      if (err) {
        console.log(err);
      } else {
        var artcl = { article: doc };
        res.render("index", artcl);
      }
    });
});


}