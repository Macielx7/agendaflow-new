import { extractKeywords } from './normalize.js';

function resolvePlaceholders(text, vars) {
  return String(text).replace(/\{(\w+)\}/g, (_, key) => vars[key] ?? '');
}

export const KNOWLEDGE_TEMPLATES = [
  // ── Assistente virtual ──
  {
    question: 'Quem é você? O que você faz?',
    answer: 'Sou o assistente virtual inteligente da *{empresa}*, disponível pelo WhatsApp 24 horas. Posso ajudar com agendamentos, horários, valores, procedimentos, confirmações, remarcações e tirar qualquer dúvida sobre a clínica. Se precisar de atendimento humano, basta digitar *atendente*.',
    category: 'ASSISTENTE',
    keywords: ['quem e voce', 'o que faz', 'assistente', 'robo', 'bot', 'inteligencia artificial', 'ia', 'automático'],
  },
  {
    question: 'Como posso falar com um atendente humano?',
    answer: 'Para falar com um atendente da *{empresa}*, responda *atendente*, *humano* ou *recepcionista*. Nossa equipe assumirá a conversa em breve. Você também pode ligar diretamente: *{telefone}*.',
    category: 'ASSISTENTE',
    keywords: ['atendente', 'humano', 'pessoa', 'falar com alguem', 'recepcionista', 'operador'],
  },
  {
    question: 'Você consegue me ajudar com qualquer dúvida?',
    answer: 'Sim! Estou preparado para responder sobre horários, endereço, procedimentos, valores, formas de pagamento, agendamentos, confirmações, remarcações e políticas da *{empresa}*. Pergunte naturalmente — entendo mensagens de forma inteligente. Se não souber algo, transfiro para um atendente.',
    category: 'ASSISTENTE',
    keywords: ['ajuda', 'duvida', 'pergunta', 'pode ajudar', 'consegue', 'sabe'],
  },

  // ── Saudação ──
  {
    question: 'Olá, bom dia, boa tarde, boa noite',
    answer: 'Olá! Seja bem-vindo(a) à *{empresa}*! 😊 Sou o assistente virtual e estou aqui para ajudar. Posso auxiliar com agendamentos, horários, procedimentos, valores e muito mais. Como posso ajudar você hoje?',
    category: 'GERAL',
    keywords: ['oi', 'ola', 'bom dia', 'boa tarde', 'boa noite', 'e ai', 'tudo bem', 'hey'],
  },

  // ── Agendamento ──
  {
    question: 'Como faço para agendar uma consulta?',
    answer: 'Para agendar na *{empresa}*, informe:\n1️⃣ O *procedimento* desejado\n2️⃣ Sua *preferência de data e horário*\n3️⃣ Seu *nome completo*\n\nNossa equipe confirmará a disponibilidade. Você também pode ligar: *{telefone}*.\n\n*Procedimentos disponíveis:*\n{servicos_lista}',
    category: 'AGENDAR',
    keywords: ['agendar', 'marcar', 'consulta', 'horario disponivel', 'quero marcar', 'fazer agendamento', 'marcação'],
  },
  {
    question: 'Quais informações preciso para agendar?',
    answer: 'Para agendar, precisamos de:\n• *Nome completo*\n• *CPF* (para cadastro)\n• *WhatsApp* para contato\n• *Procedimento* desejado\n• *Data e horário* de preferência\n\nOpcionalmente, informe se possui alguma restrição de saúde ou alergia.',
    category: 'AGENDAR',
    keywords: ['informacoes', 'dados', 'preciso', 'documentos', 'cadastro', 'o que precisa'],
  },
  {
    question: 'Quanto tempo demora para confirmar o agendamento?',
    answer: 'Após solicitar o agendamento, nossa equipe confirma em até *24 horas úteis*. Você receberá uma mensagem de confirmação pelo WhatsApp com data, horário e procedimento. Fique atento às notificações!',
    category: 'AGENDAR',
    keywords: ['confirmar', 'demora', 'quanto tempo', 'resposta', 'retorno', 'confirmacao'],
  },
  {
    question: 'Posso agendar para outra pessoa?',
    answer: 'Sim! Você pode agendar para outra pessoa informando o *nome completo*, *CPF* e *WhatsApp* do paciente, além do procedimento e horário desejados. O cadastro será feito em nome do paciente.',
    category: 'AGENDAR',
    keywords: ['outra pessoa', 'terceiro', 'filho', 'mae', 'pai', 'esposa', 'marido', 'familia'],
  },
  {
    question: 'Tem horário disponível hoje ou amanhã?',
    answer: 'Para verificar horários disponíveis, informe o *procedimento* desejado e se prefere *hoje*, *amanhã* ou outra data. Consulto a agenda da *{empresa}* e retorno com as opções. Funcionamos de segunda a sexta das *{hora_inicio}* às *{hora_fim}*. {sabado}',
    category: 'AGENDAR',
    keywords: ['hoje', 'amanha', 'disponivel', 'vaga', 'horario livre', 'tem horario'],
  },

  // ── Remarcação ──
  {
    question: 'Como remarcar ou reagendar minha consulta?',
    answer: 'Para *remarcar* sua consulta na *{empresa}*, informe:\n• Sua *nova data e horário* de preferência\n\nNossa equipe verificará a disponibilidade e confirmará a alteração. Você também pode ligar: *{telefone}*.',
    category: 'REMARCAR',
    keywords: ['remarcar', 'reagendar', 'mudar horario', 'trocar data', 'outro dia', 'outro horario', 'alterar'],
  },
  {
    question: 'Posso remarcar em cima da hora?',
    answer: 'Recomendamos solicitar remarcação com pelo menos *24 horas de antecedência*. Remarcações de última hora dependem da disponibilidade da agenda. Entre em contato pelo *{telefone}* o quanto antes.',
    category: 'REMARCAR',
    keywords: ['ultima hora', 'urgente', 'hoje', 'agora', 'remarcar rapido'],
  },

  // ── Cancelamento ──
  {
    question: 'Como cancelar meu agendamento?',
    answer: 'Para *cancelar* seu agendamento na *{empresa}*, basta informar que deseja cancelar. Localizo seu cadastro pelo WhatsApp e cancelo automaticamente. Você também pode ligar: *{telefone}*.\n\nPedimos aviso com *24 horas de antecedência* quando possível.',
    category: 'CANCELAR',
    keywords: ['cancelar', 'cancela', 'desmarcar', 'nao vou', 'nao poderei', 'desistir'],
  },
  {
    question: 'O que acontece se eu faltar à consulta?',
    answer: 'Faltas sem aviso prévio (no-show) podem impactar futuros agendamentos na *{empresa}*. Pedimos que, se não puder comparecer, *cancele ou remarque* com antecedência pelo WhatsApp ou ligando *{telefone}*. Assim liberamos o horário para outro paciente.',
    category: 'CANCELAR',
    keywords: ['falta', 'faltou', 'nao compareci', 'no show', 'nao apareci', 'perdi'],
  },

  // ── Confirmação e lembretes ──
  {
    question: 'Como funciona a confirmação de consulta pelo WhatsApp?',
    answer: 'A *{empresa}* envia *confirmação automática* pelo WhatsApp antes da sua consulta. Você recebe os detalhes (data, horário, procedimento) e pode confirmar com um toque. Também enviamos *lembretes* para que você não esqueça!',
    category: 'CONFIRMACAO',
    keywords: ['confirmacao', 'confirmar', 'lembrete', 'aviso', 'notificacao', 'mensagem automatica'],
  },
  {
    question: 'Recebi uma mensagem de confirmação, o que faço?',
    answer: 'A mensagem de confirmação da *{empresa}* contém os detalhes do seu agendamento. Basta *confirmar* respondendo à mensagem ou clicando no botão indicado. Se precisar remarcar ou cancelar, me avise aqui mesmo!',
    category: 'CONFIRMACAO',
    keywords: ['recebi', 'mensagem', 'confirmar consulta', 'botao', 'clicar'],
  },
  {
    question: 'Vou receber lembrete antes da consulta?',
    answer: 'Sim! A *{empresa}* envia *lembretes automáticos* pelo WhatsApp antes do seu horário agendado, para que você não esqueça. Mantenha as notificações do WhatsApp ativas.',
    category: 'CONFIRMACAO',
    keywords: ['lembrete', 'lembrar', 'esquecer', 'aviso antes', 'notificacao'],
  },

  // ── Horários ──
  {
    question: 'Qual o horário de funcionamento da clínica?',
    answer: 'A *{empresa}* funciona de *segunda a sexta*, das *{hora_inicio}* às *{hora_fim}*, com intervalo de almoço das 12:00 às 13:00. {sabado}\n*Domingos e feriados:* fechado.',
    category: 'HORARIOS',
    keywords: ['horario', 'funcionamento', 'abre', 'fecha', 'que horas', 'expediente'],
  },
  {
    question: 'A clínica funciona no sábado e domingo?',
    answer: '{sabado}\n*Domingos:* não atendemos. Para agendar em dia útil, informe o procedimento e horário desejados.',
    category: 'HORARIOS',
    keywords: ['sabado', 'domingo', 'fim de semana', 'final de semana', 'feriado'],
  },
  {
    question: 'A clínica fecha para almoço?',
    answer: 'Sim, a *{empresa}* tem *intervalo de almoço das 12:00 às 13:00* de segunda a sexta. Atendimentos são agendados fora desse horário.',
    category: 'HORARIOS',
    keywords: ['almoco', 'intervalo', 'pausa', 'meio dia', '12h', '13h'],
  },
  {
    question: 'Atendem em feriados?',
    answer: 'A *{empresa}* *não atende em feriados nacionais*. A agenda é atualizada automaticamente. Para reagendar após um feriado, entre em contato pelo *{telefone}*.',
    category: 'HORARIOS',
    keywords: ['feriado', 'feriados', 'natal', 'ano novo', 'carnaval'],
  },

  // ── Localização ──
  {
    question: 'Qual o endereço da clínica?',
    answer: 'O endereço da *{empresa}* é:\n📍 *{endereco}*\n\nPrecisa de ajuda para chegar? Ligue *{telefone}* que orientamos você!',
    category: 'LOCALIZACAO',
    keywords: ['endereco', 'onde fica', 'localizacao', 'como chegar', 'mapa', 'fica onde', 'rua'],
  },
  {
    question: 'Tem estacionamento na clínica?',
    answer: 'Para informações sobre *estacionamento* próximo à *{empresa}*, entre em contato pelo *{telefone}*. Teremos prazer em orientar a melhor forma de chegar!',
    category: 'LOCALIZACAO',
    keywords: ['estacionamento', 'estacionar', 'carro', 'vaga', 'garagem', 'park'],
  },

  // ── Contato ──
  {
    question: 'Qual o telefone e WhatsApp da clínica?',
    answer: 'O contato da *{empresa}*:\n📱 *WhatsApp:* {telefone}\n📧 *E-mail:* {email}\n\nEstamos disponíveis para atendimento pelo WhatsApp e respondemos o mais breve possível!',
    category: 'CONTATO',
    keywords: ['telefone', 'whatsapp', 'contato', 'ligar', 'numero', 'falar'],
  },
  {
    question: 'Qual o e-mail da clínica?',
    answer: 'O e-mail da *{empresa}* é *{email}*. Para agilidade, recomendamos o WhatsApp: *{telefone}*.',
    category: 'CONTATO',
    keywords: ['email', 'e-mail', 'correio', 'contato email'],
  },

  // ── Pagamento ──
  {
    question: 'Quais formas de pagamento são aceitas?',
    answer: 'A *{empresa}* aceita:\n💳 *Cartão de crédito* (parcelamento consulte condições)\n💳 *Cartão de débito*\n📱 *PIX*\n💵 *Dinheiro*\n\nPara condições especiais de parcelamento, fale com a recepção: *{telefone}*.',
    category: 'PAGAMENTO',
    keywords: ['pagamento', 'cartao', 'pix', 'dinheiro', 'debito', 'credito', 'parcela', 'parcelamento'],
  },
  {
    question: 'Posso parcelar o tratamento?',
    answer: 'Sim! A *{empresa}* oferece *parcelamento* no cartão de crédito para diversos procedimentos. As condições variam conforme o tratamento — consulte a recepção pelo *{telefone}* para um orçamento personalizado.',
    category: 'PAGAMENTO',
    keywords: ['parcelar', 'parcela', 'parcelamento', 'vezes', 'financiamento', 'credito'],
  },
  {
    question: 'Aceita plano odontológico ou convênio?',
    answer: 'A *{empresa}* trabalha com *planos e convênios selecionados*. Para verificar se seu plano é aceito e quais procedimentos estão cobertos, entre em contato pelo *{telefone}* informando o nome do seu convênio.',
    category: 'PAGAMENTO',
    keywords: ['plano', 'convenio', 'odontologico', 'uniodonto', 'amil', 'bradesco', 'sulamerica', 'cobertura'],
  },

  // ── Procedimentos gerais ──
  {
    question: 'Quais procedimentos a clínica realiza?',
    answer: 'A *{empresa}* oferece os seguintes procedimentos:\n{servicos_lista}\n\nSobre qual procedimento deseja saber mais? Pergunte, por exemplo: "Quanto custa o clareamento?"',
    category: 'PROCEDIMENTOS',
    keywords: ['procedimentos', 'servicos', 'tratamentos', 'fazem', 'realizam', 'oferecem', 'o que fazem'],
  },
  {
    question: 'Como funciona a avaliação inicial?',
    answer: 'A *Avaliação* na *{empresa}* é a *consulta inicial* onde o profissional analisa seu caso, tira dúvidas e monta um plano de tratamento personalizado. Duração aproximada: *60 minutos*. É o primeiro passo recomendado para novos pacientes.',
    category: 'PROCEDIMENTOS',
    keywords: ['avaliacao', 'consulta inicial', 'primeira consulta', 'primeira vez', 'conhecer'],
  },
  {
    question: 'Vocês fazem clareamento dental?',
    answer: 'Sim! A *{empresa}* realiza *Clareamento Dental* com técnicas seguras e resultados visíveis. O procedimento dura cerca de *60 minutos*. Para saber o valor e agendar, informe sua preferência de data ou ligue *{telefone}*.',
    category: 'PROCEDIMENTOS',
    keywords: ['clareamento', 'clarear', 'dentes brancos', 'branqueamento', 'manchas'],
  },
  {
    question: 'Vocês fazem lentes de contato dental?',
    answer: 'Sim! A *{empresa}* oferece *Lentes de Contato Dental* para harmonização e correção estética do sorriso. O procedimento requer avaliação prévia e tem duração de aproximadamente *90 minutos*. Agende sua avaliação!',
    category: 'PROCEDIMENTOS',
    keywords: ['lentes', 'lente de contato', 'facetas', 'porcelana', 'estetica', 'sorriso'],
  },
  {
    question: 'Vocês fazem implante dentário?',
    answer: 'Sim! A *{empresa}* realiza *Implantes Dentários* com avaliação completa prévia. O procedimento tem duração de aproximadamente *90 minutos* por sessão. Agende uma *Avaliação* para um plano personalizado.',
    category: 'PROCEDIMENTOS',
    keywords: ['implante', 'implantes', 'dente postico', 'protese fixa', 'osseointegracao'],
  },
  {
    question: 'Quanto tempo dura cada procedimento?',
    answer: 'A duração varia por procedimento na *{empresa}*:\n{servicos_lista}\n\nOs tempos são aproximados e podem variar conforme cada caso.',
    category: 'PROCEDIMENTOS',
    keywords: ['duracao', 'quanto tempo', 'demora', 'minutos', 'horas', 'sessao'],
  },

  // ── Valores ──
  {
    question: 'Quanto custam os procedimentos?',
    answer: 'Valores na *{empresa}*:\n{servicos_lista}\n\n*Obs:* valores podem variar conforme avaliação individual. Para orçamento detalhado, agende uma *Avaliação* gratuita ou ligue *{telefone}*.',
    category: 'VALORES',
    keywords: ['quanto custa', 'valor', 'preco', 'custa quanto', 'quanto fica', 'orcamento', 'tabela'],
  },
  {
    question: 'A avaliação é gratuita?',
    answer: 'A *Avaliação inicial* na *{empresa}* é *gratuita*! É a oportunidade perfeita para conhecer a clínica, tirar dúvidas e receber um plano de tratamento sem compromisso. Agende agora informando sua data preferida!',
    category: 'VALORES',
    keywords: ['avaliacao gratuita', 'gratis', 'custo avaliacao', 'cobram avaliacao', 'primeira consulta valor'],
  },
  {
    question: 'Como solicitar um orçamento?',
    answer: 'Para um *orçamento personalizado* na *{empresa}*:\n1️⃣ Agende uma *Avaliação* (gratuita)\n2️⃣ Ou informe o procedimento desejado aqui no WhatsApp\n3️⃣ Ou ligue: *{telefone}*\n\nMontamos o orçamento conforme seu caso específico.',
    category: 'VALORES',
    keywords: ['orcamento', 'cotacao', 'preco', 'quanto sai', 'valor total'],
  },

  // ── Primeira visita ──
  {
    question: 'É minha primeira vez na clínica, o que devo saber?',
    answer: 'Bem-vindo(a) à *{empresa}*! Na *primeira visita*:\n• Chegue *10 minutos antes* do horário\n• Traga um *documento com foto*\n• Informe *alergias* ou condições de saúde\n• Recomendamos começar com uma *Avaliação gratuita*\n\nEndereço: *{endereco}*\nDúvidas: *{telefone}*',
    category: 'PRIMEIRA_VISITA',
    keywords: ['primeira vez', 'primeira visita', 'nunca fui', 'novo paciente', 'como funciona'],
  },
  {
    question: 'O que devo levar na consulta?',
    answer: 'Para sua consulta na *{empresa}*, traga:\n• *Documento com foto* (RG ou CNH)\n• *CPF*\n• Lista de *medicamentos* em uso (se houver)\n• *Exames* anteriores relacionados (se tiver)\n• Informe *alergias* e condições de saúde na recepção.',
    category: 'PRIMEIRA_VISITA',
    keywords: ['levar', 'documentos', 'o que trazer', 'preciso levar', 'exames'],
  },

  // ── Políticas ──
  {
    question: 'Qual a política de atraso?',
    answer: 'Na *{empresa}*, toleramos atrasos de até *15 minutos*. Após isso, o horário pode ser realocado conforme disponibilidade. Recomendamos chegar *10 minutos antes*. Se estiver atrasado, avise pelo WhatsApp: *{telefone}*.',
    category: 'POLITICAS',
    keywords: ['atraso', 'atrasado', 'cheguei tarde', 'perdi horario', 'tolerancia'],
  },
  {
    question: 'Como funciona a política de privacidade e dados?',
    answer: 'A *{empresa}* respeita sua *privacidade*. Seus dados (nome, CPF, telefone) são usados apenas para agendamentos e comunicações da clínica, conforme a LGPD. Não compartilhamos informações com terceiros sem consentimento.',
    category: 'POLITICAS',
    keywords: ['privacidade', 'dados', 'lgpd', 'seguranca', 'informacoes pessoais', 'cpf'],
  },
  {
    question: 'Crianças e idosos são atendidos?',
    answer: 'Sim! A *{empresa}* atende *pacientes de todas as idades*, incluindo crianças e idosos. Para menores de idade, é necessária a presença ou autorização do responsável. Agende informando a idade do paciente.',
    category: 'POLITICAS',
    keywords: ['crianca', 'criancas', 'idoso', 'idosos', 'menor', 'idade', 'bebe'],
  },

  // ── Urgência ──
  {
    question: 'Estou com dor, é urgência, o que faço?',
    answer: 'Se você está com *dor intensa* ou *urgência*, ligue imediatamente para *{empresa}*: *{telefone}*. Informe seus sintomas e tentaremos encaixe prioritário. Em emergências graves, procure o *pronto-socorro* mais próximo.',
    category: 'URGENCIA',
    keywords: ['dor', 'urgencia', 'emergencia', 'doendo', 'machucou', 'sangue', 'inchaco', 'urgente'],
  },

  // ── Agendamento via sistema (SaaS) ──
  {
    question: 'Como funciona o sistema de agendamento da clínica?',
    answer: 'A *{empresa}* utiliza o *AgendaFlow*, um sistema inteligente de gestão que permite:\n• Agendamento pelo *WhatsApp* (comigo!)\n• *Confirmação automática* de consultas\n• *Lembretes* antes do horário\n• Consulta de horários em *tempo real*\n• Histórico completo do paciente\n\nTudo para sua comodidade!',
    category: 'SAAS',
    keywords: ['sistema', 'agendaflow', 'saas', 'plataforma', 'software', 'aplicativo', 'app', 'online'],
  },
  {
    question: 'Posso consultar meu agendamento pelo WhatsApp?',
    answer: 'Sim! Pelo WhatsApp da *{empresa}*, você pode:\n• Consultar seu *próximo agendamento*\n• Perguntar *"tenho consulta amanhã?"*\n• *Confirmar*, *remarcar* ou *cancelar*\n• Tirar *dúvidas* sobre horários e procedimentos\n\nBasta enviar sua pergunta!',
    category: 'SAAS',
    keywords: ['meu agendamento', 'minha consulta', 'consultar', 'ver horario', 'tenho consulta'],
  },
  {
    question: 'O sistema envia lembretes automáticos?',
    answer: 'Sim! O sistema da *{empresa}* envia *lembretes automáticos* pelo WhatsApp antes de cada consulta, além de mensagens de *confirmação*. Assim você nunca perde um horário agendado!',
    category: 'SAAS',
    keywords: ['lembrete automatico', 'sistema', 'automacao', 'mensagem automatica', 'notificacao'],
  },
  {
    question: 'Meus dados estão seguros no sistema?',
    answer: 'Sim! O sistema da *{empresa}* segue as normas da *LGPD*. Seus dados são armazenados com segurança, acessíveis apenas pela equipe autorizada da clínica, e usados exclusivamente para seu atendimento.',
    category: 'SAAS',
    keywords: ['dados seguros', 'seguranca', 'sistema seguro', 'lgpd', 'protecao'],
  },

  // ── Dúvidas gerais inteligentes ──
  {
    question: 'Não entendi, pode explicar melhor?',
    answer: 'Claro! Estou aqui para ajudar. Posso explicar sobre:\n• *Agendamentos* — como marcar, remarcar ou cancelar\n• *Horários* — quando funcionamos\n• *Procedimentos* — {servicos_nomes}\n• *Valores* e *pagamento*\n• *Endereço* e *contato*\n\nSobre o que gostaria de saber?',
    category: 'GERAL',
    keywords: ['nao entendi', 'explica', 'como assim', 'repete', 'nao compreendi', 'ajuda'],
  },
  {
    question: 'A clínica é boa? Quais os diferenciais?',
    answer: 'A *{empresa}* se destaca por:\n✅ *Atendimento humanizado* e personalizado\n✅ *Tecnologia* de ponta nos procedimentos\n✅ *Agendamento fácil* pelo WhatsApp 24h\n✅ *Lembretes automáticos* — nunca perca uma consulta\n✅ *Equipe qualificada* e experiente\n\nAgende uma *Avaliação gratuita* e comprove!',
    category: 'GERAL',
    keywords: ['boa', 'qualidade', 'diferencial', 'vantagem', 'por que escolher', 'recomendacao', 'confiavel'],
  },
  {
    question: 'Vocês têm Instagram ou redes sociais?',
    answer: 'Para informações sobre nossas *redes sociais* e novidades da *{empresa}*, entre em contato pelo *{telefone}* ou *{email}*. Teremos prazer em compartilhar!',
    category: 'GERAL',
    keywords: ['instagram', 'facebook', 'redes sociais', 'site', 'redes', 'tiktok'],
  },
  {
    question: 'Posso dar feedback ou reclamação?',
    answer: 'Sua opinião é muito importante para a *{empresa}*! Para *feedback*, *sugestões* ou *reclamações*, entre em contato pelo *{telefone}* ou *{email}*. Se preferir atendimento imediato, digite *atendente*.',
    category: 'GERAL',
    keywords: ['feedback', 'reclamacao', 'sugestao', 'elogio', 'insatisfeito', 'problema'],
  },
  {
    question: 'A clínica segue normas de higiene e biossegurança?',
    answer: 'Sim! A *{empresa}* segue rigorosos *protocolos de biossegurança e higiene*, com esterilização de instrumentos, uso de EPIs e ambiente sanitizado a cada atendimento. Sua segurança é nossa prioridade.',
    category: 'GERAL',
    keywords: ['higiene', 'biosseguranca', 'esterilizacao', 'seguro', 'covid', 'limpeza', 'protocolo'],
  },
];

export function buildKnowledgeEntries(tenantId, clinicInfo = {}, services = []) {
  const servicosLista = services.length
    ? services
        .map((s) => {
          const preco =
            s.price > 0
              ? ` — R$ ${Number(s.price).toFixed(2).replace('.', ',')}`
              : ' — gratuito';
          const dur = s.duration ? ` (${s.duration} min)` : '';
          return `• *${s.name}*${dur}${preco}`;
        })
        .join('\n')
    : '• Diversos procedimentos — consulte a recepção';

  const vars = {
    empresa: clinicInfo.empresa || 'Clínica',
    telefone: clinicInfo.telefone || 'nossa recepção',
    endereco: clinicInfo.endereco || 'entre em contato para informações',
    email: clinicInfo.email || clinicInfo.telefone || 'nossa recepção',
    hora_inicio: clinicInfo.horaInicio || '08:00',
    hora_fim: clinicInfo.horaFim || '18:00',
    sabado: clinicInfo.sabado || 'Não atendemos aos sábados.',
    servicos_lista: servicosLista,
    servicos_nomes: services.map((s) => s.name).join(', ') || 'diversos procedimentos',
  };

  return KNOWLEDGE_TEMPLATES.map((tpl) => ({
    tenantId,
    question: tpl.question,
    answer: resolvePlaceholders(tpl.answer, vars),
    category: tpl.category || null,
    keywords: JSON.stringify(tpl.keywords?.length ? tpl.keywords : extractKeywords(tpl.question)),
    isActive: true,
  }));
}
