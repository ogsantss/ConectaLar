package com.conectaLar.conectaLar.entity;


import com.conectaLar.conectaLar.enums.Identification;
import com.conectaLar.conectaLar.enums.TipoServico;
import com.conectaLar.conectaLar.enums.Zona;
import jakarta.persistence.*;

import java.util.HashSet;
import java.util.Set;

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

    // Cliente: exatamente 1 zona. Diarista: 1 ou mais. A regra fica no UserService (validarZonasEServicos).
    // EAGER: o conjunto é pequeno (no máximo 4 valores) e aparece em toda resposta de usuário.
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "usuario_zonas", joinColumns = @JoinColumn(name = "usuario_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "zona")
    private Set<Zona> zonas = new HashSet<>();

    // Serviços que a diarista oferece.
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "usuario_servicos", joinColumns = @JoinColumn(name = "usuario_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "servico")
    private Set<TipoServico> servicos = new HashSet<>();

    // Campos opcionais: aceitam nulo para não quebrar o banco de quem já tem usuários salvos (ddl-auto=update).
    @Column(length = 500)
    private String sobre;

    // Só o código do avatar escolhido (ex: "avatar3"); a imagem fica no front.
    private String avatar;

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

    public Set<Zona> getZonas() {
        return zonas;
    }

    public void setZonas(Set<Zona> zonas) {
        this.zonas = zonas;
    }

    public Set<TipoServico> getServicos() {
        return servicos;
    }

    public void setServicos(Set<TipoServico> servicos) {
        this.servicos = servicos;
    }

    public String getSobre() {
        return sobre;
    }

    public void setSobre(String sobre) {
        this.sobre = sobre;
    }

    public String getAvatar() {
        return avatar;
    }

    public void setAvatar(String avatar) {
        this.avatar = avatar;
    }
}