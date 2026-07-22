export type PasswordCheck = {
  label: string
  passed: boolean
}

export type PasswordAnalysis = {
  score: number
  rating: string
  checks: PasswordCheck[]
  suggestions: string[]
}

export type PasswordGeneratorOptions = {
  length: number
  useLowercase: boolean
  useUppercase: boolean
  useNumbers: boolean
  useSymbols: boolean
}

const COMMON_TERMS = [
  'password',
  '1234',
  'qwerty',
  'admin',
  'welcome',
  'letmein',
  'iloveyou',
  'abc123',
  'passw0rd',
]

const CHARACTER_SETS = {
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  numbers: '0123456789',
  symbols: '!@#$%^&*()-_=+[]{};:,.<>?',
} as const

function pickCharacter(source: string): string {
  const randomValues = new Uint32Array(1)
  const maxUnbiasedValue =
    Math.floor(0x1_0000_0000 / source.length) * source.length

  do {
    crypto.getRandomValues(randomValues)
  } while (randomValues[0] >= maxUnbiasedValue)

  return source[randomValues[0] % source.length]
}

function shuffleCharacters(characters: string[]): void {
  for (let index = characters.length - 1; index > 0; index -= 1) {
    const randomIndex = crypto.getRandomValues(new Uint32Array(1))[0] % (index + 1)
    ;[characters[index], characters[randomIndex]] = [
      characters[randomIndex],
      characters[index],
    ]
  }
}

export function generatePassword(options: PasswordGeneratorOptions): string {
  const enabledSets = [
    options.useLowercase ? CHARACTER_SETS.lowercase : '',
    options.useUppercase ? CHARACTER_SETS.uppercase : '',
    options.useNumbers ? CHARACTER_SETS.numbers : '',
    options.useSymbols ? CHARACTER_SETS.symbols : '',
  ].filter(Boolean)

  const characterSets =
    enabledSets.length > 0 ? enabledSets : [CHARACTER_SETS.lowercase]
  const length = Math.max(8, Math.min(64, options.length))
  const allCharacters = characterSets.join('')
  const password = characterSets.map(pickCharacter)

  while (password.length < length) {
    password.push(pickCharacter(allCharacters))
  }

  shuffleCharacters(password)
  return password.join('')
}

export function analyzePassword(password: string): PasswordAnalysis {
  if (!password) {
    return {
      score: 0,
      rating: 'Very weak',
      checks: [
        { label: 'At least 12 characters', passed: false },
        { label: 'Contains lowercase letter', passed: false },
        { label: 'Contains uppercase letter', passed: false },
        { label: 'Contains number', passed: false },
        { label: 'Contains symbol', passed: false },
        { label: 'Avoids repeated character runs', passed: false },
        { label: 'Avoids common patterns/words', passed: false },
      ],
      suggestions: [
        'Use at least 12-16 characters.',
        'Mix uppercase, lowercase, numbers, and symbols.',
      ],
    }
  }

  const hasLength = password.length >= 12
  const hasLower = /[a-z]/.test(password)
  const hasUpper = /[A-Z]/.test(password)
  const hasNumber = /\d/.test(password)
  const hasSymbol = /[^A-Za-z0-9]/.test(password)
  const hasRepeatedRun = /(.)\1{2,}/.test(password)
  const hasRepeatedChunk = /(..+)\1/.test(password)
  const lowercasePassword = password.toLowerCase()
  const hasCommonTerm = COMMON_TERMS.some((term) =>
    lowercasePassword.includes(term),
  )
  const hasCommonSequence =
    /0123|1234|2345|3456|4567|5678|6789|abcd|qwer|asdf|zxcv/i.test(password)

  const avoidsRepeats = !hasRepeatedRun && !hasRepeatedChunk
  const avoidsCommon = !hasCommonTerm && !hasCommonSequence

  let score = 0
  if (hasLength) score += 25
  if (hasLower) score += 10
  if (hasUpper) score += 10
  if (hasNumber) score += 10
  if (hasSymbol) score += 15
  if (avoidsRepeats) score += 15
  if (avoidsCommon) score += 15
  if (password.length >= 16) score += 10

  const suggestions: string[] = []
  if (!hasLength) suggestions.push('Increase length to at least 12 characters.')
  if (!hasLower) suggestions.push('Add lowercase letters.')
  if (!hasUpper) suggestions.push('Add uppercase letters.')
  if (!hasNumber) suggestions.push('Include one or more numbers.')
  if (!hasSymbol) suggestions.push('Add symbols like !, #, or @.')
  if (!avoidsRepeats) suggestions.push('Avoid repeated blocks like aaa or xyzxyz.')
  if (!avoidsCommon) {
    suggestions.push('Avoid common words, keyboard patterns, and sequences.')
  }
  if (hasLength && password.length < 16) {
    suggestions.push('Consider 16+ characters for stronger protection.')
  }
  if (suggestions.length === 0) {
    suggestions.push('Great password. Store it in a password manager.')
  }

  let rating = 'Very weak'
  if (score >= 85) rating = 'Excellent'
  else if (score >= 70) rating = 'Strong'
  else if (score >= 50) rating = 'Moderate'
  else if (score >= 30) rating = 'Weak'

  return {
    score: Math.min(score, 100),
    rating,
    checks: [
      { label: 'At least 12 characters', passed: hasLength },
      { label: 'Contains lowercase letter', passed: hasLower },
      { label: 'Contains uppercase letter', passed: hasUpper },
      { label: 'Contains number', passed: hasNumber },
      { label: 'Contains symbol', passed: hasSymbol },
      { label: 'Avoids repeated character runs', passed: avoidsRepeats },
      { label: 'Avoids common patterns/words', passed: avoidsCommon },
    ],
    suggestions,
  }
}
