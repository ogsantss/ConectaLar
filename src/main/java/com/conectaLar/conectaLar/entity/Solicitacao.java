package com.conectaLar.conectaLar.entity;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

import com.conectaLar.conectaLar.enums.StatusSolicitacao;
import com.conectaLar.conectaLar.enums.TipoServico;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "solicitacoes")
public class Solicitacao {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoServico tipoServico;

    @Column(nullable = false)
    private LocalDate data;

    @Column(nullable = false)
    private LocalTime hora;

    @Column(nullable = false, length = 255)
    private String endereco;

    @Column(length = 500)
    private String observacoes;

    @Column(nullable = false)
    private BigDecimal valor;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusSolicitacao status = StatusSolicitacao.PENDENTE;

    @ManyToOne(optional = false)
    @JoinColumn(name = "cliente_id")
    private User cliente;

    @ManyToOne(optional = false)
    @JoinColumn(name = "diarista_id")
    private User diarista;

    public Solicitacao() {
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public TipoServico getTipoServico() {
        return tipoServico;
    }

    public void setTipoServico(TipoServico tipoServico) {
        this.tipoServico = tipoServico;
    }

    public LocalDate getData() {
        return data;
    }

    public void setData(LocalDate data) {
        this.data = data;
    }

    public LocalTime getHora() {
        return hora;
    }

    public void setHora(LocalTime hora) {
        this.hora = hora;
    }

    public String getEndereco() {
        return endereco;
    }

    public void setEndereco(String endereco) {
        this.endereco = endereco;
    }

    public String getObservacoes() {
        return observacoes;
    }

    public void setObservacoes(String observacoes) {
        this.observacoes = observacoes;
    }

    public BigDecimal getValor() {
        return valor;
    }

    public void setValor(BigDecimal valor) {
        this.valor = valor;
    }

    public StatusSolicitacao getStatus() {
        return status;
    }

    public void setStatus(StatusSolicitacao status) {
        this.status = status;
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
}
