import { useMemo, useState } from 'react'
import { AppChrome } from './chrome/AppChrome'
import { relatedExcept } from './chrome/relatedTools'
import { analyzePassword, generatePassword } from './lib/analyzePassword'
import { ratingToMeterColor } from './lib/meterColor'
import './App.css'

function App() {
  const [password, setPassword] = useState('')
  const [isVisible, setIsVisible] = useState(false)
  const [length, setLength] = useState(16)
  const [useLowercase, setUseLowercase] = useState(true)
  const [useUppercase, setUseUppercase] = useState(true)
  const [useNumbers, setUseNumbers] = useState(true)
  const [useSymbols, setUseSymbols] = useState(true)
  const [copyStatus, setCopyStatus] = useState('')

  const analysis = useMemo(() => analyzePassword(password), [password])
  const charsetOptionsSelected = [
    useLowercase,
    useUppercase,
    useNumbers,
    useSymbols,
  ].some(Boolean)

  const regeneratePassword = () => {
    setPassword(
      generatePassword({
        length,
        useLowercase,
        useUppercase,
        useNumbers,
        useSymbols,
      }),
    )
    setCopyStatus('')
  }

  const copyPassword = async () => {
    try {
      await navigator.clipboard.writeText(password)
      setCopyStatus('Copied')
    } catch {
      setCopyStatus('Could not copy')
    }
  }

  return (
    <AppChrome
      productName="Password Strength Lab"
      githubUrl="https://github.com/openlearnia/password-strength-lab"
      relatedTools={relatedExcept('https://password-strength-lab.openlearnia.com')}
    >
      <div className="container">
        <section className="card">
          <h1>Password Strength Lab</h1>
          <p className="intro">
            Test passwords locally in your browser. Nothing is sent to a server.
          </p>

          <label className="input-label" htmlFor="password">
            Password
          </label>
          <div className="input-row">
            <input
              id="password"
              className="password-input"
              type={isVisible ? 'text' : 'password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Type or generate a password"
              autoComplete="off"
            />
            <button
              type="button"
              className="button secondary"
              onClick={() => setIsVisible((state) => !state)}
            >
              {isVisible ? 'Hide' : 'Show'}
            </button>
          </div>

          <fieldset className="generator-controls">
            <legend>Generator options</legend>
            <label className="length-control" htmlFor="password-length">
              Length
              <input
                id="password-length"
                type="number"
                min="8"
                max="64"
                value={length}
                onChange={(event) =>
                  setLength(
                    Math.max(8, Math.min(64, Number(event.target.value) || 8)),
                  )
                }
              />
            </label>
            <div className="charset-options">
              <label>
                <input
                  type="checkbox"
                  checked={useLowercase}
                  onChange={(event) => setUseLowercase(event.target.checked)}
                />
                Lowercase
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={useUppercase}
                  onChange={(event) => setUseUppercase(event.target.checked)}
                />
                Uppercase
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={useNumbers}
                  onChange={(event) => setUseNumbers(event.target.checked)}
                />
                Numbers
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={useSymbols}
                  onChange={(event) => setUseSymbols(event.target.checked)}
                />
                Symbols
              </label>
            </div>
          </fieldset>

          <div className="actions">
            <button
              type="button"
              className="button"
              onClick={regeneratePassword}
              disabled={!charsetOptionsSelected}
            >
              Regenerate
            </button>
            <button
              type="button"
              className="button secondary"
              onClick={() => void copyPassword()}
              disabled={!password}
            >
              Copy
            </button>
            <span className="copy-status" role="status" aria-live="polite">
              {copyStatus}
            </span>
          </div>

          <div className="strength-header">
            <h2>Strength Score</h2>
            <p>
              <strong>Score: {analysis.score}/100 · {analysis.rating}</strong>
            </p>
          </div>
          <div className="meter" aria-hidden="true">
            <span
              style={{
                width: `${analysis.score}%`,
                ['--meter-color' as string]: ratingToMeterColor(analysis.rating),
              }}
            />
          </div>

          <h2>Checklist</h2>
          <ul className="checklist">
            {analysis.checks.map((check) => (
              <li key={check.label} className={check.passed ? 'pass' : 'fail'}>
                <span className="marker">{check.passed ? '✓' : '•'}</span>
                {check.label}
              </li>
            ))}
          </ul>

          <h2>Suggestions</h2>
          <ul className="suggestions">
            {analysis.suggestions.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        </section>
      </div>
    </AppChrome>
  )
}

export default App
