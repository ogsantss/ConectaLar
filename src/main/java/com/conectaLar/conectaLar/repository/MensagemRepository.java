package com.conectaLar.conectaLar.repository;

import com.conectaLar.conectaLar.entity.Mensagem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MensagemRepository extends JpaRepository<Mensagem, Long> {

    List<Mensagem> findByConversaIdOrderByEnviadaEmAsc(Long conversaId);
}