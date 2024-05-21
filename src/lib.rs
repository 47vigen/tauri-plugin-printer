use tauri::{
    plugin::{Builder, TauriPlugin},
    Runtime,
};

pub use models::*;

mod commands;
mod error;
mod fsys;
mod models;
mod windows;

pub use error::{Error, Result};

/// Initializes the plugin.
pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("printer")
        .invoke_handler(tauri::generate_handler![
            commands::create_temp_file,
            commands::remove_temp_file,
            commands::get_printers,
            commands::get_printers_by_name,
            commands::print_pdf,
            commands::get_jobs,
            commands::get_jobs_by_id,
            commands::resume_job,
            commands::restart_job,
            commands::pause_job,
            commands::remove_job,
        ])
        .setup(move |_app, _webview| {
            if cfg!(windows) {
                let _ = windows::init_windows();
            }

            Ok(())
        })
        .build()
}
