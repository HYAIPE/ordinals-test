# Use Amazon Linux 2023 as the base image
FROM public.ecr.aws/amazonlinux/amazonlinux:2023

# Install Rust and cross-compilation dependencies
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
ENV PATH="/root/.cargo/bin:${PATH}"
RUN yum update -y
RUN yum install -y gcc gcc-c++ openssl-devel
RUN rustup target add aarch64-unknown-linux-gnu

# Install cross-compilation tools
RUN yum install -y gcc-aarch64-linux-gnu glibc-static

# Copy the Rust project files to the container
WORKDIR /usr/src/myapp
COPY . .

# Build the project for aarch64
RUN cargo build --release --target=aarch64-unknown-linux-gnu

# The binary will be at /usr/src/myapp/target/aarch64-unknown-linux-gnu/release
CMD ["./target/aarch64-unknown-linux-gnu/release/myapp"]
