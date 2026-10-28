export interface Lead {
  firstName: string
  lastName: string
  email: string
  interestCategory: string
  optIn: boolean
}

export type LeadErrors = Partial<Record<keyof Lead, string>>

export function validateLead(input: unknown): {
  lead?: Lead
  errors: LeadErrors
} {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { errors: { firstName: 'Informe os dados do cadastro.' } }
  }

  const source = input as Record<string, unknown>
  const errors: LeadErrors = {}

  function text(field: keyof Lead, label: string, maximum: number): string {
    const value =
      typeof source[field] === 'string' ? (source[field] as string).trim() : ''
    if (!value || value.length > maximum) {
      errors[field] = `${label}: preencha entre 1 e ${maximum} caracteres.`
    }
    return value
  }

  const firstName = text('firstName', 'Nome', 50)
  const lastName = text('lastName', 'Sobrenome', 50)
  const email = text('email', 'E-mail', 100).toLowerCase()
  const interestCategory = text('interestCategory', 'Categoria', 100)

  if (!errors.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Informe um e-mail válido.'
  }
  if (typeof source.optIn !== 'boolean')
    errors.optIn = 'Informe sua preferência de contato.'

  if (Object.keys(errors).length) return { errors }
  return {
    errors,
    lead: {
      firstName,
      lastName,
      email,
      interestCategory,
      optIn: source.optIn as boolean,
    },
  }
}
