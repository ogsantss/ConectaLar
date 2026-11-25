const nome = document.getElementById("nome");
const email = document.getElementById("email");
const celular = document.getElementById("celular");
const senha = document.getElementById("senha");
const termos = document.getElementById("termos");
const erro = document.querySelector(".err");
const btnEntrar = document.getElementById("login");

btnEntrar.addEventListener("click", redirecionarLogin);

function redirecionarLogin() {
    window.location.href = "login.html";
}

cadastrar.addEventListener("click", cadastrarUsuario)

// Serviços: só a diarista escolhe. As opções vêm do back (criarOpcoesDeServico fica no app.js).
const camposDiarista = document.getElementById("camposDiarista");

buscarTiposDeServico()
    .then(tipos => document.getElementById("servicos").insertAdjacentHTML("beforeend", criarOpcoesDeServico(tipos)))
    .catch(falha => console.error(falha));

document.querySelectorAll('input[name="tipo"]').forEach(opcao => {
    opcao.addEventListener("change", () => {
        camposDiarista.hidden = opcao.value !== "DIARIST";
    });
});

async function cadastrarUsuario() {
    const tipoSelecionado = document.querySelector('input[name="tipo"]:checked');

    if (!tipoSelecionado) {
        erro.textContent = "Escolha se você é Cliente ou Diarista.";
        return;
    }
    const ehDiarista = tipoSelecionado.value === "DIARIST";
    const zonas = [...document.querySelectorAll('input[name="zona"]:checked')].map(campo => campo.value);
    const servicos = ehDiarista
        ? [...document.querySelectorAll('input[name="servico"]:checked')].map(campo => campo.value)
        : [];

    if (zonas.length === 0) {
        erro.textContent = "Escolha pelo menos uma zona.";
        return;
    }
    if (!ehDiarista && zonas.length > 1) {
        erro.textContent = "Cliente deve escolher apenas uma zona.";
        return;
    }
    if (ehDiarista && servicos.length === 0) {
        erro.textContent = "Escolha pelo menos um serviço.";
        return;
    }
    if (!termos.checked) {
        erro.textContent = "É preciso aceitar os termos de uso.";
        return;
    }
    erro.textContent = "";
    const usuario = {
        nome: nome.value,
        email: email.value,
        celular: celular.value,
        senha: senha.value,
        identify: tipoSelecionado.value,
        zonas: zonas,
        servicos: servicos
    }

    const response = await fetch("/usuarios", {
        method: "POST",
        body: JSON.stringify(usuario),
        headers: {
            "Content-Type": "application/json"
        }
    })
    if (!response.ok) {
        // Mostra o motivo que o servidor mandou (ex: "Email já cadastrado."). A validação automática
        // do Spring (@Valid) devolve um texto técnico ("Validation failed..."), então nesse caso
        // usa uma mensagem genérica.
        const corpo = await response.json().catch(() => null);
        const mensagemDoServidor = corpo && corpo.message;
        erro.textContent = mensagemDoServidor && !mensagemDoServidor.startsWith("Validation failed")
            ? mensagemDoServidor
            : "Não foi possível cadastrar. Confira os dados e tente novamente.";
    } else {
        alert('Usuario cadastrado com sucesso!')
        window.location.href = "login.html";
    }

}