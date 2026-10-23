const nome = document.getElementById("nome");
const email = document.getElementById("email");
const senha = document.getElementById("senha");
const cadastrar = document.getElementById("cadastrar");

cadastrar.addEventListener("click", cadastrarUsuario)

async function cadastrarUsuario() {
    let usuario = {
        nome: nome.value,
        email: email.value,
        senha: senha.value
    }

    const response = await fetch("/usuario", {
        method: "POST",
        body: JSON.stringify(usuario),
        headers: {
            "Content-Type": "JsonApplication"
        }
    })
    if(response.ok){
        alert("Usuario Cadastrado.")
    }
    else{
        alert("Error")
    }
}