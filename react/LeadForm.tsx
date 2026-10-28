import React, { FormEvent, useRef, useState } from 'react'
import { Lead, LeadErrors, validateLead } from './lead'
import styles from './styles.css'

const empty: Lead = {
  firstName: '',
  lastName: '',
  email: '',
  interestCategory: '',
  optIn: false,
}
const fields = [
  { name: 'firstName', label: 'Nome', max: 50, autoComplete: 'given-name' },
  {
    name: 'lastName',
    label: 'Sobrenome',
    max: 50,
    autoComplete: 'family-name',
  },
  { name: 'email', label: 'E-mail', max: 100, autoComplete: 'email' },
  {
    name: 'interestCategory',
    label: 'Categoria de interesse',
    max: 100,
    autoComplete: 'off',
  },
] as const

export default function LeadForm() {
  const [values, setValues] = useState<Lead>(empty)
  const [errors, setErrors] = useState<LeadErrors>({})
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState('')
  const [failed, setFailed] = useState(false)
  const lock = useRef(false)
  const formRef = useRef<HTMLFormElement>(null)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (lock.current) return

    const result = validateLead(values)
    setErrors(result.errors)
    setMessage('')
    setFailed(false)
    if (!result.lead) {
      const first = Object.keys(result.errors)[0]
      const control = formRef.current?.elements.namedItem(
        first,
      ) as HTMLInputElement | null
      control?.focus()
      return
    }

    lock.current = true
    setPending(true)
    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort(), 12000)

    try {
      const response = await fetch('/_v/desafio/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result.lead),
        signal: controller.signal,
      })
      const data = (await response.json().catch(() => null)) as {
        success?: boolean
        code?: string
        errors?: LeadErrors
      } | null
      if (!response.ok) {
        setFailed(true)
        if (response.status === 400 && data?.errors) setErrors(data.errors)
        setMessage(
          response.status === 429
            ? 'Muitas tentativas. Aguarde um pouco antes de tentar novamente.'
            : data?.code === 'LEAD_ENTITY_NOT_CONFIGURED' ||
                data?.code === 'LEAD_ACCESS_DENIED'
              ? 'O cadastro está temporariamente indisponível. Por favor, tente mais tarde.'
              : 'Não foi possível cadastrar agora. Seus dados foram mantidos para tentar novamente.',
        )
        return
      }
      if (response.status !== 201 || data?.success !== true) {
        throw new Error('Cadastro não confirmado')
      }
      setValues(empty)
      setMessage('Cadastro realizado com sucesso!')
    } catch (error) {
      setFailed(true)
      setMessage(
        (error as Error).name === 'AbortError'
          ? 'O envio demorou mais que o esperado. Não foi possível confirmar o cadastro.'
          : 'Não foi possível confirmar o envio. Verifique sua conexão e tente novamente.',
      )
    } finally {
      window.clearTimeout(timeout)
      lock.current = false
      setPending(false)
    }
  }

  return (
    <section className={styles.leadSection} aria-label="Cadastro de interesses">
      <h2>Novidades que combinam com você</h2>
      <p>
        Conte o que você procura e escolha se deseja receber nossas ofertas.
      </p>
      <form ref={formRef} onSubmit={submit} noValidate aria-busy={pending}>
        <fieldset className={styles.fields} disabled={pending}>
          <legend>Seus dados</legend>
          {fields.map(field => (
            <label
              key={field.name}
              className={
                field.name === 'email' || field.name === 'interestCategory'
                  ? styles.fullWidthField
                  : undefined
              }
            >
              {field.label}
              <input
                name={field.name}
                type={field.name === 'email' ? 'email' : 'text'}
                autoComplete={field.autoComplete}
                maxLength={field.max}
                required
                value={values[field.name]}
                aria-invalid={Boolean(errors[field.name])}
                aria-describedby={
                  errors[field.name] ? `lead-error-${field.name}` : undefined
                }
                onChange={event => {
                  const value = event.target.value
                  setValues(previous => ({ ...previous, [field.name]: value }))
                }}
              />
              {errors[field.name] && (
                <span
                  id={`lead-error-${field.name}`}
                  className={styles.fieldError}
                >
                  {errors[field.name]}
                </span>
              )}
            </label>
          ))}
          <label className={styles.consent}>
            <input
              name="optIn"
              type="checkbox"
              checked={values.optIn}
              onChange={event => {
                const checked = event.target.checked
                setValues(previous => ({ ...previous, optIn: checked }))
              }}
            />
            Quero receber novidades e ofertas por e-mail.
          </label>
          <button type="submit">
            {pending ? 'Enviando…' : 'Cadastrar interesse'}
          </button>
        </fieldset>
        <p role={failed ? 'alert' : 'status'} aria-atomic="true">
          {message}
        </p>
      </form>
    </section>
  )
}
