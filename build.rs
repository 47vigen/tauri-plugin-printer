const COMMANDS: &[&str] = &[
    "create_temp_file",
    "remove_temp_file",
    "get_printers",
    "get_printers_by_name",
    "print_pdf",
    "get_jobs",
    "get_jobs_by_id",
    "resume_job",
    "restart_job",
    "pause_job",
    "remove_job",
];

fn main() {
    tauri_plugin::Builder::new(COMMANDS).build();
}
