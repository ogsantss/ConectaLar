package com.conectaLar.conectaLar.repository;

import com.conectaLar.conectaLar.entity.Conversa;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ConversaRepository extends JpaRepository<Conversa, Long> {

    Optional<Conversa> findByClienteIdAndDiaristaId(Long clienteId, Long diaristaId);

    List<Conversa> findByClienteIdOrDiaristaId(Long clienteId, Long diaristaId);
}