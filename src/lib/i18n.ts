export type Locale = 'en' | 'pt-BR';

type Dictionary = {
  crmTitle: string;
  crmSubtitle: string;
  logout: string;
  dashboard: string;
  customers: string;
  pipeline: string;
  activities: string;
  searchPlaceholder: string;
  language: string;
  login: string;
  register: string;
};

export const dictionaries: Record<Locale, Dictionary> = {
  en: {
    crmTitle: 'Sales CRM Platform',
    crmSubtitle: 'Portfolio-ready CRM with REST API, JWT auth, Kanban pipeline, and role control.',
    logout: 'Logout',
    dashboard: 'Dashboard',
    customers: 'Customers',
    pipeline: 'Pipeline',
    activities: 'Activities',
    searchPlaceholder: 'Search customers or leads...',
    language: 'Language',
    login: 'Login',
    register: 'Create account',
  },
  'pt-BR': {
    crmTitle: 'Plataforma CRM de Vendas',
    crmSubtitle: 'CRM para portfólio com API REST, autenticação JWT, pipeline Kanban e controle de perfil.',
    logout: 'Sair',
    dashboard: 'Painel',
    customers: 'Clientes',
    pipeline: 'Pipeline',
    activities: 'Atividades',
    searchPlaceholder: 'Buscar clientes ou leads...',
    language: 'Idioma',
    login: 'Entrar',
    register: 'Criar conta',
  },
};
