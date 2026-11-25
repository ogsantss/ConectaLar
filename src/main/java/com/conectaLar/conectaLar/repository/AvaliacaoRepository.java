package com.conectaLar.conectaLar.repository;

import com.conectaLar.conectaLar.entity.Avaliacao;
import com.conectaLar.conectaLar.enums.Identification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AvaliacaoRepository extends JpaRepository<Avaliacao, Long> {

    // Verdadeiro se essa pessoa já avaliou essa solicitação (só pode uma vez).
    boolean existsBySolicitacaoIdAndAvaliadorId(long solicitacaoId, long avaliadorId);

    // Avaliações recebidas por um usuário, das mais novas para as mais antigas (tela de perfil).
    List<Avaliacao> findByAvaliadoIdOrderByCriadaEmDesc(long avaliadoId);

    // As 3 avaliações mais recentes recebidas por diaristas (seção de avaliações da Home).
    List<Avaliacao> findTop3ByAvaliadoIdentifyOrderByCriadaEmDesc(Identification identify);

    long countByAvaliadoId(long avaliadoId);

    // Não existe derived query para média, então a consulta é escrita em JPQL.
    // Devolve null quando o usuário ainda não tem avaliações.
    @Query("select avg(a.nota) from Avaliacao a where a.avaliado.id = :avaliadoId")
    Double calcularMedia(@Param("avaliadoId") long avaliadoId);
}
