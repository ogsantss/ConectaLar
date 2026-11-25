# 🏠 conectaLar

Marketplace que conecta clientes a diaristas da cidade de São Paulo. A cliente encontra uma diarista que atende na zona dela, agenda o serviço e conversa pelo chat. A diarista aceita ou recusa os pedidos, conclui o serviço e as duas se avaliam no final.

Projeto acadêmico do curso de Análise e Desenvolvimento de Sistemas (SENAC SP).

## ✨ Funcionalidades

**Cliente**
- Cadastro e login
- Busca de diaristas por zona (mapa) e por tipo de serviço
- Perfil da diarista com descrição, zonas, serviços com preço e avaliações
- Solicitação de serviço com data, horário e endereço, só para os serviços que a diarista oferece
- Lista das próprias solicitações com filtro por status
- Avaliação da diarista depois do serviço concluído
- Chat com a diarista

**Diarista**
- Cadastro com as zonas onde atende e os serviços que oferece
- Agenda com os pedidos recebidos e os serviços dos próximos 7 dias
- Aceitar, recusar e concluir pedidos
- Avaliação do cliente depois do serviço concluído
- Chat com o cliente

**Os dois perfis**
- Editar perfil: avatar, descrição (Sobre), zonas e serviços

## 🔄 Fluxo de uma solicitação

```
PENDENTE ──aceitar──> ACEITA ──concluir──> CONCLUIDA ──> cliente e diarista podem se avaliar
    └──recusar──> RECUSADA
```

Regras principais, conferidas no back end:
- Só a diarista da solicitação aceita, recusa ou conclui (403 para as outras).
- Não dá para aceitar um serviço com a data vencida, nem concluir antes do dia marcado (409).
- A diarista não pode ter dois pedidos ativos no mesmo dia e horário (409).
- O preço vem do enum `TipoServico`, nunca do navegador.
- Cada pessoa avalia uma vez por solicitação, só depois de `CONCLUIDA` (409).
- Só quem participa da conversa lê ou envia mensagens (403).

## 🛠️ Tecnologias

- Java 21 e Spring Boot 4 (Web MVC, Data JPA, Validation)
- Banco H2 salvo em arquivo (pasta `data/`)
- HTML, CSS e JavaScript puro no front, servidos pelo próprio Spring (`src/main/resources/static`)

## ▶️ Como rodar

Pré-requisito: JDK 21. O Maven vem junto no projeto (`mvnw`).

```bash
./mvnw spring-boot:run
```

Abra http://localhost:8080. O console do banco fica em http://localhost:8080/h2-console (JDBC URL `jdbc:h2:file:./data/conectalar`, usuário `sa`, sem senha).

Para começar com o banco vazio, pare o app e apague a pasta `data/`.

## 🔌 Endpoints

| Método | Caminho | O que faz |
|---|---|---|
| POST | `/usuarios` | Cadastro |
| POST | `/usuarios/login` | Login (devolve o usuário, que o front guarda no `localStorage`) |
| GET | `/usuarios/diaristas?zona=&servico=` | Lista diaristas, com filtros opcionais |
| GET | `/usuarios/diaristas/{id}` | Dados públicos de uma diarista |
| GET | `/usuarios/{id}` | Dados públicos de qualquer usuário |
| PUT | `/usuarios/{id}` | Edita o próprio perfil |
| GET | `/usuarios/avatares` | Avatares disponíveis |
| GET | `/solicitacoes/tipos` | Tipos de serviço com preço |
| POST | `/solicitacoes` | Cliente solicita um serviço |
| GET | `/solicitacoes/cliente/{clienteId}` | Solicitações da cliente |
| GET | `/solicitacoes/diarista/{diaristaId}` | Pedidos da diarista |
| PATCH | `/solicitacoes/{id}/aceitar` | Diarista aceita |
| PATCH | `/solicitacoes/{id}/recusar` | Diarista recusa |
| PATCH | `/solicitacoes/{id}/concluir` | Diarista conclui |
| POST | `/avaliacoes` | Avalia a outra pessoa de uma solicitação concluída |
| GET | `/avaliacoes/usuario/{usuarioId}` | Avaliações recebidas por um usuário |
| GET | `/avaliacoes/recentes` | Últimas avaliações de diaristas (Home) |
| POST | `/conversas` | Abre (ou reaproveita) a conversa entre cliente e diarista |
| GET | `/conversas?usuarioId=` | Conversas do usuário |
| GET | `/conversas/{id}/mensagens?usuarioId=` | Mensagens de uma conversa |
| POST | `/conversas/{id}/mensagens` | Envia uma mensagem |

## 📁 Estrutura

```
src/main/java/com/conectaLar/conectaLar
├── controller   # recebe as requisições HTTP
├── service      # regras de negócio
├── repository   # acesso ao banco (Spring Data JPA)
├── entity       # tabelas: User, Solicitacao, Avaliacao, Conversa, Mensagem
├── dto          # o que entra e sai da API
├── enums        # Zona, TipoServico, StatusSolicitacao, Identification, Avatar
└── exception
src/main/resources/static   # telas (HTML, CSS e js/app.js)
```

## ⚠️ Limitações conhecidas

Por regra da disciplina, o projeto não usa Spring Security, JWT nem hash de senha. Por isso:
- A senha é salva em texto puro.
- O front identifica o usuário pelo id salvo no `localStorage`, e o back confia nesse id. Qualquer pessoa pode trocar esse id pelo DevTools. Num projeto real, quem diz quem é o usuário é o servidor, com sessão ou token (JWT).
- Não há pagamento pelo app: o valor mostrado é só o preço do serviço.
