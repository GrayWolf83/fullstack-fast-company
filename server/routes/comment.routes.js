const express = require('express')
const router = express.Router({ mergeParams: true })
const auth = require('../middleware/auth.middleware')
const Comment = require('../models/Comment')

router
	.route('/')
	.get(auth, async (req, res) => {
		try {
			const { orderBy, equalTo } = req.query

			const list = await Comment.find({ [orderBy]: equalTo })

			res.status(200).send(list)
		} catch (e) {
			res.status(500).json({ message: 'На сервере произошла ошибка!' })
		}
	})
	.post(auth, async (req, res) => {
		try {
			const newComment = await Comment.create({
				...req.body,
				userId: req.user._id,
			})

			res.status(201).send(newComment)
		} catch (error) {}
	})

router.delete('/:commentId', auth, async (req, res) => {
	try {
		const { commentId } = req.params

		const removedCommend = await Comment.findById(commentId)

		if (removedCommend.userId.toString() === req.user._id) {
			await removedCommend.remove()

			return res.status(200).send(null)
		} else {
			res.status(401).json({ message: 'Unautorized' })
		}
	} catch (e) {
		res.status(500).json({ message: 'На сервере произошла ошибка!' })
	}
})

module.exports = router
