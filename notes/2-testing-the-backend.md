# Testing the backend

We will now start writing tests for the backend. Since the backend does not contain any complicated logic, it doesn't make sense to write unit tests for it. The only potential thing we could unit test is the toJSON method that is used for formatting notes.

In some situations, it can be beneficial to implement some of the backend tests by mocking the database instead of using a real database. One library that could be used for this is mongo-mock.

Since our application's backend is still relatively simple, we will make the decision to test the entire application through its REST API, so that the database is also included. This kind of testing where multiple components of the system are being tested as a group, is called integration testing.

## Test Environment

In one of the previous chapters of the course material, we mentioned that when your backend server is running in Heroku, it is in production mode.

The convention in Node is to define the execution mode of the application with the NODE_ENV environment variable. In our current application, we only load the environment variables defined in the .env file if the application is not in production mode.

It is common practice to define separate modes for development and testing.

Next, let's change the scripts in our package.json so that when tests are run, NODE_ENV gets the value test:

```
{
  // ...
  "scripts": {
    "start": "NODE_ENV=production node index.js",    "dev": "NODE_ENV=development nodemon index.js",    "build:ui": "rm -rf build && cd ../../../2/luento/notes && npm run build && cp -r build ../../../3/luento/notes-backend",
    "deploy": "git push heroku master",
    "deploy:full": "npm run build:ui && git add . && git commit -m uibuild && git push && npm run deploy",
    "logs:prod": "heroku logs --tail",
    "lint": "eslint .",
    "test": "NODE_ENV=test jest --verbose --runInBand"  },
  // ...
}
```

**We also added the runInBand option to the npm script that executes the tests. This option will prevent Jest from running tests in parallel; we will discuss its significance once our tests start using the database.**

There is a slight issue in the way that we have specified the mode of the application in our scripts: it will not work on Windows. We can correct this by installing the cross-env package as a development dependency with the command:

```
npm install --save-dev cross-env
```

We can then achieve cross-platform compatibility by using the cross-env library in our npm scripts defined in package.json:

```
{
  // ...
  "scripts": {
    "start": "cross-env NODE_ENV=production node index.js",
    "dev": "cross-env NODE_ENV=development nodemon index.js",
    // ...
    "test": "cross-env NODE_ENV=test jest --verbose --runInBand",
  },
  // ...
}
```

It would be better to run our tests using a database that is installed and running in the developer's local machine. The optimal solution would be to have every test execution use its own separate database.

This is "relatively simple" to achieve by running Mongo in-memory or by using Docker containers. We will not complicate things and will instead continue to use the MongoDB Atlas database.

Let's make some changes to the module that defines the application's configuration:

```
require('dotenv').config()

const PORT = process.env.PORT

const MONGODB_URI = process.env.NODE_ENV === 'test'   ? process.env.TEST_MONGODB_URI  : process.env.MONGODB_URI
module.exports = {
  MONGODB_URI,
  PORT
}
```

The .env file has separate variables for the database addresses of the development and test databases:

```
MONGODB_URI=mongodb+srv://fullstack:secred@cluster0-ostce.mongodb.net/note-app?retryWrites=true
PORT=3001

TEST_MONGODB_URI=mongodb+srv://fullstack:secret@cluster0-ostce.mongodb.net/note-app-test?retryWrites=true
```

The config module that we have implemented slightly resembles the node-config package. Writing our own implementation is justified since our application is simple, and also because it teaches us valuable lessons.

## supertest

Let's use the [supertest](https://github.com/visionmedia/supertest) package to help us write our tests for testing the API.

We will install the package as a development dependency:

```
npm install --save-dev supertest
```

Let's write our first test in the tests/note_api.test.js file:

```
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')

const api = supertest(app)

test('notes are returned as json', async () => {
  await api
    .get('/api/notes')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

afterAll(() => {
  mongoose.connection.close()
})
```

The test imports the Express application from the app.js module and wraps it with the supertest function into a so-called superagent object. This object is assigned to the api variable and tests can use it for making HTTP requests to the backend.

Our test makes an HTTP GET request to the api/notes url and verifies that the request is responded to with the status code 200. The test also verifies that the Content-Type header is set to application/json, indicating that the data is in the desired format. (If you're not familiar with the RegEx syntax of /application\/json/, you can learn more here.)

The Async/await syntax can be used for writing asynchronous code with the appearance of synchronous code.

Once all the tests (there is currently only one) have finished running we have to close the database connection used by Mongoose. This can be easily achieved with the afterAll method:

```
afterAll(() => {
  mongoose.connection.close()
})
```

When running your tests you may run across the following console warning:

<img src="https://fullstackopen.com/static/7532c5c3fb1d0e3adfdb44969c26ab14/5a190/8.png">

If this occurs, let's follow the instructions and add a jest.config.js file at the root of the project with the following content:

```
module.exports = {
  testEnvironment: 'node'
}
```

Another error you may come across is your test takes longer than the default Jest test timeout of 5000 ms. This can be solved by adding a third parameter to the test function:

```
test('notes are returned as json', async () => {
  await api
    .get('/api/notes')
    .expect(200)
    .expect('Content-Type', /application\/json/)
}, 100000)
```

This third parameter sets the timeout to be 100000 ms. A long timeout ensures that our test won't fail due to the time it takes to run. (A long timeout may not be what you want for tests based on performance or speed, but this is fine for our example tests).

The documentation for supertest says the following:

    if the server is not already listening for connections then it is bound to an ephemeral port for you so there is no need to keep track of ports.

In other words, supertest takes care that the application being tested is started at the port that it uses internally.

Let's write a few more tests:

```
test('there are two notes', async () => {
  const response = await api.get('/api/notes')

  expect(response.body).toHaveLength(2)
})

test('the first note is about HTTP methods', async () => {
  const response = await api.get('/api/notes')

  expect(response.body[0].content).toBe('HTML is easy')
})
```

The benefit of using the async/await syntax is starting to become evident. Normally we would have to use callback functions to access the data returned by promises, but with the new syntax things are a lot more comfortable:

```
const response = await api.get('/api/notes')

// execution gets here only after the HTTP request is complete
// the result of HTTP request is saved in variable response
expect(response.body).toHaveLength(2)
```

The middleware that outputs information about the HTTP requests is obstructing the test execution output. Let us modify the logger so that it does not print to console in test mode:

```
const info = (...params) => {
  if (process.env.NODE_ENV !== 'test') {     console.log(...params)  }}

const error = (...params) => {
  if (process.env.NODE_ENV !== 'test') {     console.error(...params)  }}

module.exports = {
  info, error
}
```

## Initializing the database before tests

Testing appears to be easy and our tests are currently passing. However, our tests are bad as they are dependent on the state of the database (that happens to be correct in my test database). In order to make our tests more robust, we have to reset the database and generate the needed test data in a controlled manner before we run the tests.

Our tests are already using the afterAll function of Jest to close the connection to the database after the tests are finished executing. Jest offers many other functions that can be used for executing operations once before any test is run, or every time before a test is run.

Let's initialize the database before every test with the beforeEach function:

```
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const Note = require('../models/note')
const initialNotes = [  {    content: 'HTML is easy',    date: new Date(),    important: false,  },  {    content: 'Browser can execute only Javascript',    date: new Date(),    important: true,  },]beforeEach(async () => {  await Note.deleteMany({})  let noteObject = new Note(initialNotes[0])  await noteObject.save()  noteObject = new Note(initialNotes[1])  await noteObject.save()})// ...
```
