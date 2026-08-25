export function getStoreStatus(loja) {
  if (loja.status === 'Fechada') {
    return { label: 'Fechada', color: 'red' }
  }

  if (!loja.hora_abertura || !loja.hora_fechamento) {
    return { label: 'Horário não informado', color: 'gray' }
  }

  const now = new Date()
  const brasiliaTime = new Date(
    now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' })
  )

  const [hA, mA, sA] = loja.hora_abertura.split(':').map(Number)
  const [hF, mF, sF] = loja.hora_fechamento.split(':').map(Number)

  const currentMinutes = brasiliaTime.getHours() * 60 + brasiliaTime.getMinutes()
  const openMinutes = hA * 60 + (mA || 0)
  const closeMinutes = hF * 60 + (mF || 0)

  if (currentMinutes >= openMinutes && currentMinutes < closeMinutes) {
    return { label: 'Aberta', color: 'green' }
  }

  return { label: 'Fora do Horário', color: 'orange' }
}
