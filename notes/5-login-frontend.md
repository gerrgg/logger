# Login in frontend

In the last two parts, we have mainly concentrated on the backend, and the frontend does not yet support the user management we implemented to the backend in part 4.

At the moment the frontend shows existing notes, and lets users change the state of a note from important to not important and vice versa. New notes cannot be added anymore because of the changes made to the backend in part 4: the backend now expects that a token verifying a user's identity is sent with the new note.

We'll now implement a part of the required user management functionality in the frontend. Let's begin with user login. Throughout this part we will assume that new users will not be added from the frontend.

## Handling Login

A login form has now been added to the top of the page. The form for adding new notes has also been moved to the bottom of the list of notes.

<img src="https://fullstackopen.com/static/f735fe7db5ad5bbc1413d3ff617c6daa/5a190/1e.png">

The code of the App component now looks as follows:

```
const App = () => {
  const [notes, setNotes] = useState([])
  const [newNote, setNewNote] = useState('')
  const [showAll, setShowAll] = useState(true)
  const [errorMessage, setErrorMessage] = useState(null)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  useEffect(() => {
    noteService
      .getAll().then(initialNotes => {
        setNotes(initialNotes)
      })
  }, [])

  // ...

  const handleLogin = (event) => {
    event.preventDefault()
    console.log('logging in with', username, password)
  }


return(
  <Form handleLogin={handleLogin}>
  ...
  </Form>
)

  // ...


```

The login form is handled the same way we handled forms in part 2. The app state has fields for username and password to store the data from the form. The form fields have event handlers, which synchronize changes in the field to the state of the App component. The event handlers are simple: An object is given to them as a parameter, and they destructure the field target from the object and save its value to the state.

### Handle Login

The method handleLogin, which is responsible for handling the data in the form, is yet to be implemented.

Logging in is done by sending an HTTP POST request to server address api/login. Let's separate the code responsible for this request to its own module, to file services/login.js.

We'll use async/await syntax instead of promises for the HTTP request:

```
import axios from 'axios'
const baseUrl = '/api/login'

const login = async credentials => {
  const response = await axios.post(baseUrl, credentials)
  return response.data
}

export default { login }
```

The method for handling the login can be implemented as follows:

import loginService from './services/login'

const App = () => {
// ...
const [username, setUsername] = useState('')
const [password, setPassword] = useState('')
const [user, setUser] = useState(null)
const handleLogin = async (event) => {
event.preventDefault()

    try {
      const user = await loginService.login({
        username, password,
      })
      setUser(user)
      setUsername('')
      setPassword('')
    } catch (exception) {
      setErrorMessage('Wrong credentials')
      setTimeout(() => {
        setErrorMessage(null)
        }, 5000)
      }}

// ...
}

If the login is successful, the form fields are emptied and the server response (including a token and the user details) is saved to the user field of the application's state.

If the login fails, or running the function loginService.login results in an error, the user is notified.

The user is not notified about a successful login in any way. Let's modify the application to show the login form only if the user is not logged-in so when user === null. The form for adding new notes is shown only if the user is logged-in, so user contains the user details.

Let's add two helper functions to the App component for generating the forms:

```
const App = () => {
  // ...

  const loginForm = () => (
    <form onSubmit={handleLogin}>
      <div>
        username
          <input
          type="text"
          value={username}
          name="Username"
          onChange={({ target }) => setUsername(target.value)}
        />
      </div>
      <div>
        password
          <input
          type="password"
          value={password}
          name="Password"
          onChange={({ target }) => setPassword(target.value)}
        />
      </div>
      <button type="submit">login</button>
    </form>
  )

  const noteForm = () => (
    <form onSubmit={addNote}>
      <input
        value={newNote}
        onChange={handleNoteChange}
      />
      <button type="submit">save</button>
    </form>
  )

  return (
    // ...
  )
}
```

and conditionally render them:

```
const App = () => {
  // ...

  const loginForm = () => (
    // ...
  )

  const noteForm = () => (
    // ...
  )

  return (
  <div>
    <h1>Notes</h1>

    <Notification message={errorMessage} />

    {user === null ?
      loginForm() :
      <div>
        <p>{user.name} logged-in</p>
        {noteForm()}
      </div>
    }

    <h2>Notes</h2>

    // ...

  </div>
)
}
```

The solution isn't perfect, but we'll leave it for now.

Our main component App is at the moment way too large. The changes we did now are a clear sign that the forms should be refactored into their own components. However, we will leave that for an optional exercise.

## Creating new notes

The token returned with a successful login is saved to the application's state - the user's field token:

```
const handleLogin = async (event) => {
  event.preventDefault()
  try {
    const user = await loginService.login({
      username, password,
    })

    setUser(user)
    setUsername('')
    setPassword('')
  } catch (exception) {
    // ...
  }
}
```

Let's fix creating new notes so it works with the backend. This means adding the token of the logged-in user to the Authorization header of the HTTP request.

The noteService module changes like so:

```
import axios from 'axios'
const baseUrl = '/api/notes'

let token = null
const setToken = newToken => {
  token = `bearer ${newToken}`
}
const getAll = () => {
  const request = axios.get(baseUrl)
  return request.then(response => response.data)
}

const create = async newObject => {
  const config = {
    headers: { Authorization: token },
  }

  const response = await axios.post(baseUrl, newObject, config)
  return response.data
}

const update = (id, newObject) => {
  const request = axios.put(`${ baseUrl } /${id}`, newObject)
  return request.then(response => response.data)
}

export default { getAll, create, update, setToken }

```

The noteService module contains a private variable token. Its value can be changed with a function setToken, which is exported by the module. create, now with async/await syntax, sets the token to the Authorization header. The header is given to axios as the third parameter of the post method.

The event handler responsible for login must be changed to call the method noteService.setToken(user.token) with a successful login:

```
const handleLogin = async (event) => {
  event.preventDefault()
  try {
    const user = await loginService.login({
      username, password,
    })

    noteService.setToken(user.token)
    setUser(user)
    setUsername('')
    setPassword('')
  } catch (exception) {
    // ...
  }
}
```

And now adding new notes works again!

## Saving the token to the browser's local storage

Our application has a flaw: when the page is rerendered, information of the user's login disappears. This also slows down development. For example when we test creating new notes, we have to login again every single time.

This problem is easily solved by saving the login details to local storage. Local Storage is a key-value database in the browser.

It is very easy to use. A value corresponding to a certain key is saved to the database with method setItem. For example:

```
window.localStorage.setItem('name', 'juha tauriainen')
```

saves the string given as the second parameter as the value of key name.

The value of a key can be found with method getItem:

```
window.localStorage.getItem('name')
```

Values in the local storage are persisted even when the page is rerendered. The storage is origin-specific so each web application has its own storage.

Let's extend our application so that it saves the details of a logged-in user to the local storage.

Values saved to the storage are DOMstrings, so we cannot save a JavaScript object as is. The object has to be parsed to JSON first, with the method JSON.stringify. Correspondingly, when a JSON object is read from the local storage, it has to be parsed back to JavaScript with JSON.parse.

Changes to the login method are as follows:

```
  const handleLogin = async (event) => {
    event.preventDefault()
    try {
      const user = await loginService.login({
        username, password,
      })

      window.localStorage.setItem(
        'loggedNoteappUser', JSON.stringify(user)
        )

      noteService.setToken(user.token)
      setUser(user)
      setUsername('')
      setPassword('')
    } catch (exception) {
      // ...
    }
  }
```

The details of a logged-in user are now saved to the local storage, and they can be viewed on the console (by typing window.localStorage to the console):

The right way to do this is with an effect hook: a mechanism we first encountered in part 2, and used to fetch notes from the server.

We can have multiple effect hooks, so let's create a second one to handle the first loading of the page:

```
const App = () => {
  const [notes, setNotes] = useState([])
  const [newNote, setNewNote] = useState('')
  const [showAll, setShowAll] = useState(true)
  const [errorMessage, setErrorMessage] = useState(null)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)

  useEffect(() => {
    noteService
      .getAll().then(initialNotes => {
        setNotes(initialNotes)
      })
  }, [])

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedNoteappUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
      noteService.setToken(user.token)
    }
  }, [])
  // ...
}
```

**The empty array as the parameter of the effect ensures that the effect is executed only when the component is rendered for the first time.**

Now a user stays logged-in in the application forever. We should probably add a logout functionality which removes the login details from the local storage. We will however leave it for an exercise.

It's possible to log out a user using the console, and that is enough for now. You can log out with the command:

```
window.localStorage.removeItem('loggedNoteappUser')
```

or with the command which empties localstorage completely:

```
window.localStorage.clear()
```

Current application code can be found on Github, branch part5-3.
