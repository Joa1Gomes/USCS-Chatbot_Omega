# Chatbot Omega 🤖

**Chatbot Omega** é uma solução completa para empresas que buscam integrar chatbots inteligentes em seus marketplaces ou websites. O sistema combina a eficiência de atendimentos automaticos com flexibilidade de transição para atendentes humanos em tempo real.

---

## 🚀 Principais Funcionalidades

- **Integração de Chatbot**: Chatbot facilmente acoplável para interação inicial com clientes.
- **Coleta Automatizada de Dados**: Captura automática de informações essenciais (nome, e-mail, número do pedido, tipo de solicitação).
- **Atendimento Humano em Tempo Real**: Fluxo de transição para suporte humano quando a complexidade exige intervenção especializada.
- **Painel Administrativo da Empresa**: Gerenciamento de usuários, permissões e visualização de atendimentos concluídos.
- **Módulo de Estatísticas**: Acompanhamento de métricas de atendimento para otimização de processos.
- **Segurança**: Autenticação robusta com `bcrypt` e gerenciamento de sessões.

---

## 🛠️ Tecnologias Utilizadas

### Backend
- **Node.js**: Ambiente de execução Javascript.
- **Express.js**: Framework para construção de APIs.
- **PostgreSQL**: Banco de dados principal para armazenamento de usuários e atendimentos.
- **Docker**: O servidor com o banco de dados do projeto esta dockerizado

### Frontend
- **HTML5 & CSS3**: Estrutura e estilização moderna e responsiva.
- **JavaScript (Vanilla)**: Lógica de interação no cliente sem dependências pesadas.

---

## 📂 Estrutura do Projeto

```text
USCS-Chatbot_Omega/
├── src/                # Código fonte do backend
│   ├── controllers/    # Lógica de controle das rotas
│   ├── routes/         # Definição dos endpoints da API
│   └── database/       # Configurações de banco de dados
├── public/             # Arquivos estáticos (Frontend)
│   ├── html/           # Páginas HTML (Login, Chat, Home, etc.)
│   ├── css/            # Folhas de estilo (Design moderno)
│   └── js/             # Scripts do cliente (Chatbot, Dashboard)
├── server.js           # Ponto de entrada da aplicação
├── dbConfig.js         # Configuração da conexão com o banco
└── package.json        # Dependências e scripts do projeto
```

## 👥 Integrantes do Grupo

- **Gabriel Cesar Soares Martine** (RA: 8160085)
- **Giovana Honório Zakaluk** (RA: 8161876)
- **Lucas de Andrade Jardim** (RA: 8124661)
- **Igor Silva** (RA: 8152698)
- **João Victor Gomes** (RA: 8159415)
- **Michel Douglas Cardoso** (RA: 8157129)
- **Vinicius Dias** (RA: 8156975)

---

## .env não está inclusa no projeto por questões de segurança, mas segue o modelo:

```text
DB_HOST= xxxxx
DB_PORT= xxxxx
DB_USER= xxxxx
DB_PASSWORD= xxxxx
DB_NAME= xxxxxx
```
