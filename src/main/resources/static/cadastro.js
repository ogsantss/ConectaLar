const nome = document.getElementById("nome");
const email = document.getElementById("email");
const celular = document.getElementById("celular");
const senha = document.getElementById("senha");
const termos = document.getElementById("termos");
const erro = document.querySelector(".err");
const entrar = document.getElementById("login");

btnCadastrar.addEventListener("click", redirecionarLogin);

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
        identify: tipoSelecionado.value
    }

    const response = await fetch("/usuarios", {
        method: "POST",
        body: JSON.stringify(usuario),
        headers: {
            "Content-Type": "application/json"
        }
    })
    if (!response.ok) {
        alert("Não foi possivel cadastrar esse usuario. Status: " + response.status);
    } else {
        alert('Usuario cadastrado com sucesso!')
        window.location.href = "login.html";
    }

}