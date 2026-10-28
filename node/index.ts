import { IOClients, Service, ServiceContext, method } from '@vtex/api'
import { json } from 'co-body'
import { validateLead } from './lead'

type Context = ServiceContext<IOClients>

async function createLead(ctx: Context) {
  ctx.set('Cache-Control', 'no-store')

  if (!ctx.is('application/json')) {
    ctx.status = 415
    ctx.body = { message: 'Envie os dados em JSON.' }
    return
  }

  let input: unknown
  try {
    input = await json(ctx.req, { limit: '8kb' })
  } catch {
    ctx.status = 400
    ctx.body = { message: 'Corpo da requisição inválido.' }
    return
  }

  const result = validateLead(input)
  if (!result.lead) {
    ctx.status = 400
    ctx.body = {
      message: 'Confira os campos informados.',
      errors: result.errors,
    }
    return
  }

  try {
    const document = await ctx.clients.masterdata.createDocument({
      dataEntity: 'DF',
      fields: result.lead,
    })
    if (
      !document ||
      typeof document.DocumentId !== 'string' ||
      !document.DocumentId
    ) {
      throw new Error('Missing document confirmation')
    }
    ctx.status = 201
    ctx.body = { success: true, message: 'Cadastro realizado com sucesso.' }
  } catch (error) {
    const failure = error as { response?: { status?: number }; status?: number }
    const status = failure.response?.status ?? failure.status
    const code =
      status === 401 || status === 403
        ? 'LEAD_ACCESS_DENIED'
        : status === 404
          ? 'LEAD_ENTITY_NOT_CONFIGURED'
          : 'LEAD_STORAGE_UNAVAILABLE'
    ctx.vtex.logger.error({
      message: 'Lead registration failed',
      code,
      upstreamStatus: status,
    })
    ctx.status =
      status === 429
        ? 429
        : status === 404 || status === 401 || status === 403
          ? 503
          : 502
    ctx.body = {
      code,
      message:
        status === 429
          ? 'Muitas tentativas. Aguarde um pouco antes de tentar novamente.'
          : 'Não foi possível cadastrar agora. Tente novamente em alguns instantes.',
    }
  }
}

export default new Service({
  clients: {
    implementation: IOClients,
    options: { default: { retries: 0, timeout: 4000 } },
  },
  routes: { leads: method({ POST: createLead }) },
})
