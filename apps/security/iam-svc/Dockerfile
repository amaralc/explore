# References:
# - https://www.keycloak.org/server/containers

FROM quay.io/keycloak/keycloak:22.0.0 as builder

# Enable health and metrics support
ENV KC_HEALTH_ENABLED=true
ENV KC_METRICS_ENABLED=true

# Configure a database vendor
# ENV KC_DB=postgres

WORKDIR /opt/keycloak

# for demonstration purposes only, please make sure to use proper certificates in production instead
RUN keytool -genkeypair -storepass password -storetype PKCS12 -keyalg RSA -keysize 2048 -dname "CN=server" -alias server -ext "SAN:c=DNS:localhost,IP:127.0.0.1" -keystore conf/server.keystore
RUN /opt/keycloak/bin/kc.sh build

FROM quay.io/keycloak/keycloak:22.0.0
COPY --from=builder /opt/keycloak/ /opt/keycloak/

# change these values to point to a running postgres instance
ENV KC_DB=postgres

# # Values for postgres connection are being passed in from the cloud run deployment environment variables
# ENV KC_DB_URL=<DBURL>
# ENV KC_DB_USERNAME=<DBUSERNAME>
# ENV KC_DB_PASSWORD=<DBPASSWORD>

ENV KC_HOSTNAME=localhost

# Do NOT use the --optimized flag for the start command if you want to use a particular DB (except the H2)
# https://keycloak.discourse.group/t/how-should-kc-db-url-be-formatted-for-postgres/18626/3
# https://www.keycloak.org/server/db#:~:text=Do%20NOT%20use,Configuring%20Keycloak
ENTRYPOINT ["/opt/keycloak/bin/kc.sh", "start"]
