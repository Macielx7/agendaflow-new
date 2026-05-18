export const SITE = {
  name: 'Dr. João Marcos',
  title: 'Dr. João Marcos | Lentes de Contato Dental e Implantes Premium',
  description:
    'Transforme seu sorriso com lentes de contato dental e implantes de alto padrão. Atendimento humanizado, tecnologia avançada e resultados naturais em clínica premium.',
  url: 'https://drjoaosilva.com.br',
  locale: 'pt_BR',
};

export const CONTACT = {
  whatsapp: '556192308500',
  whatsappMessage:
    'Olá, Dr. João! Vi o site e gostaria de agendar uma avaliação para transformar meu sorriso.',
  instagram: 'https://www.instagram.com/dr.joaomarcosw/',
  email: '',
  phone: '(61) 9 9230-8500',
  address: '',
  hours: 'Segunda a Sexta: 9h às 19h | Sábado: 9h às 14h',
};

export const NAV_LINKS = [
  { label: 'Início', href: '#inicio' },
  { label: 'Especialidades', href: '#especialidades' },
  { label: 'Resultados', href: '#resultados' },
  { label: 'Sobre', href: '#sobre' },
  { label: 'Depoimentos', href: '#depoimentos' },
  { label: 'Contato', href: '#contato' },
];

export const SPECIALTIES = [
  {
    id: 'lentes',
    title: 'Lentes de Contato Dental',
    description:
      'Harmonização milimétrica do sorriso com lentes ultrafinas. Cor, forma e brilho personalizados para um resultado natural e cinematográfico.',
    icon: 'sparkles',
    features: ['Design digital do sorriso', 'Mínima desgaste', 'Resultado imediato'],
  },
  {
    id: 'implantes',
    title: 'Implantes Dentários',
    description:
      'Reabilitação completa com implantes de última geração. Estabilidade, conforto e estética que devolvem sua confiança ao sorrir.',
    icon: 'shield',
    features: ['Planejamento 3D', 'Carga imediata', 'Garantia estendida'],
  },
  {
    id: 'clareamento',
    title: 'Clareamento Premium',
    description:
      'Tonalidade luminosa e uniforme com protocolos seguros. Sorriso radiante sem comprometer a saúde do esmalte.',
    icon: 'sun',
    features: ['Ativação LED', 'Sensibilidade controlada', 'Manutenção guiada'],
  },
  {
    id: 'reabilitacao',
    title: 'Reabilitação Oral',
    description:
      'Tratamentos integrados para reconstruir função e beleza. Do diagnóstico ao sorriso final, cada etapa é planejada.',
    icon: 'layers',
    features: ['Abordagem multidisciplinar', 'Próteses fixas', 'Acompanhamento contínuo'],
  },
];

export const BENEFITS = [
  {
    title: 'Atendimento Humanizado',
    description: 'Cada paciente é único. Tempo, escuta e cuidado em cada detalhe da sua jornada.',
    icon: 'heart',
  },
  {
    title: 'Tecnologia Avançada',
    description: 'Scanner intraoral, planejamento digital e materiais de referência mundial.',
    icon: 'cpu',
  },
  {
    title: 'Resultado Natural',
    description: 'Estética que respeita suas proporções faciais. Ninguém percebe — todos admiram.',
    icon: 'gem',
  },
  {
    title: 'Procedimentos Modernos',
    description: 'Técnicas minimamente invasivas para conforto máximo e recuperação acelerada.',
    icon: 'zap',
  },
  {
    title: 'Recuperação Rápida',
    description: 'Protocolos otimizados para você voltar à rotina com segurança e tranquilidade.',
    icon: 'clock',
  },
  {
    title: 'Clínica Premium',
    description: 'Ambiente sofisticado, privacidade absoluta e experiência digna do seu padrão.',
    icon: 'crown',
  },
];

export const BEFORE_AFTER = [
  {
    id: 1,
    label: 'Lentes de Contato',
    before: '/images/lentes-before.jpg',
    after: '/images/lentes-after.jpeg',
  },
  {
    id: 2,
    label: 'Implantes Completos',
    before: 'https://images.unsplash.com/photo-1609840114035-3c981b782dfe?w=800&q=80',
    after: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800&q=80',
  },
  {
    id: 3,
    label: 'Reabilitação Total',
    before: '/images/implante_antes.jpeg',
    after: '/images/implante_depois.jpeg',
  },
];

export const TESTIMONIALS = [
  {
    id: 1,
    name: 'Mariana Costa',
    role: 'Empresária',
    text: 'Fiz minhas lentes com o Dr. João e o resultado superou tudo que imaginei. O atendimento é impecável — me senti cuidada em cada etapa. Hoje sorrio sem pensar duas vezes.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80',
  },
  {
    id: 2,
    name: 'Ricardo Almeida',
    role: 'Advogado',
    text: 'Depois de anos evitando fotos, recuperei meu sorriso com implantes. O planejamento foi transparente, sem dor, e o resultado ficou absolutamente natural.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80',
  },
  {
    id: 3,
    name: 'Patrícia Mendes',
    role: 'Arquiteta',
    text: 'A clínica é um refúgio de sofisticação. O Dr. João explica cada detalhe com calma e expertise. Recomendo de olhos fechados para quem busca excelência.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&q=80',
  },
  {
    id: 4,
    name: 'Fernando Lima',
    role: 'Executivo',
    text: 'Profissionalismo raro. Fiz reabilitação completa e hoje tenho confiança em reuniões e eventos. Valeu cada investimento — mudou minha autoestima.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&q=80',
  },
];

export const STATS = [
  { value: 15, suffix: '+', label: 'Anos de Experiência' },
  { value: 3500, suffix: '+', label: 'Sorrisos Transformados' },
  { value: 98, suffix: '%', label: 'Satisfação dos Pacientes' },
  { value: 12, suffix: '', label: 'Certificações Internacionais' },
];

export const VIDEOS = [
  {
    id: 'institucional',
    title: 'Conheça Nossa Clínica',
    description: 'Um tour pelo espaço onde sorrisos ganham nova vida.',
    thumbnail: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=1200&q=80',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  },
  {
    id: 'procedimento',
    title: 'Como Funciona o Tratamento',
    description: 'Do diagnóstico ao sorriso final — transparência em cada etapa.',
    thumbnail: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=1200&q=80',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  },
  {
    id: 'depoimento',
    title: 'Histórias Reais',
    description: 'Pacientes que transformaram autoestima e qualidade de vida.',
    thumbnail: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=1200&q=80',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  },
];

export const DOCTOR = {
  name: 'Dr. João Marcos',
  title: 'Cirurgião-Dentista | Especialista em Estética e Implantodontia',
  bio: 'Com mais de 15 anos dedicados à odontologia de alto padrão, o Dr. João une ciência, arte e sensibilidade para criar sorrisos que transcendem o estético. Formado pelas melhores instituições do Brasil e do exterior, ele lidera uma equipe que trata cada paciente como uma obra única.',
  image: '/images/imagem_drjoao1.jpeg',
  credentials: [
    'CRO-SP 12345',
    'Especialização em Implantodontia — USP',
    'Pós-graduação em Laminados Cerâmicos — NYU',
    'Membro da Academia Brasileira de Odontologia Estética',
    'Certificação Internacional em Digital Smile Design',
    'Palestrante em congressos nacionais e internacionais',
  ],
};
