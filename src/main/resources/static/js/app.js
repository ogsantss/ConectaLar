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
 * Hoje os dados são simulados com js/data.json. Para integrar uma função:
 *   - crie o endpoint no Spring;
 *   - nessa função, apague a linha da simulação;
 *   - descomente a linha "return requisicaoApi(...)".
 * As páginas não precisam mudar se o JSON do back end tiver os mesmos campos
 * do data.json. Por isso, ele serve de referência para os DTOs.
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
        throw new Error(`Erro ${resposta.status} em ${metodo} ${caminho}`);
    }

    // Respostas sem corpo (ex: 204 No Content) não podem ser convertidas em JSON.
    const texto = await resposta.text();
    return texto ? JSON.parse(texto) : null;
}

// Simulação de leitura: devolve uma lista do data.json.
async function lerDadosSimulados(chave) {
    const resposta = await fetch('js/data.json');

    if (!resposta.ok) {
        throw new Error(`Erro ${resposta.status} ao ler data.json`);
    }

    const dados = await resposta.json();
    return dados[chave];
}

// Simulação de escrita: só registra no console (F12) o que seria enviado.
async function simularEnvio(descricao, dados) {
    console.info(`[simulação] ${descricao}`, dados);
}

// Diaristas cadastradas no banco. Os ids precisam ser os reais: são eles que o Perfil
// e a tela Solicitar usam para encontrar a profissional.
// Ainda não há filtro por CEP: todas as diaristas aparecem.
async function buscarProfissionais() {
    return requisicaoApi('/usuarios/diaristas');
}

async function buscarPedidos() {
    // return requisicaoApi('/pedidos');
    return lerDadosSimulados('pedidos');
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

async function aceitarPedido(idPedido) {
    // return requisicaoApi(`/pedidos/${idPedido}/aceitar`, 'POST');
    return simularEnvio('Aceitar pedido', {idPedido});
}

async function recusarPedido(idPedido) {
    // return requisicaoApi(`/pedidos/${idPedido}/recusar`, 'POST');
    return simularEnvio('Recusar pedido', {idPedido});
}

async function criarSolicitacao(solicitacao) {
    return requisicaoApi('/solicitacoes', 'POST', solicitacao);
}

async function enviarMensagem(mensagem) {
    // O back end também vai precisar saber o destinatário da mensagem.
    // return requisicaoApi('/mensagens', 'POST', mensagem);
    return simularEnvio('Enviar mensagem', mensagem);
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

// Formata um número como dinheiro brasileiro: 150 -> "R$ 150,00".
function formatarMoeda(valor) {
    return Number(valor).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'});
}

// "2026-10-15" e "08:00:00" -> "15/10/2026 • 08:00"
function formatarDataHora(data, hora) {
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano} • ${hora.slice(0, 5)}`;
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

function criarHeader() {
    // Solicitar serviço é coisa da cliente: a diarista não vê esse link.
    const usuario = obterUsuarioLogado();
    const linkServicos = usuario && usuario.identify === 'DIARIST'
        ? ''
        : '<a href="solicitar.html" data-p="solicitar">Serviços</a>';

    document.body.insertAdjacentHTML('afterbegin', `
        <header>
            <a class="logo" href="index.html#home">🏠 conectaLar</a>
            <nav>
                ${linkServicos}
                <a href="index.html#home" data-s="home">Home</a>
                <a href="index.html#vantagens" data-s="vantagens">Vantagens</a>
                <a href="index.html#profissionais" data-s="profissionais">Profissionais</a>
                <a href="index.html#avaliacoes" data-s="avaliacoes">Avaliações</a>
            </nav>
            <div class="menu">
                <button class="user" id="um" aria-label="Conta">👤</button>
                <div class="drop" id="dd">
                    <a href="login.html">Conectar</a>
                    <a href="cadastro.html">Criar conta</a>
                </div>
            </div>
        </header>
    `);
}

function configurarMenuDaConta() {
    const botaoConta = document.querySelector('#um');
    const menuConta = document.querySelector('#dd');

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

function configurarCampoCep() {
    const campoCep = document.querySelector('#cep');
    const botaoBuscar = document.querySelector('#go');
    const mensagemErro = document.querySelector('#cepErr');

    // Máscara: mantém só os números, limita a 8 dígitos e coloca o hífen.
    campoCep.addEventListener('input', () => {
        const digitos = campoCep.value.replace(/\D/g, '').slice(0, 8);
        campoCep.value = digitos.replace(/(\d{5})(\d)/, '$1-$2');
    });

    botaoBuscar.addEventListener('click', () => {
        const cepValido = /^\d{5}-\d{3}$/.test(campoCep.value);

        if (cepValido) {
            window.location.href = `busca.html?cep=${campoCep.value}`;
        } else {
            mensagemErro.textContent = 'Informe um CEP válido (ex: 04845-200)';
        }
    });
}

function criarCartaoProfissional(profissional) {
    return `
        <div class="card rev">
            <div class="av" style="margin-bottom:10px">${escaparHtml(iniciais(profissional.nome))}</div>
            <b>${escaparHtml(profissional.nome)}</b><br>
            <span class="tag">Diarista</span>
            <a class="btn full" style="margin-top:14px" href="perfil.html?id=${escaparHtml(profissional.id)}">Ver perfil</a>
        </div>
    `;
}

async function iniciarHome() {
    destacarSecaoVisivel();
    animarAoAparecer(document.querySelectorAll('.rev'));
    configurarCampoCep();

    const profissionais = await buscarProfissionais();
    const container = document.querySelector('#pf');

    container.innerHTML = profissionais.length
        ? profissionais.map(criarCartaoProfissional).join('')
        : '<p class="rev">Nenhuma diarista cadastrada ainda.</p>';

    // Os cartões novos não existiam quando a animação foi configurada acima.
    animarAoAparecer(container.querySelectorAll('.rev'));
}

// ---------- Busca (busca.html) ----------

function criarItemDaBusca(profissional, indice) {
    // O primeiro profissional da lista já começa selecionado.
    const classeSelecionado = indice === 0 ? 'on' : '';

    return `
        <div class="pro ${classeSelecionado}">
            <div class="av">${escaparHtml(iniciais(profissional.nome))}</div>
            <div>
                <b>${escaparHtml(profissional.nome)}</b><br>
                <span class="tag">Diarista</span>
            </div>
            <a class="btn" href="perfil.html?id=${escaparHtml(profissional.id)}">Ver perfil</a>
        </div>
    `;
}

async function iniciarBusca() {
    const profissionais = await buscarProfissionais();

    document.querySelector('#lista').innerHTML = profissionais.length
        ? profissionais.map(criarItemDaBusca).join('')
        : '<p>Nenhuma diarista cadastrada ainda.</p>';
    document.querySelector('#n').textContent = profissionais.length;

    selecionarUm('.pro');
}

// ---------- Perfil (perfil.html) ----------

async function iniciarPerfil() {
    // Leva o id da profissional (perfil.html?id=3) para a tela de solicitação.
    const idDiarista = new URLSearchParams(window.location.search).get('id');
    const botaoAgendar = document.querySelector('#agendar');

    botaoAgendar.addEventListener('click', () => {
        window.location.href = `solicitar.html?diarista=${encodeURIComponent(idDiarista ?? '')}`;
    });

    const campoNome = document.querySelector('#nomeDiarista');
    const avatar = document.querySelector('#avDiarista');

    try {
        if (!idDiarista) {
            throw new Error('Perfil aberto sem id da diarista');
        }
        const diarista = await buscarDiarista(idDiarista);
        campoNome.textContent = diarista.nome;
        avatar.textContent = iniciais(diarista.nome);
    } catch (falha) {
        console.error(falha);
        campoNome.textContent = 'Diarista não encontrada';
        avatar.textContent = '?';
        botaoAgendar.disabled = true;
    }
}

// ---------- Agenda (agenda.html) ----------

function criarCartaoPedido(pedido) {
    return `
        <div class="req" data-id="${escaparHtml(pedido.id)}">
            <div>
                <b>${escaparHtml(pedido.titulo)}</b><br>
                <small>${escaparHtml(pedido.detalhes)}</small>
            </div>
            <div>
                <b>${escaparHtml(pedido.valor)}</b><br>
                <button class="btn out rec">Recusar</button>
                <button class="btn ac">Aceitar</button>
            </div>
        </div>
    `;
}

// Um pedido só é novo enquanto ainda tem o botão "Aceitar".
function atualizarContadorDePedidos() {
    const pedidosNovos = document.querySelectorAll('#pedidos .ac');
    document.querySelector('#novos').textContent = pedidosNovos.length;
}

function marcarPedidoComoConfirmado(cartao, botaoAceitar) {
    botaoAceitar.insertAdjacentHTML('afterend', '<span class="tag ok">Confirmado</span>');
    cartao.querySelectorAll('button').forEach(botao => botao.remove());
}

async function tratarCliqueNoPedido(evento) {
    const botao = evento.target;
    const cartao = botao.closest('.req');

    if (!cartao) {
        return;
    }

    try {
        if (botao.classList.contains('rec')) {
            await recusarPedido(cartao.dataset.id);
            cartao.remove();
        } else if (botao.classList.contains('ac')) {
            await aceitarPedido(cartao.dataset.id);
            marcarPedidoComoConfirmado(cartao, botao);
        }
        atualizarContadorDePedidos();
    } catch (falha) {
        console.error(falha);
        alert('Não foi possível atualizar o pedido. Tente novamente.');
    }
}

async function iniciarAgenda() {
    selecionarUm('.day');

    const container = document.querySelector('#pedidos');

    // Um único listener no container atende aos botões de todos os pedidos,
    // inclusive os que ainda serão criados (técnica chamada delegação de eventos).
    container.addEventListener('click', tratarCliqueNoPedido);

    const pedidos = await buscarPedidos();

    container.innerHTML = pedidos.map(criarCartaoPedido).join('');
    atualizarContadorDePedidos();
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
const STATUS_DO_FILTRO = {
    Pendentes: 'PENDENTE',
    'Concluídas': 'CONCLUIDA'
};

function criarCartaoSolicitacao(solicitacao) {
    const exibicao = EXIBICAO_DO_STATUS[solicitacao.status];

    return `
        <div class="card" style="margin-bottom:14px">
            <b>${escaparHtml(solicitacao.titulo)}</b><br>
            Diarista: ${escaparHtml(solicitacao.diarista)}<br>
            ${escaparHtml(formatarDataHora(solicitacao.data, solicitacao.hora))} · ${escaparHtml(formatarMoeda(solicitacao.valor))}<br>
            <span class="tag ${exibicao.classe}">${exibicao.texto}</span>
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
        container.innerHTML = '<p>Nada por aqui.</p>';
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
        chip.addEventListener('click', () => exibirSolicitacoes(solicitacoes, chip.textContent));
    });
}

// ---------- Solicitar serviço (solicitar.html) ----------

// A diarista chega pela URL: solicitar.html?diarista=3 (vem do botão "Agendar diária" do perfil).
// O valor mostrado aqui é só uma estimativa: o back end recalcula o preço ao salvar.

// Data de hoje no formato do <input type="date"> (AAAA-MM-DD), no fuso do usuário.
function dataDeHoje() {
    const hoje = new Date();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const dia = String(hoje.getDate()).padStart(2, '0');
    return `${hoje.getFullYear()}-${mes}-${dia}`;
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

async function carregarDiarista(idDiarista) {
    const campoNome = document.querySelector('#rp');

    if (!idDiarista) {
        campoNome.textContent = 'Não selecionada';
        return false;
    }

    try {
        const diarista = await buscarDiarista(idDiarista);
        campoNome.textContent = diarista.nome;
        return true;
    } catch (falha) {
        console.error(falha);
        campoNome.textContent = 'Não encontrada';
        return false;
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
            mensagemErro.textContent = 'Não foi possível enviar o pedido. Tente novamente.';
            botaoEnviar.disabled = false;
        }
    });

    // As duas buscas são independentes, então rodam ao mesmo tempo.
    return Promise.all([
        buscarTiposDeServico().then(resultado => {
            tipos = resultado;
            preencherTiposDeServico(campos.tipo, tipos);
            atualizarResumoDoPedido(campos.tipo, tipos);
        }),
        carregarDiarista(idDiarista).then(valida => {
            diaristaValida = valida;
        })
    ]);
}

// ---------- Mensagens (mensagens.html) ----------

async function enviarTextoDoCampo() {
    const campoTexto = document.querySelector('#txt');
    const listaMensagens = document.querySelector('#msgs');
    const texto = campoTexto.value.trim();

    if (!texto) {
        return;
    }

    try {
        await enviarMensagem({texto});

        listaMensagens.insertAdjacentHTML('beforeend', `<div class="m me">${escaparHtml(texto)}</div>`);
        campoTexto.value = '';
        // Rola a conversa até a mensagem mais recente.
        listaMensagens.scrollTop = listaMensagens.scrollHeight;
    } catch (falha) {
        console.error(falha);
        alert('Não foi possível enviar a mensagem. Tente novamente.');
    }
}

function iniciarMensagens() {
    selecionarUm('#contatos div');

    document.querySelector('#enviar').addEventListener('click', enviarTextoDoCampo);
    document.querySelector('#txt').addEventListener('keydown', evento => {
        if (evento.key === 'Enter') {
            enviarTextoDoCampo();
        }
    });
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
    cadastro: iniciarAutenticacao
};

async function iniciarAplicacao() {
    const pagina = document.body.dataset.page;

    criarHeader();
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
