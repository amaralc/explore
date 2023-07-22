# References:
# - https://www.keycloak.org/server/containers
# - https://stackoverflow.com/a/76210250

FROM quay.io/keycloak/keycloak:22.0.0 as builder

# Enable health and metrics support
ENV KC_HEALTH_ENABLED=true
ENV KC_METRICS_ENABLED=true
ENV KC_FEATURES=preview,token-exchange

# Configure a database vendor
ENV KC_DB=postgres

# This is needed in order to use com.google.cloud.sql.mysql.SocketFactory
# More at https://github.com/GoogleCloudPlatform/cloud-sql-jdbc-socket-factory/blob/main/docs/jdbc-mysql.md
COPY postgres-socket-factory-1.2.0-jar-with-driver-and-dependencies.jar /opt/keycloak/providers/
RUN /opt/keycloak/bin/kc.sh build --transaction-xa-enabled=false

FROM quay.io/keycloak/keycloak:22.0.0

# Install socket for postgres
COPY postgres-socket-factory-1.2.0-jar-with-driver-and-dependencies.jar /opt/keycloak/providers/
COPY --from=builder /opt/keycloak /opt/keycloak

WORKDIR /opt/keycloak
# # for demonstration purposes only, please make sure to use proper certificates in production instead
# RUN keytool -genkeypair -storepass password -storetype PKCS12 -keyalg RSA -keysize 2048 -dname "CN=server" -alias server -ext "SAN:c=DNS:localhost,IP:127.0.0.1" -keystore conf/server.keystore
# RUN /opt/keycloak/bin/kc.sh build

# change these values to point to a running postgres instance
# # Values for postgres connection are being passed in from the cloud run deployment environment variables

ENV KC_HEALTH_ENABLED=true
ENV KC_METRICS_ENABLED=true
ENV KC_FEATURES=preview,token-exchange

ENV KEYCLOAK_ADMIN=admin
ENV KEYCLOAK_ADMIN_PASSWORD=admin

ENV KC_DB=postgres
ENV KC_TRANSACTION_XA_ENABLED=false

# ENV KC_DB_URL=<DBURL>
# ENV KC_DB_USERNAME=<DBUSERNAME>
# ENV KC_DB_PASSWORD=<DBPASSWORD>

ENV KC_HOSTNAME_STRICT=false
ENV KC_HTTPS_CLIENT_AUTH=request
ENV KC_HTTPS_PORT=8443
ENV KC_HTTPS_PROTOCOLS=TLSv1.3,TLSv1.2
ENV KC_HTTP_ENABLED=true
ENV KC_HTTP_PORT=8080
ENV KC_PROXY=edge
ENV PROXY_ADDRESS_FORWARDING=true
# ENV KC_HOSTNAME=localhost

# Do NOT use the --optimized flag for the start command if you want to use a particular DB (except the H2)
# https://keycloak.discourse.group/t/how-should-kc-db-url-be-formatted-for-postgres/18626/3
# https://www.keycloak.org/server/db#:~:text=Do%20NOT%20use,Configuring%20Keycloak
# ENTRYPOINT ["/opt/keycloak/bin/kc.sh", "start"]
ENTRYPOINT ["/opt/keycloak/bin/kc.sh", "start", "--optimized", "--spi-email-template-provider=freemarker-plus-mustache", "--spi-email-template-freemarker-plus-mustache-enabled=true"]
