## Node

Only used to make a silly little health check. I could have done something much smaller.

## Bitcoin

I grabbed latest bitcoin arm binary and placed [here](../deploy/bitcoin/bitcoin-26.0-aarch64-linux-gnu.tar.gz)

## Building electrs

Electrs needs to be cross-compiled for aarch64 (ARM) to run on EC2 graviton

```bash
sudo apt install gcc-aarch64-linux-gnu g++-aarch64-linux-gnu
rustup toolchain install stable-aarch64-unknown-linux-gnu
rustup target install aarch64-unknown-linux-gnu
```

```bash
cd /path/to/electrs
export RUSTFLAGS="-Ctarget-cpu=neoverse-n1"
export PKG_CONFIG_ALLOW_CROSS=1
export CARGO_TARGET_AARCH64_UNKNOWN_LINUX_GNU_LINKER=aarch64-linux-gnu-gcc
export CC_aarch64_unknown_linux_gnu=aarch64-linux-gnu-gcc
export CXX_aarch64_unknown_linux_gnu=aarch64-linux-gnu-g++
cargo build --release --target aarch64-unknown-linux-gnu
```

binary will be at `target/aarch64-unknown-linux-gnu/release/electrs`
