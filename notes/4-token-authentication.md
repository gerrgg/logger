# Token Authentication

Users must be able to log into our application, and when a user is logged in, their user information must automatically be attached to any new notes they create.

We will now implement support for token based authentication to the backend.

The principles of token based authentication are depicted in the following sequence diagram:

<img src="https://fullstackopen.com/static/8b2839fe97680c325df6647121af66c3/5a190/16e.png" />

- User starts by logging in using a login form implemented with React
  - We will add the login form to the frontend in part 5
- This causes the React code to send the username and the password to the - server address /api/login as a HTTP POST request.

- If the username and the password are correct, the server generates a token which somehow identifies the logged in user.

  - The token is signed digitally, making it impossible to falsify (with cryptographic means)

- The backend responds with a status code indicating the operation was successful, and returns the token with the response.
- The browser saves the token, for example to the state of a React application.
- When the user creates a new note (or does some other operation requiring identification), the React code sends the token to the server with the request.
- The server uses the token to identify the user

## jsonwebtoken

Let's first implement the functionality for logging in. Install the jsonwebtoken library, which allows us to generate JSON web tokens.

```
npm install jsonwebtoken
```

The code for login functionality goes to the file controllers/login.js.

```
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const loginRouter = require('express').Router()
const User = require('../models/user')

loginRouter.post('/', async (request, response) => {
  const body = request.body

  const user = await User.findOne({ username: body.username })
  const passwordCorrect = user === null
    ? false
    : await bcrypt.compare(body.password, user.passwordHash)

  if (!(user && passwordCorrect)) {
    return response.status(401).json({
      error: 'invalid username or password'
    })
  }

  const userForToken = {
    username: user.username,
    id: user._id,
  }

  const token = jwt.sign(userForToken, process.env.SECRET)

  response
    .status(200)
    .send({ token, username: user.username, name: user.name })
})

module.exports = loginRouter
```

The code starts by searching for the user from the database by the username attached to the request. Next, it checks the password, also attached to the request. Because the passwords themselves are not saved to the database, but hashes calculated from the passwords, the bcrypt.compare method is used to check if the password is correct:

```
await bcrypt.compare(body.password, user.passwordHash)
```

If the user is not found, or the password is incorrect, the request is responded to with the status code 401 unauthorized. The reason for the failure is explained in the response body.

If the password is correct, a token is created with the method jwt.sign. The token contains the username and the user id in a digitally signed form.

```
const userForToken = {
  username: user.username,
  id: user._id,
}

const token = jwt.sign(userForToken, process.env.SECRET)
```

The token has been digitally signed using a string from the environment variable SECRET as the secret. The digital signature ensures that only parties who know the secret can generate a valid token. **The value for the environment variable must be set in the .env file.**

A successful request is responded to with the status code 200 OK. The generated token and the username of the user are sent back in the response body.

Now the code for login just has to be added to the application by adding the new router to app.js.

```
const loginRouter = require('./controllers/login')

//...

app.use('/api/login', loginRouter)
```

## Limiting creating new notes to logged in users

Let's change creating new notes so that it is only possible if the post request has a valid token attached. The note is then saved to the notes list of the user identified by the token.

There are several ways of sending the token from the browser to the server. We will use the Authorization header. The header also tells which authentication scheme is used. This can be necessary if the server offers multiple ways to authenticate. Identifying the scheme tells the server how the attached credentials should be interpreted.

The Bearer scheme is suitable to our needs.

In practice, this means that if the token is for example, the string eyJhbGciOiJIUzI1NiIsInR5c2VybmFtZSI6Im1sdXVra2FpIiwiaW, the Authorization header will have the value:

```
Bearer eyJhbGciOiJIUzI1NiIsInR5c2VybmFtZSI6Im1sdXVra2FpIiwiaW
```

Creating new notes will change like so:

```
const jwt = require('jsonwebtoken')
// ...
const getTokenFrom = request => {
  const authorization = request.get('authorization')

  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    return authorization.substring(7)
  }

  return null
}

notesRouter.post('/', async (request, response) => {
  const body = request.body
  const token = getTokenFrom(request)
  const decodedToken = jwt.verify(token, process.env.SECRET)
  if (!token || !decodedToken.id) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }

  const user = await User.findById(decodedToken.id)

  const note = new Note({
    content: body.content,
    important: body.important === undefined ? false : body.important,
    date: new Date(),
    user: user._id
  })

  const savedNote = await note.save()
  user.notes = user.notes.concat(savedNote._id)
  await user.save()

  response.json(savedNote)
})
```
