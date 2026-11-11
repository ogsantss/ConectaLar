const email = document.getElementById("email");
const senha = document.getElementById("senha");
const formulario = document.getElementById("formLogin");
const btnCadastrar = document.getElementById("cadastrar");

btnCadastrar.addEventListener("click", redirecionarCadastrar);


function redirecionarCadastrar() {
    window.location.href = "cadastro.html";
}

formulario.addEventListener("submit", async function (evt) {
    evt.preventDefault();

    const usuario = {
        email: email.value,
        senha: senha.value
    }

    const response = await fetch("/usuarios/login", {
        method: "POST",
        body: JSON.stringify(usuario),
        headers: {
            "Content-Type": "application/json"
        }
    })
    if (!response.ok) {
        alert("Não foi possivel efetuar o login, Status: " + response.status)
    } else {
        alert("Login efetuado com sucesso!")
        const responseJson = await response.json();
        if (responseJson.identify === "CLIENT") {
            window.location.href = "index.html";
            localStorage.setItem("usuario", JSON.stringify(responseJson));
        } else {
            window.location.href = "agenda.html";
            localStorage.setItem("usuario", JSON.stringify(responseJson));
        }
    }


})

