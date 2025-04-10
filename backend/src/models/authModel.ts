import pool from "../config/db";
import bcrypt from "bcrypt";
import crypto from 'crypto';

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
    try {
        const hashedSessionId = await bcrypt.hash(refreshSessionId, 10); // Hash the refresh session ID

        const result = await pool.query(
            "UPDATE users SET refresh_session_id = $1, updated_at = NOW() WHERE id = $2 RETURNING *",
            [hashedSessionId, userId]
        );

        if (result.rows.length === 0) {
            console.error('Failed to update user with refresh session ID');
            throw new Error('Failed to update user with refresh session ID');
        }
        return hashedSessionId;
    } catch (error) {
        console.error('Error storing refresh token:', error);
        throw error;
    }
}

// Clear Refresh Token on logout
export const clearRefreshTokenInDB = async (userId: string) => {
    try {
        const result = await pool.query(
            "UPDATE users SET refresh_session_id = NULL, updated_at = NOW() WHERE id = $1 RETURNING *",
            [userId]
        );

        if (result.rows.length === 0) {
            console.error('Failed to clear refresh token for user');
            throw new Error('Failed to clear refresh token for user');
        }

        return result.rows[0];
    } catch (error) {
        console.error('Error clearing refresh token:', error);
        throw error;
    }
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
        return newUser.rows[0]; // Return the newly created user
    }
};

/**
 * Create a password reset token for a user
 * @param email - The user's email address
 * @returns The reset token or null if user not found
 */
export const createPasswordResetToken = async (email: string): Promise<string | null> => {
    // Find the user by email
    const user = await findByEmail(email);

    if (!user) {
        return null;
    }

    // Generate a random token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Hash the token before storing it
    const hashedToken = await bcrypt.hash(resetToken, 10);

    // Store the hashed token and expiration time in the database
    const expirationTime = new Date();
    expirationTime.setHours(expirationTime.getHours() + 1); // Token expires in 1 hour

    await pool.query(
        "UPDATE users SET reset_password_token = $1, reset_password_expires = $2, updated_at = NOW() WHERE id = $3",
        [hashedToken, expirationTime, user.id]
    );

    return resetToken;
};

export const findUserEmailByResetPasswordToken = async (token: string): Promise<string | null> => {
    const result = await pool.query(
        "SELECT email, reset_password_token, reset_password_expires FROM users WHERE reset_password_token IS NOT NULL AND reset_password_expires > NOW()",
        []
    );

    if (result.rows.length === 0) {
        return null;
    }

    let foundEmail = null;

    for (const user of result.rows) {
        const isMatch = await bcrypt.compare(token, user.reset_password_token);
        if (isMatch) {
            foundEmail = user.email;
            break;
        }
    }
    return foundEmail;
}

/**
 * Reset a user's password
 * @param email - The user's email address
 * @param newPassword - The new password
 * @returns True if password was reset, false otherwise
 */
export const resetPassword = async (email: string, newPassword: string): Promise<boolean> => {
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password and clear the reset token
    await pool.query(
        "UPDATE users SET password = $1, reset_password_token = NULL, reset_password_expires = NULL, updated_at = NOW() WHERE email = $2",
        [hashedPassword, email]
    );

    return true;
};