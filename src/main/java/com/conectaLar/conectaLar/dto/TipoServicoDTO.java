package com.conectaLar.conectaLar.dto;

import java.math.BigDecimal;

import com.conectaLar.conectaLar.Enums.TipoServico;

public class TipoServicoDTO {
    private String codigo;
    private String descricao;
    private BigDecimal valor;

    public TipoServicoDTO(TipoServico tipo) {
        this.codigo = tipo.name();
        this.descricao = tipo.getDescricao();
        this.valor = tipo.getValor();
    }

    public String getCodigo() {
        return codigo;
    }

    public String getDescricao() {
        return descricao;
    }

    public BigDecimal getValor() {
        return valor;
    }
}
