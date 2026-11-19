package com.conectaLar.conectaLar.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "conversas",
        uniqueConstraints = @UniqueConstraint(columnNames = {"cliente_id", "diarista_id"}))
public class Conversa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "cliente_id")
    private com.conectaLar.conectaLar.entity.User cliente;

    @ManyToOne(optional = false)
    @JoinColumn(name = "diarista_id")
    private com.conectaLar.conectaLar.entity.User diarista;

    @Column(nullable = false)
    private LocalDateTime criadaEm;

    @PrePersist
    void aoCriar() {
        criadaEm = LocalDateTime.now();
    }

    public Conversa() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getCliente() {
        return cliente;
    }

    public void setCliente(User cliente) {
        this.cliente = cliente;
    }

    public User getDiarista() {
        return diarista;
    }

    public void setDiarista(User diarista) {
        this.diarista = diarista;
    }

    public LocalDateTime getCriadaEm() {
        return criadaEm;
    }

    public void setCriadaEm(LocalDateTime criadaEm) {
        this.criadaEm = criadaEm;
    }
}