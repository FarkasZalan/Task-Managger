export interface Project {
    id: string;
    name: string;
    description: string;
    owner_id: string;
    status: "not-started" | "in-progress" | "completed";
    memberCount: number;
    total_tasks?: number;
    completed_tasks: number;
    progress: number;
    attachments_count: number;
    read_only: boolean;
}