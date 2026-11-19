package com.conectaLar.conectaLar.entity;


import com.conectaLar.conectaLar.enums.Identification;
import jakarta.persistence.*;

@Entity
@Table(name = "usuarios")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(nullable = false)
    private String nome;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false, unique = true)
    private String celular;

    @Column(nullable = false)
    private String senha;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Identification identify;

    public User() {
    }

    public User(String nome, String email, String celular, String senha, Identification identify) {
        this.nome = nome;
        this.email = email;
        this.celular = celular;
        this.senha = senha;
        this.identify = identify;
    }

    public Identification getIdentify() {
        return identify;
    }

    public void setIdentify(Identification identify) {
        this.identify = identify;
    }


    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getCelular() {
        return celular;
    }

    public void setCelular(String celular) {
        this.celular = celular;
    }

    public String getSenha() {
        return senha;
    }

    public void setSenha(String senha) {
        this.senha = senha;
    }
}