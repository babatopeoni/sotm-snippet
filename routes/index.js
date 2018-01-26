var express = require('express');
var router = express.Router();
var request = require('request-promise');
var moment = require('moment');
var Bluebird = require('bluebird');

/* GET home page. */
router.get('/', function(req, res, next) {

  var spheres_of_grace = [];
  var leverage_posts = [];

  /* Maximum results count for this type youtube api request is 50 */
  var spheres_of_grace_request = request({
    uri: 'https://www.googleapis.com/youtube/v3/search?key=AIzaSyAVTeqJJFRLLs7LnWRyYZtnMqSWaN11YCo&channelId=UC1Vi6qDCVlaTiAwjTwOlUAw&part=snippet,id&order=date&maxResults=20',
    json: true
  });

  var leverage_posts_request = request({
    uri: 'http://leveragedevotional.org?json=get_recent_posts&count=20',
    json: true
  });

  Bluebird.all([spheres_of_grace_request, leverage_posts_request])
    .spread(function (spheres_of_grace_response, leverage_posts_response) {
      
      //Process spheres of grace
      spheres_of_grace_response.items.forEach(element => {

        spheres_of_grace.push({
          'id': element.etag,
          'title': element.snippet.title,
          'description': element.snippet.description,
          'videoId': element.id.videoId,
          'thumbnails': element.snippet.thumbnails,
          'publishedAt': moment(element.snippet.publishedAt).format('DD-MM-YYYY hh:mm:ss'),
          'type': 'SPHERES_OF_GRACE'
        });

      });


      leverage_posts_response.posts.forEach(element => {

        leverage_posts.push({
          'id': element.id,
          'title': element.title,
          'excerpt': element.excerpt,
          'content': element.content,
          'thumbnails': element.thumbnail_images,
          'publishedAt': moment(element.date).format('DD-MM-YYYY hh:mm:ss'),
          'type': 'LEVERAGE'
        });

      });

      var all = spheres_of_grace.concat( leverage_posts );
      all = all.sort( (a,b) => {
        return moment(a.publishedAt).isBefore(b.publishedAt);
      });

      res.json(all);

    })
    .catch(function (err) {
      
    });

  
  
});

module.exports = router;