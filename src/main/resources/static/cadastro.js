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

async function cadastrarUsuario() {
    const tipoSelecionado = document.querySelector('input[name="tipo"]:checked');

    if (!tipoSelecionado) {
        erro.textContent = "Escolha se você é Cliente ou Diarista.";
        return;
    }
    const zonas = [...document.querySelectorAll('input[name="zona"]:checked')].map(campo => campo.value);

    if (zonas.length === 0) {
        erro.textContent = "Escolha pelo menos uma zona.";
        return;
    }
    if (tipoSelecionado.value === "CLIENT" && zonas.length > 1) {
        erro.textContent = "Cliente deve escolher apenas uma zona.";
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
        zonas: zonas
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