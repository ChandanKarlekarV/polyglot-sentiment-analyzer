# Dockerfile
# Stage 1: Build Environment
FROM ubuntu:22.04 AS builder

ENV DEBIAN_FRONTEND=noninteractive

# Install Build Essentials and Driver Dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    libmongoc-dev \
    libbson-dev \
    librabbitmq-dev \
    libboost-all-dev \
    git \
    pkg-config \
    libssl-dev

# Compile mongocxx driver (Standard requirement for C++ Mongo integrations)
WORKDIR /build
RUN git clone https://github.com/mongodb/mongo-cxx-driver.git --branch releases/stable --depth 1 && \
    cd mongo-cxx-driver/build && \
    cmake .. -DCMAKE_BUILD_TYPE=Release -DCMAKE_INSTALL_PREFIX=/usr/local && \
    make -j$(nproc) && \
    make install

# Compile SimpleAmqpClient
WORKDIR /build
RUN git clone https://github.com/alanxz/SimpleAmqpClient.git && \
    cd SimpleAmqpClient && \
    mkdir build && cd build && \
    cmake .. -DCMAKE_INSTALL_PREFIX=/usr/local && \
    make -j$(nproc) && \
    make install

# Build the Microservice
WORKDIR /app
COPY main.cpp CMakeLists.txt ./
RUN mkdir build && cd build && \
    cmake .. && \
    make

# Stage 2: Minimal Runtime Environment
FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y \
    libmongoc-1.0-0 \
    libbson-1.0-0 \
    librabbitmq4 \
    libboost-chrono1.74.0 \
    libboost-system1.74.0 \
    && rm -rf /var/lib/apt/lists/*

# Copy compiled drivers and executable from builder
COPY --from=builder /usr/local/lib /usr/local/lib
COPY --from=builder /app/build/cpp-preprocessor /usr/local/bin/cpp-preprocessor

# Ensure the dynamic linker finds the custom libraries
ENV LD_LIBRARY_PATH=/usr/local/lib

CMD ["cpp-preprocessor"]
