package com.conectaLar.conectaLar.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

// Nota que uma pessoa da solicitação dá para a outra depois do serviço concluído:
// o cliente avalia a diarista e a diarista avalia o cliente.
// A unique constraint garante no banco o "uma avaliação por pessoa por solicitação".
@Entity
@Table(name = "avaliacoes",
        uniqueConstraints = @UniqueConstraint(columnNames = {"solicitacao_id", "avaliador_id"}))
public class Avaliacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "solicitacao_id")
    private Solicitacao solicitacao;

    // Quem deu a nota.
    @ManyToOne(optional = false)
    @JoinColumn(name = "avaliador_id")
    private User avaliador;

    // Quem recebeu a nota: a outra pessoa da solicitação.
    @ManyToOne(optional = false)
    @JoinColumn(name = "avaliado_id")
    private User avaliado;

    // De 1 a 5 (a validação fica no AvaliacaoRequestDTO).
    @Column(nullable = false)
    private int nota;

    @Column(length = 500)
    private String comentario;

    @Column(nullable = false)
    private LocalDateTime criadaEm;

    @PrePersist
    void aoCriar() {
        criadaEm = LocalDateTime.now();
    }

    public Avaliacao() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Solicitacao getSolicitacao() {
        return solicitacao;
    }

    public void setSolicitacao(Solicitacao solicitacao) {
        this.solicitacao = solicitacao;
    }

    public User getAvaliador() {
        return avaliador;
    }

    public void setAvaliador(User avaliador) {
        this.avaliador = avaliador;
    }

    public User getAvaliado() {
        return avaliado;
    }

    public void setAvaliado(User avaliado) {
        this.avaliado = avaliado;
    }

    public int getNota() {
        return nota;
    }

    public void setNota(int nota) {
        this.nota = nota;
    }

    public String getComentario() {
        return comentario;
    }

    public void setComentario(String comentario) {
        this.comentario = comentario;
    }

    public LocalDateTime getCriadaEm() {
        return criadaEm;
    }

    public void setCriadaEm(LocalDateTime criadaEm) {
        this.criadaEm = criadaEm;
    }
}
