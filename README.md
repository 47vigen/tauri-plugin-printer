# Tauri Plugin Printer

Interface with printers through [Powershell](https://learn.microsoft.com/en-us/powershell/scripting/install/installing-powershell-on-windows?view=powershell-7.3)

## Installation

There are three general methods of installation that we can recommend.

1. Use crates.io and npm (easiest, and requires you to trust that our publishing pipeline worked)
2. Pull sources directly from Github using git tags / revision hashes (most secure)
3. Git submodule install this repo in your tauri project and then use file protocol to ingest the source (most secure, but inconvenient to use)

### RUST

Install the Core plugin by adding the following to your `Cargo.toml` file:

`src-tauri/Cargo.toml`

```toml
[dependencies]
tauri-plugin-printer = { git = "https://github.com/47vigen/tauri-plugin-printer", tag = "v3.0.0" }
```

Use in `src-tauri/src/main.rs`:

```RUST
use tauri_plugin_printer;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_printer::init())
        .build()
        .run();
}
```

### WEBVIEW

`Install from a tagged release`

```
npm install github:47vigen/tauri-plugin-printer#v3.0.0
# or
yarn add github:47vigen/tauri-plugin-printer#v3.0.0
```

`Install from a branch (dev)`

```
npm install https://github.com/47vigen/tauri-plugin-printer\#master
# or
yarn add https://github.com/47vigen/tauri-plugin-printer\#master
```

`package.json`

```json
  "dependencies": {
    "tauri-plugin-printer-api": "github:47vigen/tauri-plugin-printer#v3.0.0",
  }
```

`Use within your JS/TS:`

todo...
