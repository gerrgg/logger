# Testing React apps

Tests will be implemented with the same Jest testing library developed by Facebook that was used in the previous part. Jest is actually configured by default to applications created with create-react-app.

In addition to Jest, we also need another testing library that will help us render components for testing purposes. The current best option for this is react-testing-library which has seen rapid growth in popularity in recent times.

Let's install the library with the command:

```
npm install --save-dev @testing-library/react @testing-library/jest-dom
```

Let's first write tests for the component that is responsible for rendering a note:

```
const Note = ({ note, toggleImportance }) => {
  const label = note.important
    ? 'make not important'
    : 'make important'

  return (
    <li className='note'>      {note.content}
      <button onClick={toggleImportance}>{label}</button>
    </li>
  )
}
```

Notice that the li element has the CSS classname note, that is used to access the component in our tests.

## Rendering the component for tests

We will write our test in the src/components/Note.test.js file, which is in the same directory as the component itself.

The first test verifies that the component renders the contents of the note:

```
import React from 'react'
import '@testing-library/jest-dom/extend-expect'
import { render } from '@testing-library/react'
import Note from './Note'

test('renders content', () => {
  const note = {
    content: 'Component testing is done with react-testing-library',
    important: true
  }

  const component = render(
    <Note note={note} />
  )

  expect(component.container).toHaveTextContent(
    'Component testing is done with react-testing-library'
  )
})
```

After the initial configuration, the test renders the component with the render method provided by the react-testing-library:

```
const component = render(
  <Note note={note} />
)
```

Normally React components are rendered to the DOM. The render method we used renders the components in a format that is suitable for tests without rendering them to the DOM.

render returns an object that has several properties. One of the properties is called container, and it contains all of the HTML rendered by the component.

In the expectation, we verify that the component renders the correct text, which in this case is the content of the note:

```
expect(component.container).toHaveTextContent(
  'Component testing is done with react-testing-library'
)
```

## Running Tests

Create-react-app configures tests to be run in watch mode by default.

If you want to run tests "normally", you can do so with the command:

```
CI=true npm test
```

Instructions for installing Watchman on different operating systems can be found on the official Watchman website: https://facebook.github.io/watchman/

## Searching for content in a component

The react-testing-library package offers many different ways of investigating the content of the component being tested. Let's slightly expand our test:

```
test('renders content', () => {
  const note = {
    content: 'Component testing is done with react-testing-library',
    important: true
  }

  const component = render(
    <Note note={note} />
  )

  // method 1
  expect(component.container).toHaveTextContent(
    'Component testing is done with react-testing-library'
  )

  // method 2
  const element = component.getByText(
    'Component testing is done with react-testing-library'
  )
  expect(element).toBeDefined()

  // method 3
  const div = component.container.querySelector('.note')
  expect(div).toHaveTextContent(
    'Component testing is done with react-testing-library'
  )
})
```

## Debugging tests

We typically run into many different kinds of problems when writing our tests.

The object returned by the render method has a debug method that can be used to print the HTML rendered by the component to the console. Let's try this out by making the following changes to our code:

```
test('renders content', () => {
  const note = {
    content: 'Component testing is done with react-testing-library',
    important: true
  }

  const component = render(
    <Note note={note} />
  )

  component.debug()
  // ...
})
```

It is also possible to search for a smaller part of the component and print its HTML code. In order to do this, we need the prettyDOM method that can be imported from the @testing-library/dom package that is automatically installed with react-testing-library:

```
import React from 'react'
import '@testing-library/jest-dom/extend-expect'
import { render } from '@testing-library/react'
import { prettyDOM } from '@testing-library/dom'import Note from './Note'

test('renders content', () => {
  const note = {
    content: 'Component testing is done with react-testing-library',
    important: true
  }

  const component = render(
    <Note note={note} />
  )
  const li = component.container.querySelector('li')

  console.log(prettyDOM(li))})
```

We used the selector to find the li element inside of the component, and printed its HTML to the console:

## Clicking buttons in tests

In addition to displaying content, the Note component also makes sure that when the button associated with the note is pressed, the toggleImportance event handler function gets called.

Testing this functionality can be accomplished like this:

```
import React from 'react'
import { render, fireEvent } from '@testing-library/react'import { prettyDOM } from '@testing-library/dom'
import Note from './Note'

// ...

test('clicking the button calls event handler once', () => {
  const note = {
    content: 'Component testing is done with react-testing-library',
    important: true
  }

  const mockHandler = jest.fn()

  const component = render(
    <Note note={note} toggleImportance={mockHandler} />
  )

  const button = component.getByText('make not important')
  fireEvent.click(button)

  expect(mockHandler.mock.calls).toHaveLength(1)
})
```

There's a few interesting things related to this test. The event handler is mock function defined with Jest:

```
const mockHandler = jest.fn()
```

The test finds the button based on the text from the rendered component and clicks the element:

```
const button = component.getByText('make not important')
fireEvent.click(button)
```

The expectation of the test verifies that the mock function has been called exactly once.

```
expect(mockHandler.mock.calls).toHaveLength(1)
```

Mock objects and functions are commonly used stub components in testing that are used for replacing dependencies of the components being tested. Mocks make it possible to return hardcoded responses, and to verify the number of times the mock functions are called and with what parameters.

In our example, the mock function is a perfect choice since it can be easily used for verifying that the method gets called exactly once.

## Tests for the Togglable component

Let's write a few tests for the Togglable component. Let's add the togglableContent CSS classname to the div that returns the child components.

```
const Togglable = React.forwardRef((props, ref) => {
  // ...

  return (
    <div>
      <div style={hideWhenVisible}>
        <button onClick={toggleVisibility}>
          {props.buttonLabel}
        </button>
      </div>
      <div style={showWhenVisible} className="togglableContent">
        {props.children}
        <button onClick={toggleVisibility}>cancel</button>
      </div>
    </div>
  )
})
```

The tests are shown below:

```
import React from 'react'
import '@testing-library/jest-dom/extend-expect'
import { render, fireEvent } from '@testing-library/react'
import Togglable from './Togglable'

describe('<Togglable />', () => {
  let component

  beforeEach(() => {
    component = render(
      <Togglable buttonLabel="show...">
        <div className="testDiv" />
      </Togglable>
    )
  })

  test('renders its children', () => {
    expect(
      component.container.querySelector('.testDiv')
    ).not.toBe(null)
  })

  test('at start the children are not displayed', () => {
    const div = component.container.querySelector('.togglableContent')

    expect(div).toHaveStyle('display: none')
  })

  test('after clicking the button, children are displayed', () => {
    const button = component.getByText('show...')
    fireEvent.click(button)

    const div = component.container.querySelector('.togglableContent')
    expect(div).not.toHaveStyle('display: none')
  })

})
```

It's not a wise move to depend on the order of the buttons in the component, and it is recommended to find the elements based on their text:

```
test('toggled content can be closed', () => {
  const button = component.getByText('show...')
  fireEvent.click(button)

  const closeButton = component.getByText('cancel')
  fireEvent.click(closeButton)

  const div = component.container.querySelector('.togglableContent')
  expect(div).toHaveStyle('display: none')
})
```

The getByText method that we used is just one of the many queries react-testing-library offers.

## Testing Forms

The form works by calling the createNote function it received as props with the details of the new note.

The test is as follows:

```
import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import NoteForm from './NoteForm'

test('<NoteForm /> updates parent state and calls onSubmit', () => {
  const createNote = jest.fn()

  const component = render(
    <NoteForm createNote={createNote} />
  )

  const input = component.container.querySelector('input')
  const form = component.container.querySelector('form')

  fireEvent.change(input, {
    target: { value: 'testing of forms could be easier' }
  })
  fireEvent.submit(form)

  expect(createNote.mock.calls).toHaveLength(1)
  expect(createNote.mock.calls[0][0].content).toBe('testing of forms could be easier' )
})
```

We can simulate writing to input fields by creating a change event to them, and defining an object, which contains the text 'written' to the field.

The form is sent by simulating the submit event to the form.

The first test expectation ensures, that submitting the form calls the createNote method. The second expectation checks, that the event handler is called with the right parameters - that a note with the correct content is created when the form is filled.

## Test coverage

We can easily find out the coverage of our tests by running them with the command.

```
CI=true npm test -- --coverage
```

<img src="https://fullstackopen.com/static/16f2c3fc4d647dd6810c2952cb90f20d/5a190/18ea.png">
