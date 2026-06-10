export const DEFAULT_TEMPLATES = {
  BOOKING:
    'Olá {cliente}, seu agendamento de *{servico}* foi registrado para *{data}* às *{hora}*. — {empresa}',
  CONFIRMATION:
    'Olá {cliente}, lembrete: sua consulta de *{servico}* está agendada para *{data}* às *{hora}*. — {empresa}',
  REMINDER:
    'Olá {cliente}, lembrete: sua consulta de *{servico}* é amanhã, *{data}* às *{hora}*. — {empresa}',
  CANCELLATION:
    'Olá {cliente}, seu agendamento de *{servico}* em *{data}* às *{hora}* foi cancelado. — {empresa}',
  RESCHEDULE:
    'Olá {cliente}, seu agendamento foi reagendado para *{data}* às *{hora}* (*{servico}*). — {empresa}',
  COMPLETION:
    'Olá {cliente}, obrigado pela visita! Consulta de *{servico}* concluída. — {empresa}',
};

export const TEMPLATE_VARIABLES = [
  { key: '{cliente}', label: 'Nome do cliente' },
  { key: '{servico}', label: 'Serviço' },
  { key: '{data}', label: 'Data' },
  { key: '{hora}', label: 'Horário' },
  { key: '{empresa}', label: 'Empresa' },
];
