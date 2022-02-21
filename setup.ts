import Database from 'better-sqlite3'

const db = new Database('./data.db', {
  verbose: console.log
})

const artists = [
  {
    name: 'Adriano',
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Adriano_2009.jpg/440px-Adriano_2009.jpg'
  },
  {
    name: 'Ed',
    image:
      'https://upload.wikimedia.org/wikipedia/commons/c/c1/Ed_Sheeran-6886_%28cropped%29.jpg'
  },
  {
    name: 'Rinor',
    image: 'https://i.scdn.co/image/ab6761610000f178560ff31c89e8d0b81a36b48d'
  },
  {
    name: 'Artiola',
    image: 'https://i.scdn.co/image/ab67616d0000b27366e9271251b6991868562876'
  }
]

const albums = [
  {
    name: 'A day at the opera',
    artistId: 1
  },
  {
    name: 'Por favor',
    artistId: 1
  },
  {
    name: 'Dem furries',
    artistId: 2
  },
  {
    name: 'Meow',
    artistId: 2
  },
  {
    name: 'Damn SQL',
    artistId: 3
  }
]

const dropArtists = db.prepare(`DROP TABLE IF EXISTS artists;`)
const dropAlbums = db.prepare(`DROP TABLE IF EXISTS albums;`)
dropAlbums.run()
dropArtists.run()

const createArtists = db.prepare(`
CREATE TABLE artists (
  id     INTEGER,
  name   TEXT NOT NULL,
  image  TEXT NOT NULL,
  PRIMARY KEY(id)
);
`)

const createAlbums = db.prepare(`
CREATE TABLE albums (
  id    	INTEGER,
  name  	TEXT NOT NULL,
  cover 	TEXT,
  artistId INTEGER NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY(artistId) REFERENCES artists(id)
);`)

createAlbums.run()
createArtists.run()

const createArtist = db.prepare(`
INSERT INTO artists (name, image) VALUES (?, ?);
`)

const createAlbum = db.prepare(`
INSERT INTO albums (name, cover, artistId) VALUES (?, ?, ?);
`)

for (const artist of artists) {
  createArtist.run(artist.name, artist.image)
}

for (const album of albums) {
  createAlbum.run(album.name, null, album.artistId)
}
