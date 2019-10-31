'use strict';

var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser')
var dns = require('dns')

var cors = require('cors');

var app = express();

// Basic Configuration
var port = process.env.PORT || 3000;

/** this project needs a db !! **/

mongoose.connect('mongodb+srv://admin:admin@cluster0-u8imk.mongodb.net/test?retryWrites=true&w=majority', {useNewUrlParser: true, useUnifiedTopology: true});

app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here

app.use(bodyParser.urlencoded({extended: false}))

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});


// your first API endpoint...
var Schema = mongoose.Schema
var Model = mongoose.model

var urlSchema = new Schema({
  original: {
    type: String,
    required: true
  },
  short: Number
})

var Url = Model('Url', urlSchema)

app.post('/api/shorturl/new', (req, res) => {
  var url = req.body.url.replace(/^https?:\/\//i, '')

  dns.lookup(url, (err, address, family) => {
    if(err) {
      res.json({error: 'invalid URL'})
    }
    else{
      var result = new Url({original: req.body.url})
      result.save()
      res.json({
        original_url: result.original,
        short_url: result.id
      })
    }
  })
})

app.get('/api/shorturl/:id', (req, res) => {
  Url.findById(req.params.id, (err, url) => {
    if(err) { return err }
    else {
      res.redirect(url.original)
     }
  })
})


app.listen(port, function () {
  console.log('Node.js listening ...');
});
