const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const page = document.body.dataset.page;
document.body.insertAdjacentHTML('afterbegin', `<header><a class="logo" href="index.html#home">🏠 conectaLar</a><nav>
<a href="solicitar.html" data-p="solicitar">Serviços</a><a href="index.html#home" data-s="home">Home</a><a href="index.html#vantagens" data-s="vantagens">Vantagens</a><a href="index.html#profissionais" data-s="profissionais">Profissionais</a><a href="index.html#avaliacoes" data-s="avaliacoes">Avaliações</a></nav>
<div class="menu"><button class="user" id="um" aria-label="Conta">👤</button><div class="drop" id="dd"><a href="login.html">Conectar</a><a href="cadastro.html">Criar conta</a></div></div></header>`);
const um = $('#um'), dd = $('#dd');
um.onclick = e => {
    e.stopPropagation();
    dd.classList.toggle('open')
};
document.onclick = () => dd.classList.remove('open');
document.onkeydown = e => {
    if (e.key === 'Escape') dd.classList.remove('open')
};
if (page === 'index') {
    const links = $$('nav a[data-s]'), secs = $$('main section[id]');
    const spy = new IntersectionObserver(es => es.forEach(e => {
        if (e.isIntersecting) links.forEach(a => a.classList.toggle('on', a.dataset.s === e.target.id))
    }), {rootMargin: '-45% 0px -50% 0px'});
    secs.forEach(x => spy.observe(x));
    const rv = new IntersectionObserver(es => es.forEach(e => e.isIntersecting && e.target.classList.add('in')), {threshold: .15});
    $$('.rev').forEach(x => rv.observe(x))
} else $$('nav a').forEach(a => a.dataset.p === page && a.classList.add('on'));
const single = (sel, cls = 'on') => $$(sel).forEach(el => el.onclick = () => {
    $$(sel).forEach(x => x.classList.remove(cls));
    el.classList.add(cls)
});
const load = () => fetch('js/data.json').then(r => r.json()).catch(() => ({pros: [], pedidos: [], solic: []}));
const pages = {
    async index() {
        const d = await load();
        $('#pf').innerHTML = d.pros.map(p => `<div class="card rev"><div class="av" style="margin-bottom:10px">${p.nome[0]}</div><b>${p.nome}</b><br><small>★ ${p.nota} · ${p.av} avaliações</small><br><span class="tag">${p.serv}</span><p style="margin:10px 0"><b>R$ ${p.preco}/diária</b></p><a class="btn full" href="perfil.html">Ver perfil</a></div>`).join('');
        $$('.rev').forEach(x => x.classList.add('in'));
        const i = $('#cep');
        i.oninput = () => i.value = i.value.replace(/\D/g, '').slice(0, 8).replace(/(\d{5})(\d)/, '$1-$2');
        $('#go').onclick = () => /^\d{5}-\d{3}$/.test(i.value) ? location.href = 'busca.html?cep=' + i.value : ($('#cepErr').textContent = 'Informe um CEP válido (ex: 04845-200)')
    },
    async busca() {
        const d = await load();
        $('#lista').innerHTML = d.pros.map((p, i) => `<div class="pro ${i ? '' : 'on'}"><div class="av">${p.nome[0]}</div><div><b>${p.nome}</b> <small>(${p.dist})</small><br><small>★ ${p.nota} · ${p.av} avaliações</small><br><span class="tag">${p.serv}</span><br><b>R$ ${p.preco}/diária</b></div><a class="btn" href="perfil.html">Ver perfil</a></div>`).join('');
        $('#n').textContent = d.pros.length;
        single('.pro')
    },
    perfil() {
        single('.day');
        single('.hr');
        $('#agendar').onclick = () => location.href = 'solicitar.html'
    },
    async agenda() {
        const d = await load();
        $('#pedidos').innerHTML = d.pedidos.map(p => `<div class="req"><div><b>${p.t}</b><br><small>${p.d}</small></div><div><b>${p.v}</b><br><button class="btn out rec">Recusar</button> <button class="btn ac">Aceitar</button></div></div>`).join('');
        $('#pedidos').onclick = e => {
            const r = e.target.closest('.req');
            if (!r) return;
            if (e.target.classList.contains('rec')) r.remove();
            if (e.target.classList.contains('ac')) {
                e.target.outerHTML = '<span class="tag ok">Confirmado</span>';
                $$('button', r).forEach(b => b.remove())
            }
            $('#novos').textContent = $$('#pedidos .req').length
        };
        $('#novos').textContent = d.pedidos.length;
        single('.day')
    },
    async solicitacoes() {
        const d = await load(), ul = $('#sol');
        const draw = f => ul.innerHTML = d.solic.filter(s => f === 'Todas' || (f === 'Pendentes') === (s.c === 'w')).map(s => `<div class="card" style="margin-bottom:14px"><b>${s.t}</b><br>Diarista: ${s.d}<br>${s.q}<br><span class="tag ${s.c}">${s.s}</span></div>`).join('') || '<p>Nada por aqui.</p>';
        draw('Todas');
        $$('.chip').forEach(c => c.addEventListener('click', () => {
            single('.chip');
            draw(c.textContent)
        }));
        single('.chip')
    },
    solicitar() {
        const f = $('#f'), up = () => {
            $('#rs').textContent = f.tipo.value;
            $('#rv').textContent = ({
                'Limpeza Residencial': 'R$ 150,00',
                'Passar Roupa': 'R$ 90,00',
                'Organização': 'R$ 120,00'
            })[f.tipo.value]
        };
        f.tipo.onchange = up;
        up();
        f.onsubmit = e => {
            e.preventDefault();
            if (!f.data.value || !f.end.value) return alert('Preencha data e endereço.');
            alert('Pedido enviado!');
            location.href = 'solicitacoes.html'
        };
        $('#cancel').onclick = () => history.back()
    },
    mensagens() {
        const box = $('#msgs'), inp = $('#txt');
        single('#contatos div');
        $('#enviar').onclick = () => {
            const v = inp.value.trim();
            if (!v) return;
            box.insertAdjacentHTML('beforeend', `<div class="m me">${v.replace(/</g, '&lt;')}</div>`);
            inp.value = '';
            box.scrollTop = box.scrollHeight
        };
        inp.onkeydown = e => {
            if (e.key === 'Enter') $('#enviar').click()
        }
    },
    auth() {
        const mode = location.hash === '#cadastro' ? 1 : 0, t = $$('.tabs button');
        t.forEach((b, i) => b.onclick = () => location.href = i ? 'cadastro.html' : 'login.html');
        $$('.pw span').forEach(s => s.onclick = () => {
            const i = s.previousElementSibling;
            i.type = i.type === 'password' ? 'text' : 'password'
        });
        $('form').onsubmit = e => {
            e.preventDefault();
            const em = $('[type=email]').value, pw = $('.pw input').value, er = $('.err');
            er.textContent = !/^\S+@\S+\.\S+$/.test(em) ? 'E-mail inválido.' : pw.length < 1 ? 'A senha precisa de 6+ caracteres.' : '';
            if (!er.textContent) location.href = 'busca.html'
        }
    }
};
(pages[page] || (page === 'login' || page === 'cadastro' ? pages.auth : () => {
}))();
