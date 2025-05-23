import pkg from "pg";
import dotenv from "dotenv";
import createUserTable from "../data/createUserTable";
import createProjectsTable from "../data/createProjectTable";
import createTasksTable from "../data/createTaskTable";
import createProjectMembersTable from "../data/createProjectMembersTable";
import createPendingInvitationsTable from "../data/createProjectPendingInvitationsTable";
import createFilesTable from "../data/createFilesTable";
import createAssignmentsTable from "../data/createAssignmentsTable";
import createMilestoneTable from "../data/createMilestoneTable";
import createLabelTable from "../data/createLabelTable";
import createTaskLabelTable from "../data/createTaskLabelTable";
import createSubtaskTable from "../data/createSubtaskTable";
import createCommentTable from "../data/createCommentsTable";
import cron from 'node-cron';
import { checkDueMilestonesAndSendReminders, checkDueTasksAndSendReminders } from "../services/taskReminder";
import createChangeLogsTable from "../data/log/createChangeLogsTable";
import { createChangeLogTriggerFunction } from "../data/log/triggerFunction";
import { addAuditTriggers } from "../middlewares/audittriggersForTables";

const { Pool } = pkg;

dotenv.config();

// PostgreSQL connection pool
// Pool is a collection of pre-established database connections that can be reused, 
// because every time open or close a connection, it will take time and resources
// but with pool it's keep the connection open and ready to use
// it's good for performance and allows to handle multiple requests at the same time

// usage: 
// 1, when the app starts, it will create more db connections and store them in the pool (e.q 10 connections)
// 2, when a request comes in, it will take a connection from the pool and use it to handle the request
// 3, when the request is finished, it will return the connection to the pool
// if all the connections are busy, it will wait until one is available
// if a connection is idle for too long, it will be closed automatically
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DATABASE,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || "5432")
})

// Create tables when the app starts
export const initializeDatabase = async () => {
    await createUserTable();
    await createProjectsTable();
    await createMilestoneTable();
    await createTasksTable();
    await createLabelTable();
    await createTaskLabelTable();
    await createSubtaskTable();
    await createCommentTable();
    await createProjectMembersTable();
    await createAssignmentsTable();
    await createPendingInvitationsTable();
    await createFilesTable();

    await createChangeLogsTable();
    await createChangeLogTriggerFunction();
    await addAuditTriggers();
};

// listens for new connections and when a new connection is requested from the pool it will execute this callback function
pool.on("connect", () => {
    console.log("Connected to database");
})

// daily tasks due date check every day at 9AM
cron.schedule(
    '0 9 * * *',
    async () => {
        console.log('Running daily task reminder check...');
        try {
            await checkDueTasksAndSendReminders();
            console.log('Daily task reminder check completed.');
        } catch (error) {
            console.error('Error running daily task reminder check:', error);
        }
    },
    { timezone: 'UTC' }
);

// daily milestones due date check every day at 9AM
cron.schedule(
    '0 9 * * *',
    async () => {
        console.log('Running daily milestone reminder check...');
        try {
            await checkDueMilestonesAndSendReminders();
            console.log('Daily milestone reminder check completed.');
        } catch (error) {
            console.error('Error running daily milestone reminder check:', error);
        }
    },
    { timezone: 'UTC' }
);

export default pool