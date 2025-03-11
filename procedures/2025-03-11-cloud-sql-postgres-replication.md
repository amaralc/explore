# **Procedimento Operacional: Upgrade do Cloud SQL PostgreSQL 11 para 13 sem Downtime [ ]**

## **1. Pré-requisitos e Verificações [ ]**
Antes de iniciar o processo de upgrade, execute as seguintes verificações:

### **1.1 Criar e Configurar Ambiente Inicial (15min) [x]**

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

### **1.2 Backup e Verificações de Segurança (30min) [x]**
1. Verifique espaço de armazenagem da instância PostgreSQL 11:
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

4. Realize o backup completo da instância PostgreSQL 11;

## **2. Preparação para a Clonagem (20min) [x]**
Antes de iniciar o processo de clonagem, configure a **replicação lógica** na instância **PostgreSQL 11** para capturar todas as alterações realizadas durante a clonagem.

### **2.1 Habilitar replicação lógica na instância principal [ ]**

IMPORTANTE: este processo requer reinicialização da instância, com downtime previsto < 1min para instância recem criada; Necessário avaliar se esta etapa requer que aplicação seja pausada antes da execução;

1. Acesse a instância principal no **Cloud SQL**
2. Configure a replicação lógica (~1min downtime):

   **Opção 1: Via Console Cloud SQL**
   - Acesse o console do Cloud SQL
   - Selecione sua instância PostgreSQL 11
   - Vá em "EDITAR"
   - Na seção "Flags do banco de dados", adicione:
     - `cloudsql.logical_decoding = on`
   - Clique em "Salvar"
   - Aguarde a instância reiniciar

   **Opção 2: Via gcloud CLI**
   ```bash
   # Habilite a replicação lógica
   gcloud sql instances patch pg11-instance \
     --database-flags "cloudsql.logical_decoding=on"
   
   # Aguarde a instância reiniciar e verifique os flags
   gcloud sql instances describe pg11-instance \
     --format="get(settings.databaseFlags)"
   ```

3. Após a reinicialização, verifique se a replicação lógica está habilitada na instância principal:
   ```sql
   SHOW wal_level;  -- Deve mostrar 'logical'
   ```

4. Faça a mesma verificação na réplica de leitura;
   ```sql
   SHOW wal_level;  -- Deve mostrar 'logical'
   ```
5. Na instância principal, crie uma publicação para capturar todas as mudanças:
   ```sql
   CREATE PUBLICATION my_pub FOR ALL TABLES;
   ```
6. Verifique se a publicação foi criada:
   ```sql
   SELECT * FROM pg_publication;
   ```
7. Verifique se a publicação foi criada também na réplica de leitura:
   ```sql
   SELECT * FROM pg_publication;
   ```
---

## **3. Criar uma Réplica de Leitura (caso ainda não exista) (5min) [x]**
Se ainda não houver uma réplica de leitura configurada, crie uma para ser usada como base para o clone.

### **3.1 Criar uma réplica de leitura [ ]**

1. No **Cloud SQL**, acesse a instância **PostgreSQL 11**.
2. No menu **Replicação**, clique em **Criar réplica**.
3. Configure a réplica com os mesmos recursos da instância principal.
4. Aguarde até que a réplica seja sincronizada e esteja recebendo atualizações da instância principal.

---

## **4. Clonar a Instância Principal (30min) [ ]**
Como não há opção de clonar diretamente a réplica de leitura, vamos clonar a instância principal para a nova versão do PostgreSQL.

### **4.1 Criar o clone [ ]**

ATENÇÃO: O processo de clonagem pode demorar de 20 a 30 minutos. Queremos garantir que dados que cheguem para a instância primária durante esse período, não sejam perdidos.

1. No **Cloud SQL**, acesse a instância principal PostgreSQL 11.
2. Clique em **Criar clone**.
3. Na configuração do clone:
   - Mantenha a versão como **PostgreSQL 11**.
   - Selecione a opção para incluir réplicas de leitura, se disponível.
   - Configure os recursos conforme necessário (CPU, memória, armazenamento).
   - Após a clonagem, será realizado o upgrade para PostgreSQL 13.
4. Inicie o processo de clonagem.
5. Aguarde aproximadamente **30-45 minutos** até a clonagem ser concluída.

Nota: O tempo de clonagem pode variar dependendo do tamanho do banco de dados e da carga do sistema.

### **4.2 Forçar modificações na réplica principal durante o clone [ ]**

1. No **Cloud SQL**, acesse a instância principal PostgreSQL 11.
2. Crie uma nova tabela e adicione dados no banco de dados.

```sql
  -- Create answers table
  CREATE TABLE "public"."answers" (
      "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
      "value" text,
      "form_id" uuid REFERENCES "public"."forms"("id")
  );

  -- Insert more users (40 more, total 50)
  INSERT INTO "public"."users" ("name")
  SELECT 'User ' || i
  FROM generate_series(11, 50) AS i;

  -- Insert more forms (400 more, total 500)
  WITH user_ids AS (
      SELECT id, ROW_NUMBER() OVER (ORDER BY id) as user_number
      FROM users
  )
  INSERT INTO "public"."forms" ("title", "owner_id")
  SELECT 
      'Form ' || i || ' for User ' || ((i-1) / 10 + 1),
      user_ids.id
  FROM generate_series(101, 500) AS i
  JOIN user_ids ON user_ids.user_number = ((i-1) / 10 + 1);

  -- Insert answers (5 answers per form)
  INSERT INTO "public"."answers" ("value", "form_id")
  SELECT 
      'Answer ' || (ROW_NUMBER() OVER (PARTITION BY f.id) % 5 + 1) || ' for ' || f.title,
      f.id
  FROM "public"."forms" f
  CROSS JOIN generate_series(1, 5);

  -- Verify inserted data
  SELECT * FROM "public"."answers";

  -- Select all answers from user with name User 1
  SELECT * FROM "public"."answers" WHERE "form_id" IN (SELECT "id" FROM "public"."forms" WHERE "owner_id" = (SELECT "id" FROM "public"."users" WHERE "name" = 'User 1'));

  -- Delete all answers from user with name User 1
  DELETE FROM "public"."answers" WHERE "form_id" IN (SELECT "id" FROM "public"."forms" WHERE "owner_id" = (SELECT "id" FROM "public"."users" WHERE "name" = 'User 1'));

  -- List forms from user 1
  SELECT * FROM "public"."forms" WHERE "owner_id" = (SELECT "id" FROM "public"."users" WHERE "name" = 'User 1');

  -- Delete all forms from user 1
  DELETE FROM "public"."forms" WHERE "owner_id" = (SELECT "id" FROM "public"."users" WHERE "name" = 'User 1');

  -- Verify deleted data
  SELECT * FROM "public"."forms" WHERE "owner_id" = (SELECT "id" FROM "public"."users" WHERE "name" = 'User 1');

  -- Select all answers from user with name User 1
  SELECT * FROM "public"."answers" WHERE "form_id" IN (SELECT "id" FROM "public"."forms" WHERE "owner_id" = (SELECT "id" FROM "public"."users" WHERE "name" = 'User 1'));

  -- List user 1
  SELECT * FROM "public"."users" WHERE "name" = 'User 1';

  -- Delete User 1
  DELETE FROM "public"."users" WHERE "name" = 'User 1';


  -- Add user_id column to answers table
  ALTER TABLE "public"."answers" ADD COLUMN "user_id" uuid DEFAULT NULL;

  -- Add foreign key constraint
  ALTER TABLE "public"."answers" ADD CONSTRAINT fk_user
    FOREIGN KEY ("user_id") 
    REFERENCES "public"."users" ("id");

  -- Update existing answers with user_id
  UPDATE "public"."answers" a
  SET "user_id" = f."owner_id"
  FROM "public"."forms" f
  WHERE a."form_id" = f."id";

  -- Define que coluna não pode ser nula
  ALTER TABLE "public"."answers" ALTER COLUMN "user_id" SET NOT NULL;


    -- Insert answers (5 answers per form, referencing user)
  INSERT INTO "public"."answers" ("value", "form_id", "user_id")
  SELECT 
      'Answer ' || (ROW_NUMBER() OVER (PARTITION BY f.id) % 5 + 1) || ' for ' || f.title,
      f.id,
      f.owner_id
  FROM "public"."forms" f
  CROSS JOIN generate_series(1, 5);



```

### **4.3 Verificar Defasagem de Dados na Nova Instância [ ]**

- Verifique que existem apenas 2 tabelas na nova instância: "public"."users" e "public"."forms".
- Verifique que ainda existe User 1 na nova instância.

```sql
  SELECT * FROM "public"."users";
```

## **6. Faz upgrade da instância clonada para versão PostgreSQL 12 (15min) [ ]**

Ref: https://cloud.google.com/sql/docs/postgres/upgrade-major-db-version-inplace

No console do Google Cloud, acesse a página de Instâncias do Cloud SQL.

1. Para abrir a página de Visão Geral de uma instância, clique no nome da instância.
2. Clique em Editar.
3. Na seção Informações da Instância, clique no botão Atualizar e confirme que deseja ir para a página de atualização.
4. Na página Escolher uma versão de banco de dados, clique na lista Versão do banco de dados para atualização e selecione a próxima versão major (12).
5. Clique em Continuar.
6. Na caixa ID da Instância, insira o nome da instância que deseja atualizar e depois clique no botão Iniciar atualização.

A operação leva vários minutos para ser concluída. 

7. Verifique se a versão principal atualizada do banco de dados aparece abaixo do nome da instância na página de Visão Geral da instância.

## **6. Ativar a Replicação Lógica na Nova Instância [ ]**
Assim que a instância clonada estiver disponível, sincronize as mudanças que chegaram na instância principal durante o período de clonagem.

### **6.1 Criar a assinatura da replicação lógica na nova instância [ ]**

6.1.1. Antes de criar a assinatura, assegure-se de:
   - No Console do Google Cloud, acesse a página da instância SQL de origem.
     Vá para "Conexões" > "Rede" e adicione o IP da instância de destino
     à seção "Redes autorizadas".
   - As regras de firewall necessárias estão configuradas. Para PostgreSQL, a porta
     padrão é 5432. Certifique-se de que esta porta está aberta nas configurações de
     firewall para ambas as instâncias, de origem e destino. Você pode verificar e
     modificar as regras de firewall no Console do Google Cloud em "Rede VPC" > "Firewall".
   - O IP da instância de origem está na lista de permissões das redes autorizadas da
     instância de destino. Para isso, vá ao Console do Google Cloud, acesse a página da
     instância SQL de destino, depois vá para "Conexões" > "Rede" e adicione o IP da
     instância de origem à seção "Redes autorizadas".

6.1.2. Acesse a **nova instância PostgreSQL 12**.

6.1.3. Execute o seguinte comando para começar a replicar os dados pendentes:

   ```sql
   CREATE SUBSCRIPTION my_sub
   CONNECTION 'host=<HOST> dbname=<DB_NAME> user=<USUARIO> password=<SENHA>'
   PUBLICATION my_pub;
   ```

   Exemplo:

   -- Verify that logical replication is enabled
   SHOW cloudsql.logical_decoding;

   -- Create the subscription
   CREATE SUBSCRIPTION my_sub
   CONNECTION 'host=34.66.181.252 dbname=postgres user=postgres password=inspection-password'
   PUBLICATION my_pub
   <!-- WITH (create_slot = false, enabled = false); -->

   -- Enable the subscription
   ALTER SUBSCRIPTION my_sub ENABLE;

6.1.4. Se o erro persistir, verifique:
   - O endereço IP está correto e a instância de origem está em execução.
   - A porta (padrão 5432) está aberta e acessível. Para verificar e garantir isso:
     1. No Console do GCP, vá para "Rede VPC" > "Firewall".
     2. Verifique se há uma regra permitindo tráfego na porta 5432.
     3. Se não houver, crie uma nova regra:
        - Nome: allow-postgres-replication
        - Rede: (selecione a VPC onde as instâncias estão)
        - Prioridade: 1000
        - Direção do tráfego: Entrada
        - Ação em caso de correspondência: Permitir
        - Destino: Intervalos de IP especificados
        - Intervalos de IP de destino: 34.133.188.80/32
        - Origem: Intervalos de IP especificados
        - Intervalos de IP de origem: 34.134.2.90/32
        - Portas especificadas: tcp:5432
        - Aplicar a todas as instâncias de destino: Não
     4. Use o comando `telnet <IP_INSTANCIA> 5432` para testar a conectividade.
   - O nome do banco de dados, nome de usuário e senha estão corretos.
   - A conectividade de rede entre as instâncias está configurada corretamente no GCP.
   

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


### **1.3 Plano de Rollback [ ]**

Em caso de problemas durante a migração, siga estas etapas para rollback:
1. Mantenha a instância PostgreSQL 11 ativa até confirmar estabilidade
2. Documente as strings de conexão antigas
3. Mantenha scripts de reversão prontos para cada etapa

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
