import pool from "../config/db";

export const addUserToProjectQuery = async (project_id: string, user_id: string, role: string) => {
    await pool.query("INSERT INTO project_members (project_id, user_id, role) VALUES ($1, $2, $3) ON CONFLICT (project_id, user_id) DO NOTHING RETURNING *", [project_id, user_id, role]);
}

export const inviteToProjectQuery = async (project_id: string, email: string, role: string) => {
    await pool.query("INSERT INTO pending_project_invitations (project_id, email, role) VALUES ($1, $2, $3) ON CONFLICT (project_id, email) DO NOTHING RETURNING *", [project_id, email, role]);
}

export const getPendingUsersQuery = async (project_id: string) => {
    const result = await pool.query("SELECT * FROM pending_project_invitations WHERE project_id = $1", [project_id]); // send a query to the database with one of the open connection from the pool
    return result.rows
}

export const getPendingUserQuery = async (project_id: string, user_id: string) => {
    const result = await pool.query("SELECT * FROM pending_project_invitations WHERE project_id = $1 AND id = $2", [project_id, user_id]); // send a query to the database with one of the open connection from the pool
    return result.rows[0]
}

export const getProjectMembersQuery = async (project_id: string) => {
    const result = await pool.query("SELECT * FROM project_members WHERE project_id = $1", [project_id]); // send a query to the database with one of the open connection from the pool
    return result.rows
}

export const getProjectMemberQuery = async (project_id: string, user_id: string) => {
    const result = await pool.query("SELECT * FROM project_members WHERE project_id = $1 AND user_id = $2", [project_id, user_id]); // send a query to the database with one of the open connection from the pool
    return result.rows[0]
}

export const deleteUserFromProjectQuery = async (project_id: string, user_id: string) => {
    await pool.query("DELETE FROM project_members WHERE project_id = $1 AND user_id = $2 RETURNING *", [project_id, user_id]);
}

export const deletePendingUserQuery = async (invite_id: string) => {
    await pool.query("DELETE FROM pending_project_invitations WHERE id = $1 RETURNING*", [invite_id]);
}