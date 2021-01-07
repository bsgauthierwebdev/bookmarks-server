const express = require('express')
const {v4: uuid} = require('uuid')
const {isWebUri} = require('valid-url')
const logger = require('../logger')
const store = require('../store')

const bookmarksRouter = express.Router()
const bodyParser = express.json()

bookmarksRouter
    .route('/bookmarks')
    .get((req, res) => {
        res.json(store.booksmarks)
    })
    .post(bodyParser, (req, res) => {
        for (const field of ['title', 'url', 'rating']) {
            if (!req.body[field]) {
                logger.error(`${field} is required`)
                return res
                    .status(400)
                    .send(`${field} is required`)
            }
        }
        const {title, url, description, rating} = req.body

        if (!Number.isInteger(rating) || rating < 0 || rating > 5) {
            logger.error(`Invalid rating '${rating}' supplied`)
            return res
                .status(400)
                .send('Rating must be a number between 1 and 5')
        }

        if (!isWebUri(url)) {
            logger.error(`Invalid URL '${url}' supplied`)
            return res
                .status(400)
                .send('Must be a valid URL')
        }

        const bookmark = {
            id: uuid(),
            title,
            url,
            description,
            rating
        }

        store.bookmarks.push(bookmark)

        logger.info(`Bookmark with id ${bookmark.id} created`)
        res
            .status(201)
            .location(`http://localhost:8000/bookmarks/${bookmark.id}`)
            .json(bookmark)
    })

bookmarksRouter
    .route('/bookmarks/:bookmark_id')
    .get((req, res) => {
        const {bookmark_id} = req.params

        const bookmark = store.bookmarks.find(c => c.id == bookmark_id)

        if (!bookmark) {
            logger.error(`Bookmark id ${bookmark_id} not found.`)
            return res
                .status(404)
                .send('Bookmark Not Found')
        }

        res.json(bookmark)
    })

    .delete((req, res) => {
        const {bookmark_id} = req.params

        const bookmarkIndex = store.bookmarks.findIndex(b => b.id === bookmark_id)

        if (bookmarkIndex === -1) {
            logger.error(`Bookmark with id ${bookmark_id} not found.`)
            return res
                .status(404)
                .send('Bookmark not found')
        }

        store.bookmarks.splice(bookmarkIndex, 1)

        logger.info(`Bookmark with d ${bookmark_id} deleted.`)
        res
            .status(204)
            .end()
    })

    module.exports = bookmarksRouter