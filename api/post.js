const querystring = require('querystring')
const { posts } = require('../utils/posts')

module.exports = function (req, res, next) {
  if (req.method === 'GET') {
    const post = posts.find(
      post =>
        post.name ===
        'content/' + querystring.parse(req._parsedOriginalUrl.query).key + '.md'
    )
    res.end(JSON.stringify(post))
  }
}
