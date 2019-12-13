const express = require('express')
const BookmarksService = require('./bookmarks-service')

const BookmarksRouter = express.Router()
const jsonParser = express.json()

BookmarksRouter
  .route('/')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db')
    BookmarksService.getAllBookmarks(knexInstance)
      .then(bookmarks => {
        res.json(bookmarks)
      })
      .catch(next);
  })
  .post(jsonParser, (req, res, next) => {
    const { title, url, description, rating } = req.body;
    const newBookmark = { title, content, style };

    if(!title) {
        return res.status(400).json({
            error: {message: `Missing 'title' in request body`}
        });
    }

    if(!url){
        return res.status(400).json({
            error: {message: `Missing 'url' in request body`}
        });
    }

    BookmarksService.insertBookmark(
      req.app.get('db'),
      newBookmark
    )
      .then(bookmark => {
        res
          .status(201)
          .location(`/articles/${bookmark.id}`)
          .json(bookmark);
      })
      .catch(next);
  })

BookmarksRouter
  .route('/:bookmark_id')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db')
    BookmarksService.getById(knexInstance, req.params.bookmark_id)//bookmark id
      .then(bookmark => {
        if (!bookmark) {
          return res.status(404).json({
            error: { message: `Bookmark doesn't exist` }
          })
        }
        res.json(bookmark);
      })
      .catch(next);
  })

module.exports = BookmarksRouter;