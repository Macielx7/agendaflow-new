import prisma from '@/lib/prisma';
import { INTENTS } from './intents';

async function getClinicInfo(tenantId) {
  const settings = await prisma.setting.findMany({ where: { tenantId } });
  const map = Object.fromEntries(settings.map((s) => [s.key, s.value]));

  const schedules = await prisma.schedule.findMany({
    where: { tenantId, active: true },
    orderBy: { dayOfWeek: 'asc' },
  });

  const weekday = schedules.find((s) => s.dayOfWeek >= 1 && s.dayOfWeek <= 5);
  const saturday = schedules.find((s) => s.dayOfWeek === 6);

  const services = await prisma.service.findMany({
    where: { tenantId, active: true },
    take: 8,
  });

  return {
    empresa: map.company_name || 'Clínica',
    telefone: map.company_phone || '',
    endereco: map.company_address || '',
    email: map.company_email || '',
    horaInicio: weekday?.startTime || '08:00',
    horaFim: weekday?.endTime || '18:00',
    sabado: saturday?.active
      ? `Sábado das ${saturday.startTime} às ${saturday.endTime}`
      : null,
    servicos: services.map((s) => s.name),
  };
}

export function buildTransferMessage(empresa) {
  return `Entendi! Vou transferir você para um atendente da *${empresa}*. Em breve alguém da equipe irá responder. Obrigado pela paciência! 🙏`;
}

export function buildLowConfidenceMessage(empresa) {
  return `Desculpe, não tenho certeza sobre essa pergunta. Posso transferir você para um atendente da *${empresa}* — basta responder *atendente*.`;
}

export function buildGreeting(clientName, empresa) {
  const name = clientName ? `, ${clientName}` : '';
  return `Olá${name}! Sou o assistente virtual da *${empresa}*. Posso ajudar com horários, procedimentos, valores, agendamentos e muito mais. Como posso ajudar?`;
}

export async function buildIntentResponse(intent, { tenantId, clientName, phone, settings, searchResult, serviceResults }) {
  const clinic = await getClinicInfo(tenantId);
  const name = clientName || 'tudo bem';

  if (searchResult?.item && searchResult.score >= (settings.confidenceThreshold || 0.45)) {
    return {
      text: searchResult.item.answer,
      topic: searchResult.item.question,
      matched: true,
      confidence: searchResult.score,
    };
  }

  switch (intent) {
    case INTENTS.SAUDACAO:
      return { text: buildGreeting(clientName, clinic.empresa), topic: 'saudacao', matched: true, confidence: 0.9 };

    case INTENTS.LOCALIZACAO:
      return {
        text: clinic.endereco
          ? `Nosso endereço é: *${clinic.endereco}*`
          : `Entre em contato pelo ${clinic.telefone || 'telefone da clínica'} para informações de localização.`,
        topic: 'endereco',
        matched: true,
        confidence: 0.85,
      };

    case INTENTS.HORARIOS: {
      let horario = `Funcionamos de segunda a sexta das *${clinic.horaInicio}* às *${clinic.horaFim}*`;
      if (clinic.sabado) horario += `. ${clinic.sabado}`;
      return { text: horario, topic: 'horarios', matched: true, confidence: 0.85 };
    }

    case INTENTS.PAGAMENTO:
      return {
        text: 'Aceitamos cartão de crédito, débito, PIX e dinheiro. Consulte condições de parcelamento na recepção.',
        topic: 'pagamento',
        matched: true,
        confidence: 0.8,
      };

    case INTENTS.PROCEDIMENTOS: {
      if (serviceResults?.length) {
        const names = serviceResults.map((r) => r.item.name).join(', ');
        return {
          text: `Realizamos os seguintes procedimentos: *${names}*. Deseja saber mais sobre algum?`,
          topic: serviceResults[0].item.name,
          matched: true,
          confidence: serviceResults[0].score,
        };
      }
      if (clinic.servicos.length) {
        return {
          text: `Oferecemos: *${clinic.servicos.join(', ')}*. Sobre qual procedimento deseja saber mais?`,
          topic: 'procedimentos',
          matched: true,
          confidence: 0.75,
        };
      }
      return {
        text: `A *${clinic.empresa}* oferece diversos procedimentos. Pergunte sobre o que precisa, por exemplo: "Fazem implante?"`,
        topic: 'procedimentos',
        matched: true,
        confidence: 0.6,
      };
    }

    case INTENTS.AGENDAR:
      return {
        text: `Para agendar na *${clinic.empresa}*, informe o procedimento desejado e sua preferência de data/horário${clinic.telefone ? `, ou ligue ${clinic.telefone}` : ''}.`,
        topic: 'agendar',
        matched: true,
        confidence: 0.8,
      };

    case INTENTS.VALORES:
      return {
        text: `Os valores variam conforme o procedimento. Informe qual serviço deseja (ex: implante, clareamento) para orientarmos melhor, ou fale com a recepção${clinic.telefone ? ` no ${clinic.telefone}` : ''}.`,
        topic: 'valores',
        matched: true,
        confidence: 0.7,
      };

    case INTENTS.REMARCAR:
      if (!settings.allowReschedules) {
        return {
          text: `Para remarcar, entre em contato com a *${clinic.empresa}*${clinic.telefone ? ` pelo ${clinic.telefone}` : ''} e nossa equipe ajudará você.`,
          topic: 'remarcar',
          matched: true,
          confidence: 0.8,
        };
      }
      return {
        text: `Para remarcar sua consulta, informe a nova data e horário preferidos. Nossa equipe confirmará a disponibilidade.`,
        topic: 'remarcar',
        matched: true,
        confidence: 0.75,
      };

    case INTENTS.CANCELAR:
      return {
        text: null,
        topic: 'cancelar',
        matched: false,
        confidence: 0.8,
        action: 'CANCEL_APPOINTMENT',
      };

    case INTENTS.AGENDAMENTO_INFO:
      return {
        text: null,
        topic: 'agendamento',
        matched: false,
        confidence: 0.85,
        action: 'APPOINTMENT_INFO',
      };

    case INTENTS.HUMANO:
      return {
        text: buildTransferMessage(clinic.empresa),
        topic: 'humano',
        matched: true,
        confidence: 1,
        action: 'TRANSFER',
      };

    default:
      return {
        text: buildLowConfidenceMessage(clinic.empresa),
        topic: null,
        matched: false,
        confidence: 0.2,
      };
  }
}

export function formatServicesList(services) {
  if (!services?.length) return '';
  return services.map((s) => `• ${s.name}${s.duration ? ` (${s.duration} min)` : ''}`).join('\n');
}

export function formatScheduleSummary(schedules) {
  const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  return schedules
    .filter((s) => s.active)
    .map((s) => `${days[s.dayOfWeek]}: ${s.startTime}–${s.endTime}`)
    .join('\n');
}
