import { useId, useState } from 'react'

// One labelled input with an error message and, for passwords, a show/hide toggle.
function FormField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
  hint,
  autoComplete,
  placeholder,
  autoFocus,
  children,
}) {
  const id = useId()
  const [visible, setVisible] = useState(false)

  const isPassword = type === 'password'
  const inputType = isPassword && visible ? 'text' : type
  const messageId = error ? `${id}-error` : hint ? `${id}-hint` : undefined

  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>

      <div className="input-wrap">
        <input
          id={id}
          name={name}
          type={inputType}
          value={value}
          onChange={onChange}
          className={error ? 'input invalid' : 'input'}
          autoComplete={autoComplete}
          placeholder={placeholder}
          autoFocus={autoFocus}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={messageId}
        />

        {isPassword && (
          <button
            type="button"
            className="toggle-visibility"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? 'Hide password' : 'Show password'}
          >
            {visible ? 'Hide' : 'Show'}
          </button>
        )}
      </div>

      {error ? (
        <p id={`${id}-error`} className="field-error" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="field-hint">
          {hint}
        </p>
      ) : null}

      {children}
    </div>
  )
}

export default FormField
