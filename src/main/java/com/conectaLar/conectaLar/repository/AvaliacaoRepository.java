package com.conectaLar.conectaLar.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.conectaLar.conectaLar.entity.Avaliacao;

public interface AvaliacaoRepository extends JpaRepository<Avaliacao, Long> {
    boolean existsBySolicitacaoIdAndAutorId(long solicitacaoId, long autorId);

    List<Avaliacao> findByAvaliadoIdOrderByCriadaEmDesc(long avaliadoId);

    List<Avaliacao> findByAutorId(long autorId);

    List<Avaliacao> findTop3ByComentarioIsNotNullOrderByCriadaEmDesc();

    long countByAvaliadoId(long avaliadoId);

    @Query("select avg(a.nota) from Avaliacao a where a.avaliado.id = :avaliadoId")
    Double mediaDoAvaliado(@Param("avaliadoId") long avaliadoId);
}
