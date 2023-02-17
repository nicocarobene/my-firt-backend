require('dotenv').config()

const express = require('express')
const logger = require('./loggerMiddleware')
const app = express()
const cors = require('cors')

require('./mongo')

app.use(cors())
app.use(express.json())
app.use(logger)
const Note = require('./models/Note')

app.get('/', (request, response) => {
  response.send('<h1>Hello Word</h1>')
})

app.get('/api/notes', (request, response) => {
  Note.find({}).then((notes) => {
    response.json(notes)
  })
})

app.get('/api/notes/:id', (request, response, next) => {
  const { id } = request.params
  Note.findById(id)
    .then(note => {
      note ? response.json(note) : response.status(404).end()
    }).catch(error => {
      next(error)
    })
})

app.delete('/api/notes/:id', (request, response, next) => {
  const { id } = request.params
  Note.findByIdAndRemove(id)
    .then((result) => response.status(204).end())
    .catch((error) => next(error))
})

app.post('/api/notes', (request, response) => {
  const note = request.body
  if (!note || !note.content) {
    return response.status(400).json({
      error: 'note.content is missing'
    })
  }

  const newNote = new Note({
    content: note.content,
    date: new Date(),
    important: note.important !== 'undefined' ? note.important : false
  })
  newNote.save().then(saveNote => {
    response.json(saveNote)
  })
})

app.put('/api/notes/:id', (request, response, next) => {
  const { id } = request.params
  const note = request.body
  const newNoteInfo = {
    content: note.content,
    important: note.important
  }
  Note.findByIdAndUpdate(id, newNoteInfo, { new: true })
    .then(result => {
      response.json(result)
    })
})

app.use((error, request, response, next) => {
  console.error(error)
  console.log(error.name)
  if (error.name === 'CastError') {
    response.status(400).send({ error: 'id used us malformed' })
  } else {
    response.status(500).end()
  }
})

app.use((request, response, next) => {
  response.status(404).json({
    error: 'not found'
  }); console.log(request.path)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
