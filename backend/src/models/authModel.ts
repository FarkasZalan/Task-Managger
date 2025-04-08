import pool from "../config/db";
import bcrypt from "bcrypt";

export const createUserQuery = async (email: string, name: string, userHashedPassword: string) => {
    const result = await pool.query("INSERT INTO users (email, name, password, updated_at) VALUES ($1, $2, $3, NOW()) RETURNING *", [email, name, userHashedPassword]);
    return result.rows[0];
}

export const findByEmail = async (email: string) => {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    return result.rows[0];
}

// Store Refresh Token
export const storeRefreshToken = async (userId: string, refreshSessionId: string) => {
    const hashedSessionId = await bcrypt.hash(refreshSessionId, 10); // Hash the refresh session ID
    await pool.query("UPDATE users SET refresh_session_id = $1, updated_at = NOW() WHERE id = $2 RETURNING *", [hashedSessionId, userId]);

    return hashedSessionId;
}

// Clear Refresh Token on logout
export const clearRefreshTokenInDB = async (userId: string) => {
    const result = await pool.query("UPDATE users SET refresh_session_id = NULL, updated_at = NOW() WHERE id = $1 RETURNING *", [userId]);
    return result.rows[0];
}

// Find or create OAuth user (Google, GitHub)
export const findOrCreateOAuthUser = async (profile: any, provider: string) => {
    // Check if user exists with this provider ID
    const result = await pool.query(
        "SELECT * FROM users WHERE email = $1",
        [profile.email]
    );

    if (result.rows.length > 0) {
        // User exists, update provider info if needed
        await pool.query(
            "UPDATE users SET provider = $1, provider_id = $2, updated_at = NOW() WHERE id = $3",
            [provider, profile.id, result.rows[0].id]
        );
        return result.rows[0];
    } else {
        // Create new user
        const newUser = await pool.query(
            "INSERT INTO users (email, name, password, provider, provider_id, updated_at) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *",
            [profile.email, profile.displayName, 'OAUTH_USER', provider, profile.id]
        );
        return newUser.rows[0];
    }
};