package com.conectaLar.conectaLar.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "mensagens")
public class Mensagem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "conversa_id")
    private Conversa conversa;

    @ManyToOne(optional = false)
    @JoinColumn(name = "remetente_id")
    private com.conectaLar.conectaLar.entity.User remetente;

    @Column(nullable = false, length = 1000)
    private String conteudo;

    @Column(nullable = false)
    private LocalDateTime enviadaEm;

    private boolean lida = false;

    @PrePersist
    void aoEnviar() {
        enviadaEm = LocalDateTime.now();
    }

    public Mensagem() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Conversa getConversa() {
        return conversa;
    }

    public void setConversa(Conversa conversa) {
        this.conversa = conversa;
    }

    public User getRemetente() {
        return remetente;
    }

    public void setRemetente(User remetente) {
        this.remetente = remetente;
    }

    public String getConteudo() {
        return conteudo;
    }

    public void setConteudo(String conteudo) {
        this.conteudo = conteudo;
    }

    public LocalDateTime getEnviadaEm() {
        return enviadaEm;
    }

    public void setEnviadaEm(LocalDateTime enviadaEm) {
        this.enviadaEm = enviadaEm;
    }

    public boolean isLida() {
        return lida;
    }

    public void setLida(boolean lida) {
        this.lida = lida;
    }
}
