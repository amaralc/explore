# **Procedimento Operacional: Upgrade do Cloud SQL PostgreSQL 11 para 13 sem Downtime [ ]**

## **1. Pré-requisitos e Verificações [ ]**
Antes de iniciar o processo de upgrade, execute as seguintes verificações:

### **1.1 Criar e Configurar Ambiente Inicial [ ]**

1. Criar instância CloudSQL com PostgreSQL 11:
   ```bash
   gcloud sql instances create pg11-instance \
     --database-version=POSTGRES_11 \
     --cpu=2 \
     --memory=4GB \
     --region=us-central1
   ```

2. Criar réplica de leitura:
   ```bash
   gcloud sql instances create pg11-replica \
     --master-instance-name=pg11-instance \
     --region=us-central1
   ```

3. Adicionar dados de teste:
   ```sql
   -- Install UUID extension if not exists
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

   -- Create users table
   CREATE TABLE "public"."users" (
       "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
       "name" text
   );

   -- Create forms table
   CREATE TABLE "public"."forms" (
       "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
       "title" text,
       "owner_id" uuid REFERENCES "public"."users"("id")
   );

   -- Insert 10 users
   INSERT INTO "public"."users" ("name")
   SELECT 'User ' || i
   FROM generate_series(1, 10) AS i;

   -- Insert 10 forms for each user (100 forms total)
   WITH user_ids AS (
       SELECT id, ROW_NUMBER() OVER (ORDER BY id) as user_number
       FROM users
   )
   INSERT INTO "public"."forms" ("title", "owner_id")
   SELECT 
       'Form ' || i || ' for User ' || ((i-1) / 10 + 1),
       user_ids.id
   FROM generate_series(1, 100) AS i
   JOIN user_ids ON user_ids.user_number = ((i-1) / 10 + 1);
   ```

4. Verificar dados de teste:
   ```sql
   -- Verify the data
   SELECT u.name, COUNT(f.id) as form_count
   FROM users u
   LEFT JOIN forms f ON f.owner_id = u.id
   GROUP BY u.name
   ORDER BY u.name;
   ```

### **1.2 Backup e Verificações de Segurança [ ]**
1. Realize um backup completo da instância PostgreSQL 11:
   ```sql
   -- Verifique o tamanho atual do banco
   SELECT pg_size_pretty(pg_database_size(current_database()));
   
   -- Verifique o espaço disponível no tablespace padrão
   SELECT pg_size_pretty(pg_tablespace_size('pg_default'));
   ```
   
   Essas queries ajudam a garantir que haja espaço suficiente para o backup:
   - A primeira query mostra o tamanho atual do banco de dados.
   - A segunda query mostra o tamanho total do tablespace padrão.
   
   Compare os resultados para assegurar que o espaço disponível no tablespace seja significativamente maior que o tamanho do banco de dados, idealmente pelo menos 2-3 vezes maior, para acomodar o backup e possível crescimento durante o processo de upgrade.

2. Verifique a compatibilidade de extensões:
   ```sql
   SELECT * FROM pg_extension;
   ```
   
   Nesta etapa, é importante verificar:
   - Se todas as extensões instaladas na versão 11 são compatíveis com a versão 13.
   - Se há extensões obsoletas que precisam ser atualizadas ou substituídas.
   - Se existem extensões personalizadas que podem requerer atenção especial durante o upgrade.
   - A versão de cada extensão, para garantir que estejam na versão mais recente compatível com PostgreSQL 13.

   Caso encontre extensões incompatíveis, planeje sua atualização ou substituição antes de prosseguir com o upgrade.

3. Identifique queries que podem ser impactadas:

   Utilize o Query Insights do Cloud SQL para analisar as queries mais frequentes e de maior duração. Isso ajudará a identificar possíveis gargalos e queries que podem precisar de otimização após o upgrade.

   Nesta etapa, é importante verificar:
   - Quais queries podem ser impactadas pelo upgrade.
   - Quais queries podem causar problemas durante o upgrade.
   - Quais queries podem afetar o rendimento do banco de dados.

### **1.3 Plano de Rollback [ ]**

Em caso de problemas durante a migração, siga estas etapas para rollback:
1. Mantenha a instância PostgreSQL 11 ativa até confirmar estabilidade
2. Documente as strings de conexão antigas
3. Mantenha scripts de reversão prontos para cada etapa

## **2. Preparação para a Clonagem [ ]**
Antes de iniciar o processo de clonagem, configure a **replicação lógica** na instância **PostgreSQL 11** para capturar todas as alterações realizadas durante a clonagem.

### **2.1 Habilitar replicação lógica na instância principal [ ]**
1. Acesse a instância principal no **Cloud SQL**.
2. Habilite as seguintes configurações para permitir a replicação lógica:

   ```sql
   ALTER SYSTEM SET wal_level = logical;
   ALTER SYSTEM SET max_replication_slots = 5;
   ALTER SYSTEM SET max_wal_senders = 5;
   SELECT pg_reload_conf();
   ```

3. Crie uma publicação para capturar todas as mudanças:

   ```sql
   CREATE PUBLICATION my_pub FOR ALL TABLES;
   ```

---

## **3. Criar uma Réplica de Leitura (caso ainda não exista) [ ]**
Se ainda não houver uma réplica de leitura configurada, crie uma para ser usada como base para o clone.

### **3.1 Criar uma réplica de leitura [ ]**

1. No **Cloud SQL**, acesse a instância **PostgreSQL 11**.
2. No menu **Replicação**, clique em **Criar réplica**.
3. Configure a réplica com os mesmos recursos da instância principal.
4. Aguarde até que a réplica seja sincronizada e esteja recebendo atualizações da instância principal.

---

## **4. Clonar a Réplica de Leitura [ ]**
Agora que a réplica está pronta, crie a nova instância **PostgreSQL 13** baseada nela.

### **4.1 Criar o clone [ ]**

1. No **Cloud SQL**, acesse a réplica de leitura.
2. Clique em **Clonar instância**.
3. Escolha **PostgreSQL 13** como versão alvo.
4. Aguarde aproximadamente **25 minutos** até a clonagem ser concluída.

---

## **5. Ativar a Replicação Lógica na Nova Instância [ ]**
Assim que a instância clonada estiver disponível, sincronize as mudanças que chegaram na instância principal durante o período de clonagem.

### **5.1 Criar a assinatura da replicação lógica na nova instância [ ]**

1. Acesse a **nova instância PostgreSQL 13**.
2. Execute o seguinte comando para começar a replicar os dados pendentes:

   ```sql
   CREATE SUBSCRIPTION my_sub
   CONNECTION 'host=<IP_DA_INSTANCIA_11> dbname=<DB_NAME> user=<USUARIO> password=<SENHA>'
   PUBLICATION my_pub;
   ```

---

## **6. Validar a Sincronização [ ]**
Antes de redirecionar a aplicação, execute validações abrangentes.

### **6.1 Verificar o status da replicação [ ]**

1. Monitore o lag de replicação:
   ```sql
   SELECT now() - pg_last_xact_replay_timestamp() AS replication_lag;
   ```

2. Verifique a integridade dos dados:
   ```sql
   -- Compare contagens de registros entre as instâncias
   SELECT schemaname, tablename, n_live_tup 
   FROM pg_stat_user_tables 
   ORDER BY n_live_tup DESC;
   
   -- Verifique status da subscription
   SELECT * FROM pg_stat_subscription;
   ```

3. Execute testes de carga na nova instância:
   ```bash
   # Usando pgbench para teste básico
   pgbench -i -s 50  # Inicializa com fator de escala 50
   pgbench -c 10 -j 2 -t 1000  # 10 clientes, 2 threads, 1000 transações
   ```

### **6.2 Métricas de Monitoramento [ ]**

Configure alertas para as seguintes métricas:
- CPU Usage < 80%
- Memória disponível > 20%
- Latência de queries < 100ms
- Replication lag < 5 segundos
- Conexões ativas < 80% do máximo

---

## **7. Alternar a Aplicação para a Nova Instância [ ]**

### **7.1 Migração Gradual [ ]**

1. Implemente uma estratégia de migração gradual:
   ```js
   // Exemplo de configuração para dual-write
   const dbConfig = {
     write: {
       primary: newDbConnection,
       secondary: oldDbConnection // Para rollback
     },
     read: {
       primary: newDbConnection,
       replicas: [oldDbConnection]
     }
   }
   ```

2. Migre os serviços em fases:
   - Fase 1: 10% do tráfego (monitorar por 1 hora)
   - Fase 2: 50% do tráfego (monitorar por 1 hora)
   - Fase 3: 100% do tráfego

---

## **8. Pós-Migração [ ]**

### **8.1 Otimização do PostgreSQL 13 [ ]**

1. Atualize estatísticas do banco:
   ```sql
   ANALYZE VERBOSE;
   ```

2. Reindexe tabelas importantes:
   ```sql
   REINDEX TABLE nome_tabela;
   ```

3. Ajuste parâmetros de performance:
   ```sql
   ALTER SYSTEM SET shared_buffers = '4GB';
   ALTER SYSTEM SET effective_cache_size = '12GB';
   ALTER SYSTEM SET maintenance_work_mem = '1GB';
   SELECT pg_reload_conf();
   ```

### **8.2 Limpeza [ ]**

1. Remova objetos temporários:
   ```sql
   DROP PUBLICATION my_pub;
   DROP SUBSCRIPTION my_sub;
   ```

2. Archive logs antigos:
   ```sql
   SELECT pg_switch_wal();
   ```

---

## **Resumo do Processo [ ]**
✅ **Criar e configurar ambiente inicial**
✅ **Realizar verificações preliminares e backup**
✅ **Configurar replicação lógica** na instância principal
✅ **Criar uma réplica de leitura** no Cloud SQL
✅ **Clonar a réplica** para PostgreSQL 13
✅ **Validar sincronização e performance**
✅ **Migrar gradualmente** para a nova instância
✅ **Otimizar** a nova instância
✅ **Limpar** recursos temporários

**Tempo Estimado Total**: 4-5 horas
- Configuração inicial: 30-60 minutos
- Backup inicial: 30 minutos
- Clonagem: 25 minutos
- Sincronização: 30-60 minutos
- Validações: 30 minutos
- Migração gradual: 1-2 horas

Este procedimento garante uma migração segura e controlada, com possibilidade de rollback em cada etapa. 🚀

**Contatos de Emergência**:
- DBA de Plantão: [PREENCHER]
- SRE de Plantão: [PREENCHER]
- Tech Lead: [PREENCHER]
