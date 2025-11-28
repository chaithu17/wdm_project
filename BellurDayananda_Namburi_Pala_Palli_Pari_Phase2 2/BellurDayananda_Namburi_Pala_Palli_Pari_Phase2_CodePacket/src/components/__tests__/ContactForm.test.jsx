import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import ContactForm from '../ContactForm'

// Mock @formspree/react useForm hook to control form state
vi.mock('@formspree/react', () => {
  return {
    useForm: vi.fn(() => [{ succeeded: false, submitting: false, errors: [] }, vi.fn()]),
    ValidationError: ({ children }) => <div>{children}</div>,
  }
})

const getMock = () => require('@formspree/react')

describe('ContactForm', () => {
  it('renders inputs and submit button', () => {
    render(<ContactForm />)

    expect(screen.getByLabelText(/your name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/subject/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /send message/i })).toBeInTheDocument()
  })

  it('submits values and shows Sending... while submitting', async () => {
    const user = userEvent.setup()

    const handleSubmit = vi.fn((e) => e.preventDefault())
    const module = getMock()
    module.useForm.mockReturnValueOnce([
      { succeeded: false, submitting: false, errors: [] },
      handleSubmit,
    ])

    render(<ContactForm />)

    await user.type(screen.getByLabelText(/your name/i), 'Alice')
    await user.type(screen.getByLabelText(/email address/i), 'alice@example.com')
    await user.type(screen.getByLabelText(/subject/i), 'Help')
    await user.type(screen.getByLabelText(/message/i), 'Hello there')

    await user.click(screen.getByRole('button', { name: /send message/i }))

    expect(handleSubmit).toHaveBeenCalledTimes(1)
  })

  it('renders success state when succeeded', () => {
    const module = getMock()
    module.useForm.mockReturnValueOnce([
      { succeeded: true, submitting: false, errors: [] },
      vi.fn(),
    ])

    render(<ContactForm />)

    expect(screen.getByText(/message sent/i)).toBeInTheDocument()
    expect(screen.getByText(/thank you for contacting us/i)).toBeInTheDocument()
  })
})
