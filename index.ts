import express from 'express'
import Database from 'better-sqlite3'
import cors from 'cors'

const app = express()
app.use(cors())
app.use(express.json())

const db = new Database('./data.db', {
  verbose: console.log
})

const getAllAlbums = db.prepare(`
SELECT * FROM albums;
`)

const getAlbumById = db.prepare(`
SELECT * FROM albums WHERE id = ?;
`)

// COMPLEX JOIN WITH JSON FUNCTIONS
// JUST FOR FUN, NO NEED TO KNOW THIS
// const getAllAlbums = db.prepare(`
// SELECT albums.*, artists.name as 'artistName', artists.image as 'artistImage' FROM albums
// JOIN artists
// ON artists.id = albums.artistId;
// `)

const getAllArtists = db.prepare(`
SELECT * FROM artists;
`)

const getArtistById = db.prepare(`
SELECT * FROM artists WHERE id = ?;
`)

const getAlbumsByArtistId = db.prepare(`
SELECT * FROM albums WHERE artistId = ?;
`)

const createArtist = db.prepare(`
INSERT INTO artists (name, image) VALUES (?, ?);
`)

const createAlbum = db.prepare(`
INSERT INTO albums (name, cover, artistId) VALUES (?, ?, ?);
`)

const deleteArtist = db.prepare(`
DELETE FROM artists WHERE id = ?;
`)

const deleteArtistAlbums = db.prepare(`
DELETE FROM albums WHERE artistId = ?;
`)

// const test = db.prepare(`
// SELECT artists.*, json_group_array(json_object('id', albums.id, 'name', albums.name, 'cover', albums.cover)) as albums
// FROM artists
// JOIN albums
// ON albums.artistId = artists.id
// GROUP BY artists.id;
// `)

app.get('/albums', (req, res) => {
  const albums = getAllAlbums.all()

  for (const album of albums) {
    const artist = getArtistById.get(album.artistId)
    album.artist = artist
  }

  res.send(albums)
})

app.get('/artists', (req, res) => {
  const artists = getAllArtists.all()

  // for (const artist of artists) {
  //   const albums = getAlbumsByArtistId.all(artist.id)
  //   artist.albums = albums
  // }

  res.send(artists)
})

app.get('/artists/:id', (req, res) => {
  const id = req.params.id
  const artist = getArtistById.get(id)

  if (artist) {
    const albums = getAlbumsByArtistId.all(artist.id)
    artist.albums = albums
    res.send(artist)
  } else {
    res.status(404).send({ error: 'Artist not found.' })
  }
})

app.post('/artists', (req, res) => {
  // creating an artist is still the same as last week
  const { name, image } = req.body
  const info = createArtist.run(name, image)

  // const errors = []

  // if (typeof name !== 'string') errors.push()

  if (info.changes > 0) {
    const artist = getArtistById.get(info.lastInsertRowid)
    res.send(artist)
  } else {
    res.send({ error: 'Something went wrong.' })
  }
})

app.post('/albums', (req, res) => {
  // to create an album, we need to know the artistId
  const { name, cover, artistId } = req.body
  const info = createAlbum.run(name, cover, artistId)

  // const errors = []

  // if (typeof name !== 'string') errors.push()

  if (info.changes > 0) {
    const album = getAlbumById.get(info.lastInsertRowid)
    res.send(album)
  } else {
    res.send({ error: 'Something went wrong.' })
  }
})

app.delete('/artists/:id', (req, res) => {
  const id = req.params.id

  deleteArtistAlbums.run(id)
  const info = deleteArtist.run(id)

  if (info.changes === 0) {
    res.status(404).send({ error: 'Artist not found.' })
  } else {
    res.send({ message: 'Artist deleted.' })
  }
})

// app.get('/test', (req, res) => {
//   const testData = test.all()
//   for (const data of testData) {
//     data.albums = JSON.parse(data.albums)
//   }
//   res.send(testData)
// })

app.listen(4000, () => console.log(`Listening on: http://localhost:4000`))
