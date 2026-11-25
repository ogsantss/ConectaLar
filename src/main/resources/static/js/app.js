/*
 * app.js - script compartilhado pelas páginas do conectaLar.
 *
 * Organização do arquivo:
 *   1. Comunicação com o back end: único lugar que sabe de onde vêm os dados
 *   2. Funções auxiliares usadas por várias páginas
 *   3. Header e menu, presentes em todas as páginas
 *   4. Uma função "iniciar..." para cada página
 *   5. Inicialização: escolhe a função pelo <body data-page="...">
 */


/* ==========================================================================
 * 1. COMUNICAÇÃO COM O BACK END
 *
 * Todas as chamadas ao Spring passam por requisicaoApi. Cada função abaixo
 * corresponde a um endpoint, e as páginas só usam essas funções: se uma URL
 * mudar no back, basta ajustar aqui.
 * ======================================================================== */

// Faz uma requisição real ao back end e devolve a resposta já convertida.
async function requisicaoApi(caminho, metodo = 'GET', corpo) {
    const opcoes = {method: metodo};

    if (corpo !== undefined) {
        opcoes.headers = {'Content-Type': 'application/json'};
        opcoes.body = JSON.stringify(corpo);
    }

    const resposta = await fetch(caminho, opcoes);

    if (!resposta.ok) {
        // O Spring manda o motivo no campo "message" (ex: "Essa diarista não oferece esse serviço.").
        // A validação automática (@Valid) manda um texto técnico ("Validation failed..."), que a tela não mostra.
        const corpo = await resposta.json().catch(() => null);
        const erro = new Error(`Erro ${resposta.status} em ${metodo} ${caminho}`);
        erro.mensagemDoServidor = corpo && corpo.message && !corpo.message.startsWith('Validation failed')
            ? corpo.message
            : '';
        throw erro;
    }

    // Respostas sem corpo (ex: 204 No Content) não podem ser convertidas em JSON.
    const texto = await resposta.text();
    return texto ? JSON.parse(texto) : null;
}

// Sem filtros, lista todas as diaristas. Zona e serviço são opcionais (?zona=NORTE&servico=PASSAR_ROUPA).
async function buscarProfissionais(zona, servico) {
    const filtros = new URLSearchParams();
    if (zona) filtros.set('zona', zona);
    if (servico) filtros.set('servico', servico);

    const textoDosFiltros = filtros.toString();
    return requisicaoApi(`/usuarios/diaristas${textoDosFiltros ? `?${textoDosFiltros}` : ''}`);
}

async function buscarPedidos(idDiarista) {
    return requisicaoApi(`/solicitacoes/diarista/${encodeURIComponent(idDiarista)}`);
}

async function buscarSolicitacoes(idCliente) {
    return requisicaoApi(`/solicitacoes/cliente/${encodeURIComponent(idCliente)}`);
}

async function buscarTiposDeServico() {
    return requisicaoApi('/solicitacoes/tipos');
}

async function buscarDiarista(idDiarista) {
    return requisicaoApi(`/usuarios/diaristas/${encodeURIComponent(idDiarista)}`);
}

// Editar perfil: dados públicos de qualquer usuário, lista de avatares e o PUT que salva.
async function buscarUsuario(idUsuario) {
    return requisicaoApi(`/usuarios/${encodeURIComponent(idUsuario)}`);
}

async function buscarAvatares() {
    return requisicaoApi('/usuarios/avatares');
}

async function salvarPerfil(idUsuario, dados) {
    return requisicaoApi(`/usuarios/${encodeURIComponent(idUsuario)}`, 'PUT', dados);
}

async function aceitarPedido(idPedido, idDiarista) {
    return requisicaoApi(`/solicitacoes/${encodeURIComponent(idPedido)}/aceitar`, 'PATCH', {diaristaId: idDiarista});
}

async function recusarPedido(idPedido, idDiarista) {
    return requisicaoApi(`/solicitacoes/${encodeURIComponent(idPedido)}/recusar`, 'PATCH', {diaristaId: idDiarista});
}

async function concluirPedido(idPedido, idDiarista) {
    return requisicaoApi(`/solicitacoes/${encodeURIComponent(idPedido)}/concluir`, 'PATCH', {diaristaId: idDiarista});
}

async function criarSolicitacao(solicitacao) {
    return requisicaoApi('/solicitacoes', 'POST', solicitacao);
}

// ---------- Avaliações (AvaliacaoController, /avaliacoes) ----------

// Mesmo formato do AvaliacaoRequestDTO: {solicitacaoId, avaliadorId, nota, comentario}.
async function enviarAvaliacao(avaliacao) {
    return requisicaoApi('/avaliacoes', 'POST', avaliacao);
}

async function buscarAvaliacoesRecebidas(idUsuario) {
    return requisicaoApi(`/avaliacoes/usuario/${encodeURIComponent(idUsuario)}`);
}

async function buscarAvaliacoesRecentes() {
    return requisicaoApi('/avaliacoes/recentes');
}

// ---------- Chat (ChatController, /conversas) ----------

async function buscarConversas(usuarioId) {
    return requisicaoApi(`/conversas?usuarioId=${encodeURIComponent(usuarioId)}`);
}

// Cria a conversa entre o cliente e a diarista ou devolve a que já existe entre os dois.
async function criarOuAbrirConversa(clienteId, diaristaId) {
    return requisicaoApi('/conversas', 'POST', {clienteId, diaristaId});
}

// O back só devolve o histórico se usuarioId participar da conversa (senão, 403).
async function buscarMensagens(conversaId, usuarioId) {
    return requisicaoApi(`/conversas/${encodeURIComponent(conversaId)}/mensagens?usuarioId=${encodeURIComponent(usuarioId)}`);
}

async function enviarMensagem(conversaId, mensagem) {
    return requisicaoApi(`/conversas/${encodeURIComponent(conversaId)}/mensagens`, 'POST', mensagem);
}


/* ==========================================================================
 * 2. FUNÇÕES AUXILIARES
 * ======================================================================== */

// Impede que um texto vindo do back end seja interpretado como HTML.
// Sem isso, um usuário poderia cadastrar um nome contendo <script> e o código
// rodaria no navegador de outras pessoas (ataque conhecido como XSS).
// Use em todo dado externo colocado dentro de um innerHTML.
function escaparHtml(valor) {
    return String(valor)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// Faz com que apenas um elemento do grupo fique selecionado ao clicar.
function selecionarUm(seletor, classe = 'on') {
    const elementos = document.querySelectorAll(seletor);

    elementos.forEach(elemento => {
        elemento.addEventListener('click', () => {
            elementos.forEach(outro => outro.classList.remove(classe));
            elemento.classList.add(classe);
        });
    });
}

// Usuário salvo pelo login.js no localStorage, ou null se ninguém entrou.
function obterUsuarioLogado() {
    try {
        return JSON.parse(localStorage.getItem('usuario'));
    } catch {
        return null;
    }
}

// "Maria Aparecida" -> "MA"
function iniciais(nome) {
    return String(nome).trim().split(/\s+/).slice(0, 2).map(parte => parte[0]).join('').toUpperCase();
}

// Bolinha do usuário: o avatar escolhido no perfil ou, se não houver, as iniciais do nome.
// Devolve HTML pronto para usar dentro de um template, por exemplo:
//   `<div class="pro">${criarAvatar(profissional)} ...</div>`
//   criarAvatar(diarista, 'width:80px;height:80px;font-size:26px')  -> tamanho maior
// O back só guarda o código ("avatar3"); a imagem fica em img/avatares/avatar3.svg.
function criarAvatar(usuario, estilo = '') {
    const nome = usuario && usuario.nome ? usuario.nome : '?';
    const atributoEstilo = estilo ? ` style="${escaparHtml(estilo)}"` : '';

    if (usuario && usuario.avatar) {
        return `<div class="av"${atributoEstilo}>`
            + `<img src="img/avatares/${escaparHtml(usuario.avatar)}.svg" alt="Avatar de ${escaparHtml(nome)}">`
            + `</div>`;
    }

    return `<div class="av"${atributoEstilo}>${escaparHtml(iniciais(nome))}</div>`;
}

// Formata um número como dinheiro brasileiro: 150 -> "R$ 150,00".
function formatarMoeda(valor) {
    return Number(valor).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'});
}

// "2026-10-15" e "08:00:00" -> "15/10/2026 • 08:00"
function formatarDataHora(data, hora) {
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano} • ${hora.slice(0, 5)}`;
}

// "2026-10-15T14:30:00" -> "15/10/2026"
function formatarData(dataHora) {
    const [ano, mes, dia] = dataHora.slice(0, 10).split('-');
    return `${dia}/${mes}/${ano}`;
}

// "SUL" -> "Zona Sul"
function nomeDaZona(zona) {
    return `Zona ${zona.charAt(0) + zona.slice(1).toLowerCase()}`;
}

// "Carla Mendes Silva" -> "Carla M." (as avaliações públicas não mostram o nome completo de quem avaliou).
function nomeCurto(nome) {
    const partes = String(nome).trim().split(/\s+/);
    return partes.length > 1 ? `${partes[0]} ${partes[partes.length - 1][0].toUpperCase()}.` : partes[0];
}

// 4 -> "★★★★☆"
function estrelas(nota) {
    return '★'.repeat(nota) + '☆'.repeat(5 - nota);
}

// 4.666 -> "4,7"
function formatarMedia(notaMedia) {
    return notaMedia.toLocaleString('pt-BR', {minimumFractionDigits: 1, maximumFractionDigits: 1});
}

// Média vinda do back (notaMedia e totalAvaliacoes do UserResponseDTO) -> "★ 4,5 · 2 avaliações".
// Sem avaliações, notaMedia vem null.
function textoDaNota(notaMedia, totalAvaliacoes) {
    if (notaMedia === null || notaMedia === undefined) {
        return 'Sem avaliações ainda';
    }
    const total = totalAvaliacoes === 1 ? '1 avaliação' : `${totalAvaliacoes} avaliações`;
    return `★ ${formatarMedia(notaMedia)} · ${total}`;
}

// Mostra os elementos com efeito de entrada quando aparecem na tela.
function animarAoAparecer(elementos) {
    const observador = new IntersectionObserver(entradas => {
        entradas.forEach(entrada => {
            if (entrada.isIntersecting) {
                entrada.target.classList.add('in');
            }
        });
    }, {threshold: 0.15});

    elementos.forEach(elemento => observador.observe(elemento));
}


/* ==========================================================================
 * 3. HEADER E MENU
 * ======================================================================== */

/* --------------------------------------------------------------------------
 * Controle de acesso por perfil
 *
 * O perfil vem do campo "identify" do usuário salvo no localStorage pelo
 * login.js (CLIENT ou DIARIST). Cada página lista os perfis que podem abri-la.
 * Páginas em PAGINAS_PUBLICAS também abrem para quem não está logado.
 * ------------------------------------------------------------------------ */

const PERFIS_POR_PAGINA = {
    index: ['CLIENT'],
    busca: ['CLIENT'],
    perfil: ['CLIENT'],
    solicitar: ['CLIENT'],
    solicitacoes: ['CLIENT'],
    agenda: ['DIARIST'],
    mensagens: ['CLIENT', 'DIARIST'],
    editarPerfil: ['CLIENT', 'DIARIST'],
    avaliar: ['CLIENT', 'DIARIST']
};

const PAGINAS_PUBLICAS = ['index', 'login', 'cadastro'];

// Para onde mandar cada perfil quando ele tenta abrir uma tela que não é dele.
const PAGINA_INICIAL_DO_PERFIL = {
    CLIENT: 'index.html',
    DIARIST: 'agenda.html'
};

// Devolve true se a página pode ser exibida. Caso contrário, redireciona
// e devolve false (quem chamou deve parar a inicialização).
function validarAcesso(pagina) {
    const perfisPermitidos = PERFIS_POR_PAGINA[pagina];

    // login, cadastro e páginas desconhecidas não têm restrição de perfil.
    if (!perfisPermitidos) {
        return true;
    }

    const usuario = obterUsuarioLogado();

    if (!usuario) {
        if (PAGINAS_PUBLICAS.includes(pagina)) {
            return true;
        }
        window.location.replace('login.html');
        return false;
    }

    if (perfisPermitidos.includes(usuario.identify)) {
        return true;
    }

    const destino = PAGINA_INICIAL_DO_PERFIL[usuario.identify];

    if (destino) {
        window.location.replace(destino);
    } else {
        // Perfil inválido no localStorage: limpa e volta para o login.
        localStorage.removeItem('usuario');
        window.location.replace('login.html');
    }
    return false;
}

function sair() {
    localStorage.removeItem('usuario');
    window.location.href = 'login.html';
}

// Diarista vê Agenda e Mensagens; cliente (ou visitante) vê o menu da Home.
function criarHeader(usuario) {
    const ehDiarista = usuario && usuario.identify === 'DIARIST';

    const menuDiarista = `
                <a href="agenda.html" data-p="agenda">Agenda</a>
                <a href="mensagens.html" data-p="mensagens">Mensagens</a>`;

    const menuCliente = `
                <a href="solicitar.html" data-p="solicitar">Serviços</a>
                <a href="index.html#home" data-s="home">Home</a>
                <a href="index.html#vantagens" data-s="vantagens">Vantagens</a>
                <a href="index.html#profissionais" data-s="profissionais">Profissionais</a>
                <a href="index.html#avaliacoes" data-s="avaliacoes">Avaliações</a>
                ${usuario ? '<a href="mensagens.html" data-p="mensagens">Mensagens</a>' : ''}`;

    const menuConta = usuario
        ? '<a href="editar-perfil.html">Editar perfil</a><a href="#" id="sair">Sair</a>'
        : '<a href="login.html">Conectar</a><a href="cadastro.html">Criar conta</a>';

    document.body.insertAdjacentHTML('afterbegin', `
        <header>
            <a class="logo" href="${ehDiarista ? 'agenda.html' : 'index.html#home'}">🏠 conectaLar</a>
            <nav>${ehDiarista ? menuDiarista : menuCliente}
            </nav>
            <div class="menu">
                <button class="user" id="um" aria-label="Conta">👤</button>
                <div class="drop" id="dd">
                    ${menuConta}
                </div>
            </div>
        </header>
    `);
}

function configurarMenuDaConta() {
    const botaoConta = document.querySelector('#um');
    const menuConta = document.querySelector('#dd');

    const linkSair = document.querySelector('#sair');

    if (linkSair) {
        linkSair.addEventListener('click', evento => {
            evento.preventDefault();
            sair();
        });
    }

    botaoConta.addEventListener('click', evento => {
        // Sem isso, o clique também chegaria ao document, que fecha o menu.
        evento.stopPropagation();
        menuConta.classList.toggle('open');
    });

    // Fecha o menu ao clicar em qualquer lugar da página ou apertar Esc.
    document.addEventListener('click', () => menuConta.classList.remove('open'));
    document.addEventListener('keydown', evento => {
        if (evento.key === 'Escape') {
            menuConta.classList.remove('open');
        }
    });
}

// Na Home, destaca no menu o link da seção que está visível na tela.
function destacarSecaoVisivel() {
    const links = document.querySelectorAll('nav a[data-s]');
    const secoes = document.querySelectorAll('main section[id]');

    const observador = new IntersectionObserver(entradas => {
        entradas.forEach(entrada => {
            if (entrada.isIntersecting) {
                links.forEach(link => {
                    link.classList.toggle('on', link.dataset.s === entrada.target.id);
                });
            }
        });
    }, {rootMargin: '-45% 0px -50% 0px'});

    secoes.forEach(secao => observador.observe(secao));
}

// Nas outras páginas, destaca no menu o link da própria página.
function destacarPaginaAtual(pagina) {
    document.querySelectorAll('nav a').forEach(link => {
        if (link.dataset.p === pagina) {
            link.classList.add('on');
        }
    });
}


/* ==========================================================================
 * 4. PÁGINAS
 *
 * As interações são configuradas antes de buscar os dados. Assim, se a busca
 * falhar, o restante da página continua funcionando.
 * ======================================================================== */

// ---------- Home (index.html) ----------

function configurarBuscaPorZona() {
    const campoZona = document.querySelector('#zonaHome');
    const usuario = obterUsuarioLogado();

    // Cliente tem exatamente 1 zona (regra do cadastro), então ela já vem marcada.
    if (usuario && usuario.zonas && usuario.zonas.length) {
        campoZona.value = usuario.zonas[0];
    }

    document.querySelector('#go').addEventListener('click', () => {
        const filtro = campoZona.value ? `?zona=${encodeURIComponent(campoZona.value)}` : '';
        window.location.href = `busca.html${filtro}`;
    });
}

// ['SUL', 'OESTE'] -> "Zona Sul, Zona Oeste"
function textoDasZonas(zonas) {
    return (zonas || []).map(nomeDaZona).join(', ');
}

function criarCartaoProfissional(profissional) {
    return `
        <div class="card rev">
            ${criarAvatar(profissional, 'margin-bottom:10px')}
            <b>${escaparHtml(profissional.nome)}</b><br>
            <small>${escaparHtml(textoDaNota(profissional.notaMedia, profissional.totalAvaliacoes))}</small><br>
            <small>${escaparHtml(textoDasZonas(profissional.zonas))}</small>
            <a class="btn full" style="margin-top:10px" href="perfil.html?id=${escaparHtml(profissional.id)}">Ver perfil</a>
        </div>
    `;
}

// Depoimento da seção "O que dizem nossos clientes": as últimas notas dadas para diaristas.
function criarCartaoDepoimento(avaliacao) {
    const comentario = avaliacao.comentario ? `<p>“${escaparHtml(avaliacao.comentario)}”</p>` : '<p></p>';
    return `
        <div class="card rev">${estrelas(avaliacao.nota)}${comentario}
            <b>${escaparHtml(nomeCurto(avaliacao.avaliadorNome))}</b>
            <small>sobre ${escaparHtml(avaliacao.avaliadoNome)}</small>
        </div>
    `;
}

async function iniciarHome() {
    destacarSecaoVisivel();
    animarAoAparecer(document.querySelectorAll('.rev'));
    configurarBuscaPorZona();

    const [profissionais, avaliacoes] = await Promise.all([buscarProfissionais(), buscarAvaliacoesRecentes()]);
    const container = document.querySelector('#pf');
    const depoimentos = document.querySelector('#depoimentos');

    container.innerHTML = profissionais.length
        ? profissionais.map(criarCartaoProfissional).join('')
        : '<p class="rev">Nenhuma diarista cadastrada ainda.</p>';

    depoimentos.innerHTML = avaliacoes.length
        ? avaliacoes.map(criarCartaoDepoimento).join('')
        : '<p class="rev">Ainda não há avaliações. Contrate uma diarista e seja a primeira pessoa a avaliar!</p>';

    // Os cartões novos não existiam quando a animação foi configurada acima.
    animarAoAparecer(container.querySelectorAll('.rev'));
    animarAoAparecer(depoimentos.querySelectorAll('.rev'));
}

// ---------- Busca (busca.html) ----------

function criarItemDaBusca(profissional, indice) {
    // O primeiro profissional da lista já começa selecionado.
    const classeSelecionado = indice === 0 ? 'on' : '';

    return `
        <div class="pro ${classeSelecionado}">
            ${criarAvatar(profissional)}
            <div>
                <b>${escaparHtml(profissional.nome)}</b><br>
                <small>${escaparHtml(textoDaNota(profissional.notaMedia, profissional.totalAvaliacoes))}</small><br>
                <small>${escaparHtml(textoDasZonas(profissional.zonas))}</small>
            </div>
            <a class="btn" href="perfil.html?id=${escaparHtml(profissional.id)}">Ver perfil</a>
        </div>
    `;
}

async function carregarBusca(zona, servico) {
    const profissionais = await buscarProfissionais(zona, servico);

    document.querySelector('#lista').innerHTML = profissionais.length
        ? profissionais.map(criarItemDaBusca).join('')
        : '<p>Nenhuma diarista encontrada.</p>';
    document.querySelector('#n').textContent = profissionais.length;

    selecionarUm('.pro');
    return profissionais;
}

// Pinta a zona escolhida no mapa. Zona vazia = todas: acende o botão "Todas as zonas".
function destacarZonaNoMapa(zona) {
    document.querySelectorAll('.zona').forEach(area => {
        area.classList.toggle('on', area.dataset.zona === zona);
    });
    document.querySelector('.zona-todas').classList.toggle('on', zona === '');
}

// Faz um elemento do mapa responder ao clique e ao teclado (Enter ou espaço), como um botão.
function aoAcionar(elemento, acao) {
    elemento.addEventListener('click', acao);
    elemento.addEventListener('keydown', evento => {
        if (evento.key === 'Enter' || evento.key === ' ') {
            evento.preventDefault();
            acao();
        }
    });
}

// Mostra em cada zona do mapa quantas diaristas atendem nela.
function contarDiaristasPorZona(profissionais) {
    document.querySelectorAll('.zona').forEach(area => {
        const total = profissionais.filter(p => (p.zonas || []).includes(area.dataset.zona)).length;
        area.querySelector('.qtd').textContent = `${total} diarista${total === 1 ? '' : 's'}`;
    });
}

async function iniciarBusca() {
    // A zona é escolhida pelo mapa e o serviço pelo select. '' = sem filtro.
    let zonaAtual = '';
    let servicoAtual = '';

    function filtrarPorZona(zona) {
        zonaAtual = zona;
        destacarZonaNoMapa(zona);
        carregarBusca(zonaAtual, servicoAtual);
    }

    // Trocar o serviço muda também quantas diaristas cada zona do mapa tem.
    async function filtrarPorServico(servico) {
        servicoAtual = servico;
        contarDiaristasPorZona(await buscarProfissionais('', servicoAtual));
        carregarBusca(zonaAtual, servicoAtual);
    }

    // Clicar numa zona filtra; clicar de novo na zona já destacada volta para todas.
    document.querySelectorAll('.zona').forEach(area => {
        aoAcionar(area, () => filtrarPorZona(zonaAtual === area.dataset.zona ? '' : area.dataset.zona));
    });

    // Botão "Todas as zonas", dentro do próprio mapa.
    aoAcionar(document.querySelector('.zona-todas'), () => filtrarPorZona(''));
    destacarZonaNoMapa('');

    // Os tipos vêm do back (mesmo endpoint da tela Solicitar), com a opção "Todos os serviços" na frente.
    const campoServico = document.querySelector('#filtroServico');
    campoServico.addEventListener('change', () => filtrarPorServico(campoServico.value));
    buscarTiposDeServico().then(tipos => {
        preencherTiposDeServico(campoServico, tipos);
        campoServico.insertAdjacentHTML('afterbegin', '<option value="">Todos os serviços</option>');
        campoServico.value = '';
    });

    // A primeira carga traz todas as diaristas, então serve também para as contagens do mapa.
    contarDiaristasPorZona(await carregarBusca('', ''));

    // Vindo da Home com ?zona=NORTE, já aplica o filtro. Zona que não existe no mapa é ignorada.
    const zonaDaUrl = new URLSearchParams(window.location.search).get('zona');
    const zonasDoMapa = [...document.querySelectorAll('.zona')].map(area => area.dataset.zona);
    if (zonaDaUrl && zonasDoMapa.includes(zonaDaUrl)) {
        filtrarPorZona(zonaDaUrl);
    }
}

// ---------- Perfil (perfil.html) ----------

const TAMANHO_AVATAR_PERFIL = 'width:80px;height:80px;font-size:26px';

// Tags de serviço com o preço, que vem do enum TipoServico pelo GET /solicitacoes/tipos.
function criarTagsDeServico(codigos, tipos) {
    return tipos
        .filter(tipo => (codigos || []).includes(tipo.codigo))
        .map(tipo => `<span class="tag">${escaparHtml(tipo.descricao)} · ${escaparHtml(formatarMoeda(tipo.valor))}</span>`)
        .join('');
}

function criarItemDeAvaliacao(avaliacao) {
    const comentario = avaliacao.comentario ? ` ${escaparHtml(avaliacao.comentario)}` : '';
    return `
        <p>
            <b>${escaparHtml(nomeCurto(avaliacao.avaliadorNome))}</b> ${estrelas(avaliacao.nota)}${comentario}<br>
            <small>${escaparHtml(formatarData(avaliacao.criadaEm))}</small>
        </p>
    `;
}

function preencherPerfil(diarista, tipos, avaliacoes) {
    document.querySelector('#nomeDiarista').textContent = diarista.nome;
    document.querySelector('#avDiarista').innerHTML = criarAvatar(diarista, TAMANHO_AVATAR_PERFIL);
    document.querySelector('#notaDiarista').textContent = textoDaNota(diarista.notaMedia, diarista.totalAvaliacoes);
    document.querySelector('#sobreDiarista').textContent = diarista.sobre || 'Sem descrição ainda.';

    const zonas = (diarista.zonas || []).map(zona => `<span class="tag">${escaparHtml(nomeDaZona(zona))}</span>`).join('');
    document.querySelector('#zonasDiarista').innerHTML = zonas || '<small>Nenhuma zona informada.</small>';

    const servicos = criarTagsDeServico(diarista.servicos, tipos);
    document.querySelector('#servicosDiarista').innerHTML = servicos || '<small>Nenhum serviço cadastrado ainda.</small>';

    document.querySelector('#avaliacoesDiarista').innerHTML = avaliacoes.length
        ? avaliacoes.map(criarItemDeAvaliacao).join('')
        : '<p>Ainda não há avaliações.</p>';
}

async function iniciarPerfil() {
    // Leva o id da profissional (perfil.html?id=3) para a tela de solicitação.
    const idDiarista = new URLSearchParams(window.location.search).get('id');
    const botaoAgendar = document.querySelector('#agendar');

    botaoAgendar.addEventListener('click', () => {
        window.location.href = `solicitar.html?diarista=${encodeURIComponent(idDiarista ?? '')}`;
    });

    configurarBotaoMensagem(idDiarista);

    const campoNome = document.querySelector('#nomeDiarista');
    const avatar = document.querySelector('#avDiarista');

    try {
        if (!idDiarista) {
            throw new Error('Perfil aberto sem id da diarista');
        }
        // As três buscas são independentes, então rodam ao mesmo tempo.
        const [diarista, tipos, avaliacoes] = await Promise.all([
            buscarDiarista(idDiarista),
            buscarTiposDeServico(),
            buscarAvaliacoesRecebidas(idDiarista)
        ]);
        preencherPerfil(diarista, tipos, avaliacoes);
    } catch (falha) {
        console.error(falha);
        campoNome.textContent = 'Diarista não encontrada';
        avatar.innerHTML = criarAvatar(null, TAMANHO_AVATAR_PERFIL);
        botaoAgendar.disabled = true;

        const botaoMensagem = document.querySelector('#enviarMensagem');
        if (botaoMensagem) {
            botaoMensagem.disabled = true;
        }
    }
}

// Botão "Enviar mensagem" do perfil:
// - cliente logado: cria (ou reaproveita) a conversa com a diarista e abre mensagens.html?conversa=ID;
// - sem login: vai para o login;
// - diarista vendo o perfil: o botão some, porque diarista não conversa com outra diarista.
function configurarBotaoMensagem(idDiarista) {
    const botao = document.querySelector('#enviarMensagem');
    const usuario = obterUsuarioLogado();

    if (usuario && usuario.identify === 'DIARIST') {
        botao.remove();
        return;
    }

    botao.addEventListener('click', async () => {
        if (!usuario) {
            window.location.href = 'login.html';
            return;
        }

        botao.disabled = true;
        try {
            const conversa = await criarOuAbrirConversa(usuario.id, Number(idDiarista));
            window.location.href = `mensagens.html?conversa=${encodeURIComponent(conversa.id)}`;
        } catch (falha) {
            console.error(falha);
            alert('Não foi possível abrir a conversa. Tente novamente.');
            botao.disabled = false;
        }
    });
}

// ---------- Agenda (agenda.html) ----------

// Pendente: a diarista decide (aceitar ou recusar). Aceito: falta marcar como concluído,
// o que só vale a partir do dia do serviço (o back também confere e devolve 409).
// Recusado e concluído: não há mais nada a fazer, então mostra só a tag.
function criarAcoesDoPedido(pedido) {
    // Pendente com data vencida não pode mais ser aceito (o back devolve 409), só recusado.
    if (pedido.status === 'PENDENTE' && pedido.data < dataDeHoje()) {
        return `
            <span class="tag w">Data já passou</span><br>
            <button class="btn out rec">Recusar</button>
        `;
    }

    if (pedido.status === 'PENDENTE') {
        return `
            <button class="btn out rec">Recusar</button>
            <button class="btn ac">Aceitar</button>
        `;
    }

    const exibicao = EXIBICAO_DO_STATUS[pedido.status];
    const tag = `<span class="tag ${exibicao.classe}">${exibicao.texto}</span>`;

    // As datas estão no formato AAAA-MM-DD, então comparar como texto já compara como data.
    if (pedido.status === 'ACEITA' && pedido.data <= dataDeHoje()) {
        return `${tag}<br><button class="btn conc">Concluir</button>`;
    }

    // Concluído: a diarista pode avaliar o cliente (é um link, então o clique não passa por tratarCliqueNoPedido).
    return tag + criarAcaoDeAvaliar(pedido, 'Avaliar cliente');
}

function criarCartaoPedido(pedido) {
    const observacoes = pedido.observacoes
        ? `<br><small>Obs.: ${escaparHtml(pedido.observacoes)}</small>`
        : '';
    // Nota que outras diaristas deram para esse cliente (null se ele ainda não foi avaliado).
    const notaCliente = pedido.notaCliente !== null && pedido.notaCliente !== undefined
        ? ` · ★ ${escaparHtml(formatarMedia(pedido.notaCliente))}`
        : '';

    return `
        <div class="req" data-id="${escaparHtml(pedido.id)}">
            <div>
                <b>${escaparHtml(pedido.titulo)}</b><br>
                <small>Cliente: ${escaparHtml(pedido.cliente)}${notaCliente}</small><br>
                <small>${escaparHtml(formatarDataHora(pedido.data, pedido.hora))} · ${escaparHtml(pedido.endereco)}</small>
                ${observacoes}
            </div>
            <div>
                <b>${escaparHtml(formatarMoeda(pedido.valor))}</b><br>
                ${criarAcoesDoPedido(pedido)}
            </div>
        </div>
    `;
}

// Estado da tela: os pedidos que vieram do back, o filtro escolhido e o dia aberto no calendário.
// A tela é sempre redesenhada a partir daqui, então lista, contador e calendário nunca discordam.
const agenda = {
    pedidos: [],
    filtro: '',
    diaSelecionado: ''
};

const DIAS_DA_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const DIAS_NO_CALENDARIO = 7;

// Pendentes primeiro (pedem resposta), depois o que está marcado e, por último, o que já acabou.
const ORDEM_DO_STATUS = {PENDENTE: 0, ACEITA: 1, CONCLUIDA: 2, RECUSADA: 3};

// Só serviço confirmado ocupa a agenda. Pendente ainda pode ser recusado; recusado não acontece.
const STATUS_NO_CALENDARIO = ['ACEITA', 'CONCLUIDA'];

// Date -> "2026-11-28" no fuso do usuário. (toISOString usa UTC e à noite cairia no dia seguinte.)
function paraDataIso(data) {
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    return `${data.getFullYear()}-${mes}-${dia}`;
}

// Texto da lista vazia de acordo com o filtro escolhido (a chave vazia é o filtro "Todos").
const MENSAGEM_SEM_PEDIDOS = {
    '': 'Você ainda não recebeu pedidos.',
    PENDENTE: 'Nenhum pedido aguardando sua resposta.',
    ACEITA: 'Nenhum serviço aceito no momento.',
    CONCLUIDA: 'Nenhum serviço concluído ainda.',
    RECUSADA: 'Nenhum pedido recusado.'
};

// 0 -> "nenhum pedido novo", 1 -> "1 pedido novo", 3 -> "3 pedidos novos"
function textoDePedidosNovos(quantidade) {
    if (quantidade === 0) return 'nenhum pedido novo';
    if (quantidade === 1) return '1 pedido novo';
    return `${quantidade} pedidos novos`;
}

// Conta pelos dados, e não pelos botões na tela: com um filtro ativo, os pendentes podem estar escondidos.
function atualizarContadorDePedidos() {
    const pendentes = agenda.pedidos.filter(pedido => pedido.status === 'PENDENTE');
    document.querySelector('#novos').textContent = textoDePedidosNovos(pendentes.length);
}

function desenharPedidos() {
    const container = document.querySelector('#pedidos');

    // filter() devolve uma lista nova, então o sort() não bagunça a ordem guardada em agenda.pedidos.
    const visiveis = agenda.pedidos
        .filter(pedido => !agenda.filtro || pedido.status === agenda.filtro)
        .sort((a, b) => ORDEM_DO_STATUS[a.status] - ORDEM_DO_STATUS[b.status]);

    container.innerHTML = visiveis.length
        ? visiveis.map(criarCartaoPedido).join('')
        : `<p>${MENSAGEM_SEM_PEDIDOS[agenda.filtro]}</p>`;
}

function compromissosDoDia(dataIso) {
    return agenda.pedidos
        .filter(pedido => pedido.data === dataIso && STATUS_NO_CALENDARIO.includes(pedido.status))
        .sort((a, b) => a.hora.localeCompare(b.hora));
}

// Monta os próximos 7 dias a partir de hoje. O "•" marca os dias que têm serviço.
function desenharDias() {
    const hoje = new Date();
    let html = '';

    for (let i = 0; i < DIAS_NO_CALENDARIO; i++) {
        // new Date(ano, mes, dia + i) já vira o mês sozinho (31/11 + 1 = 01/12).
        const dia = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + i);
        const dataIso = paraDataIso(dia);
        const selecionado = dataIso === agenda.diaSelecionado ? ' on' : '';
        const marca = compromissosDoDia(dataIso).length ? '•' : '&nbsp;';

        html += `
            <div class="day${selecionado}" data-data="${dataIso}">
                <small>${DIAS_DA_SEMANA[dia.getDay()]}</small><br>
                ${String(dia.getDate()).padStart(2, '0')}<br>
                <span style="line-height:1">${marca}</span>
            </div>
        `;
    }

    document.querySelector('#dias').innerHTML = html;
}

function desenharCompromissos() {
    const container = document.querySelector('#compromissos');
    const compromissos = compromissosDoDia(agenda.diaSelecionado);

    if (compromissos.length === 0) {
        container.innerHTML = '<p>Nenhum serviço neste dia.</p>';
        return;
    }

    container.innerHTML = compromissos.map(pedido => {
        const concluido = pedido.status === 'CONCLUIDA' ? ' <span class="tag ok">Concluído</span>' : '';
        return `
            <p>
                <b>${escaparHtml(pedido.hora.slice(0, 5))}</b>
                <span class="tag">${escaparHtml(pedido.titulo)}</span>${concluido}<br>
                <small>${escaparHtml(pedido.cliente)} · ${escaparHtml(pedido.endereco)}</small>
            </p>
        `;
    }).join('');
}

function desenharAgenda() {
    desenharDias();
    desenharCompromissos();
}

function redesenharTudo() {
    desenharPedidos();
    atualizarContadorDePedidos();
    desenharAgenda();
}

async function tratarCliqueNoPedido(evento) {
    const botao = evento.target.closest('button');
    const cartao = evento.target.closest('.req');

    if (!botao || !cartao) {
        return;
    }

    // Guarda a função do back que cada botão chama; ela é executada lá embaixo.
    let acao;
    if (botao.classList.contains('rec')) {
        acao = recusarPedido;
    } else if (botao.classList.contains('ac')) {
        acao = aceitarPedido;
    } else if (botao.classList.contains('conc')) {
        acao = concluirPedido;
    } else {
        return;
    }

    // Evita mandar a mesma ação duas vezes com cliques repetidos.
    botao.disabled = true;

    try {
        const pedidoAtualizado = await acao(cartao.dataset.id, obterUsuarioLogado().id);

        // Troca o pedido antigo pelo que o back devolveu e redesenha tudo: lista, contador e calendário.
        agenda.pedidos = agenda.pedidos.map(pedido =>
            pedido.id === pedidoAtualizado.id ? pedidoAtualizado : pedido);
        redesenharTudo();
    } catch (falha) {
        console.error(falha);
        botao.disabled = false;
        alert('Não foi possível atualizar o pedido. Tente novamente.');
    }
}

async function iniciarAgenda() {
    const container = document.querySelector('#pedidos');
    const usuario = obterUsuarioLogado();

    if (!usuario) {
        container.innerHTML = '<p>Entre na sua conta para ver seus pedidos.</p>';
        return;
    }

    // "Maria Diarista" -> "Maria"
    document.querySelector('#nomeDiarista').textContent = usuario.nome.trim().split(/\s+/)[0];
    agenda.diaSelecionado = dataDeHoje();

    // Um único listener no container atende aos botões de todos os pedidos,
    // inclusive os que ainda serão criados (técnica chamada delegação de eventos).
    container.addEventListener('click', tratarCliqueNoPedido);

    // Os dias também são recriados a cada desenho, então usam a mesma técnica.
    document.querySelector('#dias').addEventListener('click', evento => {
        const dia = evento.target.closest('.day');
        if (dia) {
            agenda.diaSelecionado = dia.dataset.data;
            desenharAgenda();
        }
    });

    selecionarUm('#filtroPedidos .chip');
    document.querySelectorAll('#filtroPedidos .chip').forEach(chip => {
        chip.addEventListener('click', () => {
            agenda.filtro = chip.dataset.status;
            desenharPedidos();
        });
    });

    // O calendário aparece logo, mesmo antes de os pedidos chegarem do back.
    desenharAgenda();

    try {
        agenda.pedidos = await buscarPedidos(usuario.id);
    } catch (falha) {
        console.error(falha);
        container.innerHTML = '<p>Não foi possível carregar seus pedidos. Tente novamente.</p>';
        return;
    }

    redesenharTudo();
}

// ---------- Minhas solicitações (solicitacoes.html) ----------

// O back end envia só o status, como um enum do Java. A tela decide como exibi-lo.
const EXIBICAO_DO_STATUS = {
    PENDENTE: {texto: 'Aguardando confirmação', classe: 'w'},
    ACEITA: {texto: 'Confirmado', classe: 'ok'},
    RECUSADA: {texto: 'Recusado', classe: ''},
    CONCLUIDA: {texto: 'Concluído', classe: 'ok'}
};

// Liga o texto de cada filtro da tela ao status correspondente.
// "Todas" fica de fora de propósito: sem status, exibirSolicitacoes mostra a lista inteira.
const STATUS_DO_FILTRO = {
    Pendentes: 'PENDENTE',
    Aceitas: 'ACEITA',
    'Concluídas': 'CONCLUIDA',
    Recusadas: 'RECUSADA'
};

// Texto da lista vazia de acordo com o chip escolhido.
const MENSAGEM_SEM_SOLICITACOES = {
    Todas: 'Você ainda não fez nenhuma solicitação.',
    Pendentes: 'Nenhuma solicitação aguardando confirmação.',
    Aceitas: 'Nenhuma solicitação aceita no momento.',
    'Concluídas': 'Nenhuma solicitação concluída ainda.',
    Recusadas: 'Nenhuma solicitação recusada.'
};

// Serviço concluído pode ser avaliado uma vez (o back confere de novo e devolve 409 se repetir).
// Usado na lista da cliente e na Agenda da diarista.
function criarAcaoDeAvaliar(solicitacao, textoDoBotao) {
    if (solicitacao.status !== 'CONCLUIDA') {
        return '';
    }
    if (solicitacao.jaAvaliada) {
        return ' <span class="tag">Você já avaliou</span>';
    }
    return `<br><a class="btn" style="margin-top:8px" href="avaliar.html?solicitacao=${escaparHtml(solicitacao.id)}">${textoDoBotao}</a>`;
}

function criarCartaoSolicitacao(solicitacao) {
    const exibicao = EXIBICAO_DO_STATUS[solicitacao.status];

    return `
        <div class="card" style="margin-bottom:14px">
            <b>${escaparHtml(solicitacao.titulo)}</b><br>
            Diarista: ${escaparHtml(solicitacao.diarista)}<br>
            ${escaparHtml(formatarDataHora(solicitacao.data, solicitacao.hora))} · ${escaparHtml(formatarMoeda(solicitacao.valor))}<br>
            <span class="tag ${exibicao.classe}">${exibicao.texto}</span>${criarAcaoDeAvaliar(solicitacao, 'Avaliar diarista')}
        </div>
    `;
}

function exibirSolicitacoes(solicitacoes, filtro) {
    const container = document.querySelector('#sol');
    const statusDesejado = STATUS_DO_FILTRO[filtro];

    // O filtro "Todas" não tem status correspondente, então mostra a lista inteira.
    const filtradas = statusDesejado
        ? solicitacoes.filter(solicitacao => solicitacao.status === statusDesejado)
        : solicitacoes;

    if (filtradas.length === 0) {
        container.innerHTML = `<p>${MENSAGEM_SEM_SOLICITACOES[filtro] ?? 'Nada por aqui.'}</p>`;
        return;
    }

    container.innerHTML = filtradas.map(criarCartaoSolicitacao).join('');
}

async function iniciarSolicitacoes() {
    selecionarUm('.chip');

    const usuario = obterUsuarioLogado();

    if (!usuario) {
        document.querySelector('#sol').innerHTML = '<p>Entre na sua conta para ver suas solicitações.</p>';
        return;
    }

    const solicitacoes = await buscarSolicitacoes(usuario.id);

    exibirSolicitacoes(solicitacoes, 'Todas');

    document.querySelectorAll('.chip').forEach(chip => {
        // trim(): se alguém quebrar a linha do chip no HTML, os espaços não podem estragar a busca no mapa.
        chip.addEventListener('click', () => exibirSolicitacoes(solicitacoes, chip.textContent.trim()));
    });
}

// ---------- Solicitar serviço (solicitar.html) ----------

// A diarista chega pela URL: solicitar.html?diarista=3 (vem do botão "Agendar diária" do perfil).
// O valor mostrado aqui é só uma estimativa: o back end recalcula o preço ao salvar.

// Data de hoje no formato do <input type="date"> (AAAA-MM-DD), no fuso do usuário.
function dataDeHoje() {
    return paraDataIso(new Date());
}

function preencherTiposDeServico(select, tipos) {
    select.innerHTML = tipos
        .map(tipo => `<option value="${escaparHtml(tipo.codigo)}">${escaparHtml(tipo.descricao)}</option>`)
        .join('');
}

function atualizarResumoDoPedido(select, tipos) {
    const tipoEscolhido = tipos.find(tipo => tipo.codigo === select.value);

    document.querySelector('#rs').textContent = tipoEscolhido ? tipoEscolhido.descricao : '';
    document.querySelector('#rv').textContent = tipoEscolhido ? formatarMoeda(tipoEscolhido.valor) : '';
}

// Devolve a diarista vinda do back, ou null se não veio id na URL ou ela não existe.
async function carregarDiarista(idDiarista) {
    const campoNome = document.querySelector('#rp');

    if (!idDiarista) {
        campoNome.textContent = 'Não selecionada';
        return null;
    }

    try {
        const diarista = await buscarDiarista(idDiarista);
        campoNome.textContent = diarista.nome;
        return diarista;
    } catch (falha) {
        console.error(falha);
        campoNome.textContent = 'Não encontrada';
        return null;
    }
}

// Devolve a mensagem do primeiro problema encontrado, ou uma string vazia se estiver tudo certo.
function validarSolicitacao(campos) {
    if (!campos.data.value) return 'Informe a data do serviço.';
    if (campos.data.value < dataDeHoje()) return 'A data não pode estar no passado.';
    if (!campos.hora.value) return 'Informe o horário do serviço.';
    if (!campos.end.value.trim()) return 'Informe o endereço.';
    return '';
}

function iniciarSolicitar() {
    // Esta tela é só da cliente. Quem não entrou vai para o login e a diarista vai para a agenda dela.
    const usuario = obterUsuarioLogado();

    if (!usuario) {
        alert('Entre na sua conta para solicitar um serviço.');
        window.location.href = 'login.html';
        return;
    }

    if (usuario.identify !== 'CLIENT') {
        window.location.href = 'agenda.html';
        return;
    }

    const campos = document.querySelector('#f');
    const mensagemErro = document.querySelector('#erroSolicitar');
    const botaoEnviar = document.querySelector('#enviar');
    const idDiarista = new URLSearchParams(window.location.search).get('diarista');
    let tipos = [];
    let diaristaValida = false;

    campos.data.min = dataDeHoje();

    // "Cancelar" volta para a página anterior (normalmente o perfil da diarista).
    document.querySelector('#cancel').addEventListener('click', () => {
        if (history.length > 1) {
            history.back();
        } else {
            window.location.href = 'index.html';
        }
    });

    campos.tipo.addEventListener('change', () => atualizarResumoDoPedido(campos.tipo, tipos));

    // "Aceitar pedido" envia o formulário.
    campos.addEventListener('submit', async evento => {
        // Impede o navegador de recarregar a página ao enviar o formulário.
        evento.preventDefault();

        if (!diaristaValida) {
            mensagemErro.textContent = 'Escolha uma profissional pelo perfil antes de solicitar.';
            return;
        }

        mensagemErro.textContent = validarSolicitacao(campos);
        if (mensagemErro.textContent) {
            return;
        }

        // Evita pedidos duplicados com cliques repetidos.
        botaoEnviar.disabled = true;

        try {
            await criarSolicitacao({
                clienteId: usuario.id,
                diaristaId: Number(idDiarista),
                tipoServico: campos.tipo.value,
                data: campos.data.value,
                hora: campos.hora.value,
                endereco: campos.end.value.trim(),
                observacoes: campos.obs.value.trim()
            });
            alert('Pedido enviado! A diarista vai receber sua solicitação.');
            window.location.href = 'solicitacoes.html';
        } catch (falha) {
            console.error(falha);
            mensagemErro.textContent = falha.mensagemDoServidor || 'Não foi possível enviar o pedido. Tente novamente.';
            botaoEnviar.disabled = false;
        }
    });

    // As duas buscas são independentes, então rodam ao mesmo tempo.
    return Promise.all([buscarTiposDeServico(), carregarDiarista(idDiarista)])
        .then(([todosOsTipos, diarista]) => {
            diaristaValida = diarista !== null;

            // Só os serviços que a diarista oferece. O back confere de novo ao salvar.
            tipos = diarista
                ? todosOsTipos.filter(tipo => (diarista.servicos || []).includes(tipo.codigo))
                : todosOsTipos;

            if (diarista && tipos.length === 0) {
                botaoEnviar.disabled = true;
                mensagemErro.textContent = 'Essa diarista ainda não escolheu os serviços que oferece.';
            }

            preencherTiposDeServico(campos.tipo, tipos);
            atualizarResumoDoPedido(campos.tipo, tipos);
        });
}

// ---------- Mensagens (mensagens.html) ----------

// Estado da tela de chat: quem está logado, qual conversa está aberta e
// quantas mensagens já foram desenhadas (para só redesenhar quando mudar).
const chat = {
    usuario: null,
    conversaAtual: null,
    totalMensagens: -1
};

// Se eu sou o cliente, mostra o nome da diarista, e vice-versa.
function nomeDoOutro(conversa) {
    return conversa.clienteId === chat.usuario.id ? conversa.diaristaNome : conversa.clienteNome;
}

// Mensagens enviadas pelo usuário logado ganham a classe "me" (balão à direita).
function desenharMensagens(mensagens) {
    const lista = document.querySelector('#msgs');

    lista.innerHTML = mensagens.map(m => {
        const classe = m.remetenteId === chat.usuario.id ? 'm me' : 'm';
        return `<div class="${classe}">${escaparHtml(m.conteudo)}</div>`;
    }).join('');

    // Rola a conversa até a mensagem mais recente.
    lista.scrollTop = lista.scrollHeight;
}

async function carregarMensagens() {
    if (!chat.conversaAtual) {
        return;
    }

    try {
        const mensagens = await buscarMensagens(chat.conversaAtual, chat.usuario.id);

        if (mensagens.length !== chat.totalMensagens) {
            chat.totalMensagens = mensagens.length;
            desenharMensagens(mensagens);
        }
    } catch (falha) {
        console.error(falha);
    }
}

async function abrirConversa(conversaId, elemento) {
    document.querySelectorAll('#contatos div').forEach(div => div.classList.remove('on'));
    elemento.classList.add('on');

    chat.conversaAtual = conversaId;
    chat.totalMensagens = -1;
    await carregarMensagens();
}

// conversaParaAbrir vem da URL (mensagens.html?conversa=5); sem ela, abre a primeira da lista.
async function desenharContatos(conversaParaAbrir) {
    const contatos = document.querySelector('#contatos');
    const conversas = await buscarConversas(chat.usuario.id);

    if (conversas.length === 0) {
        contatos.innerHTML = '<div>Nenhuma conversa ainda</div>';
        return;
    }

    contatos.innerHTML = conversas.map(c => {
        const nome = nomeDoOutro(c);
        return `<div data-id="${c.id}"><span class="av">${escaparHtml(iniciais(nome))}</span>${escaparHtml(nome)}</div>`;
    }).join('');

    contatos.querySelectorAll('div').forEach(div => {
        div.addEventListener('click', () => abrirConversa(Number(div.dataset.id), div));
    });

    // Abre a conversa pedida na URL; se ela não estiver na lista (ou não veio), abre a primeira.
    const pedida = conversaParaAbrir
        ? contatos.querySelector(`div[data-id="${CSS.escape(conversaParaAbrir)}"]`)
        : null;
    const alvo = pedida || contatos.querySelector('div');
    await abrirConversa(Number(alvo.dataset.id), alvo);
}

async function enviarTextoDoCampo() {
    const campoTexto = document.querySelector('#txt');
    const texto = campoTexto.value.trim();

    if (!texto) {
        return;
    }

    // Sem conversa aberta, a mensagem não tem para onde ir.
    if (!chat.conversaAtual) {
        alert('Você ainda não tem uma conversa aberta. Escolha um contato na lista.');
        return;
    }

    try {
        // Mesmo formato do MensagemRequestDTO do Spring.
        await enviarMensagem(chat.conversaAtual, {
            remetenteId: chat.usuario.id,
            conteudo: texto
        });
        campoTexto.value = '';
        await carregarMensagens();
    } catch (falha) {
        console.error(falha);
        alert('Não foi possível enviar a mensagem. Tente novamente.');
    }
}

async function iniciarMensagens() {
    chat.usuario = obterUsuarioLogado();

    if (!chat.usuario) {
        window.location.href = 'login.html';
        return;
    }

    document.querySelector('#msgs').innerHTML = '';
    document.querySelector('#enviar').addEventListener('click', enviarTextoDoCampo);
    document.querySelector('#txt').addEventListener('keydown', evento => {
        if (evento.key === 'Enter') {
            enviarTextoDoCampo();
        }
    });

    // Vindo do botão "Enviar mensagem" do perfil, a URL traz qual conversa abrir.
    const conversaDaUrl = new URLSearchParams(window.location.search).get('conversa');
    await desenharContatos(conversaDaUrl);

    // Busca mensagens novas a cada 3 segundos (as que a outra pessoa mandar).
    setInterval(carregarMensagens, 3000);
}

// ---------- Editar perfil (editar-perfil.html) ----------

// Tamanho das bolinhas na escolha de avatar e na prévia.
const TAMANHO_OPCAO_AVATAR = 'width:56px;height:56px;margin:auto';
const TAMANHO_PREVIA_AVATAR = 'width:72px;height:72px;font-size:24px';

// Uma opção "sem avatar" (mostra as iniciais) e uma para cada código vindo do back.
function criarOpcoesDeAvatar(codigos, nome) {
    return ['', ...codigos].map(codigo => `
        <label class="role-opt">
            <input type="radio" name="avatar" value="${escaparHtml(codigo)}">
            <span>${criarAvatar({nome, avatar: codigo}, TAMANHO_OPCAO_AVATAR)}</span>
        </label>
    `).join('');
}

// Um checkbox para cada tipo de serviço (mesmo endpoint da tela Solicitar).
function criarOpcoesDeServico(tipos) {
    return tipos.map(tipo => `
        <label class="role-opt">
            <input type="checkbox" name="servico" value="${escaparHtml(tipo.codigo)}">
            <span>${escaparHtml(tipo.descricao)}</span>
        </label>
    `).join('');
}

// Valores dos checkboxes marcados com esse name. Ex: valoresMarcados(form, 'zona') -> ['SUL', 'OESTE']
function valoresMarcados(form, nome) {
    return [...form.querySelectorAll(`input[name="${nome}"]:checked`)].map(campo => campo.value);
}

// Marca os checkboxes cujo valor está na lista (usado para carregar o que já está salvo).
function marcarValores(form, nome, valores) {
    form.querySelectorAll(`input[name="${nome}"]`).forEach(campo => {
        campo.checked = (valores || []).includes(campo.value);
    });
}

// As mesmas regras do back, para avisar antes de enviar. O back confere de novo de qualquer jeito.
function validarPerfil(dados, ehDiarista) {
    if (dados.sobre.length > 500) return 'O texto Sobre pode ter no máximo 500 caracteres.';
    if (dados.zonas.length === 0) return 'Escolha pelo menos uma zona.';
    if (ehDiarista && dados.servicos.length === 0) return 'Escolha pelo menos um serviço.';
    return '';
}

async function iniciarEditarPerfil() {
    // validarAcesso já garantiu que tem alguém logado.
    const usuarioLogado = obterUsuarioLogado();
    const ehDiarista = usuarioLogado.identify === 'DIARIST';

    const form = document.querySelector('#formPerfil');
    const mensagemErro = document.querySelector('#erroPerfil');
    const mensagemSucesso = document.querySelector('#sucessoPerfil');
    const botaoSalvar = document.querySelector('#salvar');
    const contador = document.querySelector('#contadorSobre');
    const previa = document.querySelector('#previaAvatar');
    const campoSobre = document.querySelector('#sobre');
    const campoZonaCliente = document.querySelector('#zonaCliente');

    // Cada perfil vê só os campos dele.
    document.querySelector(ehDiarista ? '#camposDiarista' : '#camposCliente').hidden = false;

    function avatarEscolhido() {
        const marcado = form.querySelector('input[name="avatar"]:checked');
        return marcado && marcado.value ? marcado.value : null;
    }

    function atualizarPrevia() {
        previa.innerHTML = criarAvatar({nome: usuarioLogado.nome, avatar: avatarEscolhido()}, TAMANHO_PREVIA_AVATAR);
    }

    function atualizarContador() {
        contador.textContent = `${campoSobre.value.length}/500`;
    }

    campoSobre.addEventListener('input', atualizarContador);

    form.addEventListener('change', evento => {
        if (evento.target.name === 'avatar') {
            atualizarPrevia();
        }
    });

    form.addEventListener('submit', async evento => {
        evento.preventDefault();
        mensagemSucesso.textContent = '';

        const dados = {
            usuarioLogadoId: usuarioLogado.id,
            sobre: campoSobre.value.trim(),
            avatar: avatarEscolhido(),
            zonas: ehDiarista ? valoresMarcados(form, 'zona') : [campoZonaCliente.value],
            servicos: ehDiarista ? valoresMarcados(form, 'servico') : []
        };

        mensagemErro.textContent = validarPerfil(dados, ehDiarista);
        if (mensagemErro.textContent) {
            return;
        }

        botaoSalvar.disabled = true;

        try {
            const usuarioAtualizado = await salvarPerfil(usuarioLogado.id, dados);
            // A resposta do PUT tem os dados completos: substitui o usuário salvo no login.
            localStorage.setItem('usuario', JSON.stringify(usuarioAtualizado));
            mensagemSucesso.textContent = 'Perfil salvo!';
        } catch (falha) {
            console.error(falha);
            mensagemErro.textContent = 'Não foi possível salvar o perfil. Tente novamente.';
        } finally {
            botaoSalvar.disabled = false;
        }
    });

    // As buscas são independentes, então rodam ao mesmo tempo. A cliente não precisa dos tipos de serviço.
    const [usuario, avatares, tipos] = await Promise.all([
        buscarUsuario(usuarioLogado.id),
        buscarAvatares(),
        ehDiarista ? buscarTiposDeServico() : []
    ]);

    document.querySelector('#nomeUsuario').textContent = usuario.nome;
    document.querySelector('#tipoUsuario').textContent = ehDiarista ? 'Diarista' : 'Cliente';

    // insertAdjacentHTML para não apagar o <legend> que já está no fieldset.
    document.querySelector('#avatares').insertAdjacentHTML('beforeend', criarOpcoesDeAvatar(avatares, usuario.nome));
    document.querySelector('#servicos').insertAdjacentHTML('beforeend', criarOpcoesDeServico(tipos));

    // Preenche o formulário com o que já está salvo no banco.
    campoSobre.value = usuario.sobre || '';
    marcarValores(form, 'avatar', [usuario.avatar || '']);
    if (ehDiarista) {
        marcarValores(form, 'zona', usuario.zonas);
        marcarValores(form, 'servico', usuario.servicos);
    } else if (usuario.zonas && usuario.zonas.length) {
        campoZonaCliente.value = usuario.zonas[0];
    }

    atualizarContador();
    atualizarPrevia();
}

// ---------- Avaliar (avaliar.html) ----------

// A solicitação chega pela URL: avaliar.html?solicitacao=7 (vem do botão Avaliar da lista ou da Agenda).
// A tela busca a solicitação na lista do próprio usuário, então ninguém avalia um serviço que não é dele.
// O back confere tudo de novo: participou (403), está concluída e ainda não foi avaliada (409).
async function iniciarAvaliar() {
    // validarAcesso já garantiu que tem alguém logado.
    const usuario = obterUsuarioLogado();
    const ehDiarista = usuario.identify === 'DIARIST';
    const paginaDeVolta = ehDiarista ? 'agenda.html' : 'solicitacoes.html';

    const form = document.querySelector('#formAvaliar');
    const resumo = document.querySelector('#resumoServico');
    const mensagemErro = document.querySelector('#erroAvaliar');
    const botaoEnviar = document.querySelector('#enviarAvaliacao');
    const campoComentario = document.querySelector('#comentario');
    const idSolicitacao = Number(new URLSearchParams(window.location.search).get('solicitacao'));

    document.querySelector('#voltar').href = paginaDeVolta;

    // Mostra o motivo e trava o formulário (serviço não encontrado, não concluído ou já avaliado).
    function bloquear(motivo) {
        mensagemErro.textContent = motivo;
        botaoEnviar.disabled = true;
    }

    form.addEventListener('submit', async evento => {
        evento.preventDefault();

        const notaMarcada = form.querySelector('input[name="nota"]:checked');
        if (!notaMarcada) {
            mensagemErro.textContent = 'Escolha uma nota de 1 a 5 estrelas.';
            return;
        }

        mensagemErro.textContent = '';
        botaoEnviar.disabled = true;

        try {
            await enviarAvaliacao({
                solicitacaoId: idSolicitacao,
                avaliadorId: usuario.id,
                nota: Number(notaMarcada.value),
                comentario: campoComentario.value.trim()
            });
            alert('Avaliação enviada! Obrigado.');
            window.location.href = paginaDeVolta;
        } catch (falha) {
            console.error(falha);
            mensagemErro.textContent = falha.mensagemDoServidor || 'Não foi possível enviar a avaliação. Tente novamente.';
            botaoEnviar.disabled = false;
        }
    });

    const solicitacoes = ehDiarista ? await buscarPedidos(usuario.id) : await buscarSolicitacoes(usuario.id);
    const solicitacao = solicitacoes.find(item => item.id === idSolicitacao);

    if (!solicitacao) {
        resumo.textContent = 'Serviço não encontrado.';
        bloquear('Abra a avaliação pelo botão Avaliar da sua lista de serviços.');
        return;
    }

    const avaliado = ehDiarista ? solicitacao.cliente : solicitacao.diarista;
    document.querySelector('#nomeAvaliado').textContent = avaliado;
    resumo.textContent = `${solicitacao.titulo} · ${formatarDataHora(solicitacao.data, solicitacao.hora)}`;

    if (solicitacao.status !== 'CONCLUIDA') {
        bloquear('Só é possível avaliar depois que o serviço for concluído.');
    } else if (solicitacao.jaAvaliada) {
        bloquear('Você já avaliou esse serviço.');
    }
}

// ---------- Login e cadastro (login.html e cadastro.html) ----------

// Aqui ficam as abas ENTRAR/CADASTRAR e o 👁 que mostra a senha.
function iniciarAutenticacao() {
    const [abaEntrar, abaCadastrar] = document.querySelectorAll('.tabs button');

    abaEntrar.addEventListener('click', () => {
        window.location.href = 'login.html';
    });
    abaCadastrar.addEventListener('click', () => {
        window.location.href = 'cadastro.html';
    });

    document.querySelectorAll('.pw span').forEach(icone => {
        icone.addEventListener('click', () => {
            const campoSenha = icone.previousElementSibling;
            campoSenha.type = campoSenha.type === 'password' ? 'text' : 'password';
        });
    });
}


/* ==========================================================================
 * 5. INICIALIZAÇÃO
 * ======================================================================== */

// A chave é o valor de data-page no <body> de cada HTML.
const INICIALIZADORES_DE_PAGINA = {
    index: iniciarHome,
    busca: iniciarBusca,
    perfil: iniciarPerfil,
    agenda: iniciarAgenda,
    solicitacoes: iniciarSolicitacoes,
    solicitar: iniciarSolicitar,
    mensagens: iniciarMensagens,
    login: iniciarAutenticacao,
    cadastro: iniciarAutenticacao,
    editarPerfil: iniciarEditarPerfil,
    avaliar: iniciarAvaliar
};

async function iniciarAplicacao() {
    const pagina = document.body.dataset.page;

    if (!validarAcesso(pagina)) {
        return;
    }

    criarHeader(obterUsuarioLogado());
    configurarMenuDaConta();

    if (pagina !== 'index') {
        destacarPaginaAtual(pagina);
    }

    const iniciarPagina = INICIALIZADORES_DE_PAGINA[pagina];

    if (!iniciarPagina) {
        return;
    }

    try {
        await iniciarPagina();
    } catch (falha) {
        console.error(falha);
        alert('Não foi possível carregar os dados da página. Tente novamente.');
    }
}


iniciarAplicacao();