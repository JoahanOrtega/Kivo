FROM rust:1.85-slim

WORKDIR /app

# Instalar dependencias del sistema — sqlite3 necesario para sqlx
RUN apt-get update && apt-get install -y \
    pkg-config \
    libssl-dev \
    libsqlite3-dev \
    && rm -rf /var/lib/apt/lists/*

COPY . .

RUN cargo build --release

EXPOSE 8080

CMD ["./target/release/kivo-backend"]