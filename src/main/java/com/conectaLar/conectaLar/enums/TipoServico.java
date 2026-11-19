package com.conectaLar.conectaLar.enums;

import java.math.BigDecimal;

// O preço fica no servidor: valores vindos do navegador podem ser alterados pelo usuário.
public enum TipoServico {
    LIMPEZA_RESIDENCIAL("Limpeza Residencial", new BigDecimal("150.00")),
    PASSAR_ROUPA("Passar Roupa", new BigDecimal("90.00")),
    ORGANIZACAO("Organização", new BigDecimal("120.00"));

    private final String descricao;
    private final BigDecimal valor;

    TipoServico(String descricao, BigDecimal valor) {
        this.descricao = descricao;
        this.valor = valor;
    }

    public String getDescricao() {
        return descricao;
    }

    public BigDecimal getValor() {
        return valor;
    }
}
