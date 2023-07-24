# References:
# - https://www.keycloak.org/server/containers
# - https://stackoverflow.com/a/76210250
# - https://github.com/mpbits/dev-ops/blob/main/gcp/keycloak/Dockerfile

FROM quay.io/keycloak/keycloak:latest as builder

ENV KC_HEALTH_ENABLED=true
ENV KC_METRICS_ENABLED=true
ENV KC_FEATURES=token-exchange
ENV KC_DB=postgres

# This is needed in order to use com.google.cloud.sql.postgres.SocketFactory
# More at https://github.com/GoogleCloudPlatform/cloud-sql-jdbc-socket-factory/blob/main/docs/jdbc-postgres.md
ENV KC_DB_KIND=postgres
ENV KC_DB_DIALECT=org.hibernate.dialect.PostgreSQL10Dialect
ENV KC_DB_DRIVER=org.postgresql.Driver

# Install custom providers
RUN wget -P /opt/keycloak/providers/ https://storage.googleapis.com/cloud-sql-java-connector/v1.8.1/postgres-socket-factory-1.8.1-jar-with-dependencies.jar
RUN wget -P /opt/keycloak/providers/ https://github.com/aerogear/keycloak-metrics-spi/releases/download/2.5.3/keycloak-metrics-spi-2.5.3.jar

RUN /opt/keycloak/bin/kc.sh build --transaction-xa-enabled=false

FROM quay.io/keycloak/keycloak:latest

# TODO: verify if next line is needed
# COPY postgres-socket-factory-1.8.1-jar-with-dependencies.jar /opt/keycloak/providers/

COPY --from=builder /opt/keycloak /opt/keycloak
WORKDIR /opt/keycloak
# for demonstration purposes only, please make sure to use proper certificates in production instead
RUN keytool -genkeypair -storepass password -storetype PKCS12 -keyalg RSA -keysize 2048 -dname "CN=server" -alias server -ext "SAN:c=DNS:localhost,IP:127.0.0.1" -keystore conf/server.keystore
# change these values to point to a running postgres instance
ENV KC_HEALTH_ENABLED=true
ENV KC_METRICS_ENABLED=true
ENV KC_FEATURES=token-exchange

ENV KEYCLOAK_ADMIN=fake-preview-admin
ENV KEYCLOAK_ADMIN_PASSWORD=fake-preview-admin

ENV KC_DB=postgres
ENV KC_DB_KIND=postgres
ENV KC_DB_DIALECT=org.hibernate.dialect.PostgreSQL10Dialect
ENV KC_DB_DRIVER=org.postgresql.Driver
ENV KC_TRANSACTION_XA_ENABLED=false

# ENV KC_DB_URL="jdbc:postgresql:///<DATABASE_NAME>?cloudSqlInstance=<INSTANCE_CONNECTION_NAME>&socketFactory=com.google.cloud.sql.postgres.SocketFactory"
# ENV KC_DB_USERNAME=<POSTGRESQL_USERNAME>
# ENV KC_DB_PASSWORD=<POSTGRESQL_USER_PASSWORD>

ENV KC_HOSTNAME_STRICT=false
ENV KC_HTTPS_CLIENT_AUTH=request
ENV KC_HTTPS_PORT=8443
ENV KC_HTTPS_PROTOCOLS=TLSv1.3,TLSv1.2
ENV KC_HTTP_ENABLED=true
ENV KC_HTTP_PORT=8080
ENV KC_PROXY=edge
ENV PROXY_ADDRESS_FORWARDING=true

ENTRYPOINT ["/opt/keycloak/bin/kc.sh", "start"]
