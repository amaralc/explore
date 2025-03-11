# **Procedimento Operacional: Upgrade do Cloud SQL PostgreSQL 11 para 13 sem Downtime**

## **1. Preparação para a Clonagem**
Antes de iniciar o processo de clonagem, configure a **replicação lógica** na instância **PostgreSQL 11** para capturar todas as alterações realizadas durante a clonagem.

### **1.1 Habilitar replicação lógica na instância principal**
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

## **2. Criar uma Réplica de Leitura (caso ainda não exista)**
Se ainda não houver uma réplica de leitura configurada, crie uma para ser usada como base para o clone.

### **2.1 Criar uma réplica de leitura**
1. No **Cloud SQL**, acesse a instância **PostgreSQL 11**.
2. No menu **Replicação**, clique em **Criar réplica**.
3. Configure a réplica com os mesmos recursos da instância principal.
4. Aguarde até que a réplica seja sincronizada e esteja recebendo atualizações da instância principal.

---

## **3. Clonar a Réplica de Leitura**
Agora que a réplica está pronta, crie a nova instância **PostgreSQL 13** baseada nela.

### **3.1 Criar o clone**
1. No **Cloud SQL**, acesse a réplica de leitura.
2. Clique em **Clonar instância**.
3. Escolha **PostgreSQL 13** como versão alvo.
4. Aguarde aproximadamente **25 minutos** até a clonagem ser concluída.

---

## **4. Ativar a Replicação Lógica na Nova Instância**
Assim que a instância clonada estiver disponível, sincronize as mudanças que chegaram na instância principal durante o período de clonagem.

### **4.1 Criar a assinatura da replicação lógica na nova instância**
1. Acesse a **nova instância PostgreSQL 13**.
2. Execute o seguinte comando para começar a replicar os dados pendentes:

   ```sql
   CREATE SUBSCRIPTION my_sub
   CONNECTION 'host=<IP_DA_INSTANCIA_11> dbname=<DB_NAME> user=<USUARIO> password=<SENHA>'
   PUBLICATION my_pub;
   ```

---

## **5. Validar a Sincronização**
Antes de redirecionar a aplicação, verifique se os dados foram corretamente replicados.

### **5.1 Verificar o status da replicação**
1. Execute o seguinte comando na **instância PostgreSQL 13**:

   ```sql
   SELECT * FROM pg_stat_subscription;
   ```

2. Confirme que todas as alterações foram aplicadas corretamente antes de prosseguir.

---

## **6. Alternar a Aplicação para a Nova Instância**
Agora que a nova instância **PostgreSQL 13** contém todos os dados mais recentes, altere a configuração da aplicação para usá-la.

### **6.1 Atualizar a conexão no AdonisJS**
1. Edite o arquivo **`.env` ou `config/database.js`** e altere para a nova instância:

   ```js
   const Env = use('Env')

   module.exports = {
     connection: 'pgNew', // Alterando para a nova instância

     pgNew: {
       client: 'pg',
       connection: {
         host: Env.get('DB_NEW_HOST'),
         user: Env.get('DB_NEW_USER'),
         password: Env.get('DB_NEW_PASSWORD'),
         database: Env.get('DB_NEW_DATABASE'),
       },
     },
   }
   ```

2. **Reinicie a aplicação** para aplicar as novas configurações:

   ```sh
   pm2 restart all  # Se estiver usando PM2 no AdonisJS
   ```

3. **Monitore os logs da aplicação** para garantir que todas as conexões estejam funcionando corretamente.

---

## **7. Encerrar a Instância Antiga**
Se tudo estiver correto, finalize o processo removendo a assinatura de replicação lógica e desligando a instância **PostgreSQL 11**.

### **7.1 Remover a assinatura da replicação lógica**
1. Execute o seguinte comando na **instância PostgreSQL 13**:

   ```sql
   DROP SUBSCRIPTION my_sub;
   ```

### **7.2 Desativar ou excluir a instância antiga**
1. No **Cloud SQL**, acesse a **instância PostgreSQL 11**.
2. Confirme que a replicação foi desativada e que a aplicação está rodando na nova instância.
3. **Exclua a instância** ou mantenha-a desligada para backup temporário.

---

## **Resumo do Processo**
✅ **Configurar replicação lógica** na instância principal para capturar todas as mudanças.
✅ **Criar uma réplica de leitura** no Cloud SQL para servir como base do clone.
✅ **Clonar a réplica** para uma nova instância **PostgreSQL 13**.
✅ **Habilitar a replicação lógica** para sincronizar as alterações ocorridas durante a clonagem.
✅ **Verificar se os dados foram corretamente sincronizados** antes de alternar a aplicação.
✅ **Alterar a conexão da aplicação para a nova instância** sem downtime.
✅ **Encerrar a instância antiga** para evitar custos desnecessários.

Esse procedimento garante **uma migração segura, eficiente e sem downtime**. 🚀
