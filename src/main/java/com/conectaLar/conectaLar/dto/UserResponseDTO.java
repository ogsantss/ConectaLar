package com.conectaLar.conectaLar.dto;

import com.conectaLar.conectaLar.enums.Identification;

// O que o back devolve sobre um usuário. Nunca inclui a senha.
// O id é obrigatório: o front salva no localStorage e usa como clienteId e remetenteId.
public class UserResponseDTO {
    private long id;

    private String nome;

    private String email;

    private String celular;

    private Identification identify;

    public UserResponseDTO(long id, String nome, String email, String celular, Identification identify) {
        this.id = id;
        this.nome = nome;
        this.email = email;
        this.celular = celular;
        this.identify = identify;
    }

    public UserResponseDTO() {
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public Identification getIdentify() {
        return identify;
    }

    public void setIdentify(Identification identify) {
        this.identify = identify;
    }

    public String getCelular() {
        return celular;
    }

    public void setCelular(String celular) {
        this.celular = celular;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

}
