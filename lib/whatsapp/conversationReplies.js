function normalize(text) {
  return String(text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function hasAny(text, words) {
  return words.some((w) => text.includes(w));
}

export function buildNaturalReply(text, context) {
  const t = normalize(text);
  const name = context.clientName || 'tudo bem';
  const service = context.servico || 'consulta';
  const date = context.data || 'em breve';
  const time = context.hora || '';
  const empresa = context.empresa || 'nossa clínica';
  const when = time ? `${date} às ${time}` : date;

  if (hasAny(t, ['oi', 'ola', 'bom dia', 'boa tarde', 'boa noite', 'e ai', 'eai'])) {
    return `Olá, ${name}! 😊 Estou aqui para ajudar com seu agendamento de *${service}* (${when}).\n\nPara confirmar, responda *confirmar*. Para cancelar, responda *cancelar*.`;
  }

  if (hasAny(t, ['obrigado', 'obrigada', 'valeu', 'brigado', 'brigada'])) {
    return `Por nada, ${name}! Fico feliz em ajudar. Se precisar de algo sobre sua consulta, é só chamar.`;
  }

  if (hasAny(t, ['horario', 'hora', 'que horas', 'horas'])) {
    return `Sua consulta de *${service}* está marcada para *${when}*. Posso confirmar para você? Responda *confirmar* ou *cancelar*.`;
  }

  if (hasAny(t, ['data', 'dia', 'quando'])) {
    return `O agendamento de *${service}* é no dia *${date}*${time ? ` às *${time}*` : ''}. Deseja confirmar? Responda *confirmar* ou *cancelar*.`;
  }

  if (hasAny(t, ['onde', 'endereco', 'local', 'fica'])) {
    return `Somos a *${empresa}*. Sua consulta está agendada para *${when}*. Para confirmar presença, responda *confirmar*.`;
  }

  if (hasAny(t, ['valor', 'preco', 'quanto', 'custa', 'pagar'])) {
    return `Sobre valores e pagamento, a equipe da *${empresa}* pode te orientar diretamente. Quanto ao agendamento de *${when}*, responda *confirmar* ou *cancelar*.`;
  }

  if (hasAny(t, ['reagendar', 'remarcar', 'mudar', 'trocar data', 'outro dia'])) {
    return `Entendi, ${name}. Para reagendar, responda *cancelar* neste agendamento e depois entre em contato com a *${empresa}* para marcar uma nova data.`;
  }

  if (hasAny(t, ['duvida', 'duvidas', 'ajuda', 'nao entendi', 'como'])) {
    return `Claro! É simples: responda *confirmar* se você vai comparecer à consulta de *${service}* em *${when}*, ou *cancelar* se não puder ir.`;
  }

  return `Recebi sua mensagem, ${name}! Para o agendamento de *${service}* em *${when}*, preciso que responda *confirmar* ou *cancelar*. Se for outro assunto, a equipe da *${empresa}* te atende com prazer.`;
}
