const fs = require('fs')
const path = require('path')
const markdownParser = require('./markdownParser')

const getMdFiles = dir =>
  fs.readdirSync(dir).reduce((files, file) => {
    const name = path.join(dir, file)
    const isDirectory = fs.statSync(name).isDirectory()
    if (isDirectory) {
      return [...files, ...getMdFiles(name)]
    } else {
      const mdObject = markdownParser(fs.readFileSync('./' + name, 'utf8'))
      return [
        ...files,
        {
          name,
          routePath: name.replace('docs', '').replace(/\.[^/.]+$/, ''),
          path: name.replace('docs/', '').replace(/\.[^/.]+$/, ''),
          ...mdObject,
          timestamp: new Date(mdObject.data.date || null).getTime()
        }
      ]
    }
  }, [])

const getPostLinkInfo = ({ name, routePath, path, data, timestamp }) => ({
  name,
  routePath,
  path,
  data,
  timestamp
})

const docs = getMdFiles('./docs')

const getContent = () => (process.env.NODE_ENV === 'production' ? docs : getMdFiles('./docs'))

const getPosts = () =>
  getContent()
    .filter(page => page.path.startsWith('posts/'))
    .sort((a, b) => (a.timestamp > b.timestamp ? -1 : 1))
    .map((post, index, posts) => ({
      ...post,
      prevPost: index - 1 >= 0 ? getPostLinkInfo(posts[index - 1]) : false,
      nextPost: index + 1 < posts.length ? getPostLinkInfo(posts[index + 1]) : false
    }))

const getPostsRoutes = () => getPosts().map(post => getPostLinkInfo(post))

const getTagsCount = () =>
  getPosts().reduce((acc, cur) => {
    ;(cur.data.tags || []).forEach(tag => {
      acc[tag] = (acc[tag] || 0) + 1
    })
    return acc
  }, {})

const getTagsRoutes = () => Object.keys(getTagsCount()).map(tag => `/tags/${tag}`)

const getPostsByTag = tag =>
  getPosts()
    .filter(post => (post.data.tags || []).includes(tag))
    .map(post => getPostLinkInfo(post))

const getRecentPostsRoutes = post =>
  getPostsRoutes()
    .filter(routePath => routePath !== post.routePath)
    .slice(0, 3)

const getAllRoutes = () => [...getPostsRoutes().map(postLinkInfo => postLinkInfo.routePath), ...getTagsRoutes()]

module.exports = {
  getMdFiles,
  getContent,
  getPosts,
  getPostsRoutes,
  getTagsCount,
  getTagsRoutes,
  getPostsByTag,
  getRecentPostsRoutes,
  getAllRoutes
}