use tauri::{
    plugin::{Builder, TauriPlugin},
    Runtime,
};

use api::*;

mod api;
mod declare;
mod fsys;
mod windows;

/// Initializes the plugin.
pub fn init<R: Runtime>() -> TauriPlugin<R> {
    if cfg!(windows) {
        windows::init_windows();
    }

    Builder::new("printer")
        .invoke_handler(tauri::generate_handler![
            create_temp_file,
            remove_temp_file,
            get_printers,
            get_printers_by_name,
            print_pdf,
            get_jobs,
            get_jobs_by_id,
            resume_job,
            restart_job,
            pause_job,
            remove_job,
        ])
        .build()
}
