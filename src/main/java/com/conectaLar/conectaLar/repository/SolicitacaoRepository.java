package com.conectaLar.conectaLar.repository;

import com.conectaLar.conectaLar.entity.Solicitacao;
import com.conectaLar.conectaLar.enums.StatusSolicitacao;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Collection;
import java.util.List;

public interface SolicitacaoRepository extends JpaRepository<Solicitacao, Long> {
    // Verdadeiro se a diarista já tem um pedido ativo (pendente ou aceito) nesse dia e horário.
    boolean existsByDiaristaIdAndDataAndHoraAndStatusIn(long diaristaId, LocalDate data, LocalTime hora,
                                                        Collection<StatusSolicitacao> status);

    List<Solicitacao> findByClienteIdOrderByDataDescHoraDesc(long clienteId);

    List<Solicitacao> findByDiaristaIdOrderByDataAscHoraAsc(long diaristaId);
}
