import { Request, Response } from "express";
import { NextFunction } from "connect";
import { addMilestoneToTaskQuery, createMilestoneQuery, deleteMilestoneFromTaskQuery, deleteMilestoneQuery, getAllMilestonesForProjectQuery, getAllTaskForMilestoneQuery, getAllUnassignedTaskForMilestoneQuery, getMilestoneByIdQuery, recalculateAllTasksInMilestoneQuery, recalculateCompletedTasksInMilestoneQuery, updateMilestoneQuery } from "../models/milestonesModel";
import { getParentTaskForSubtaskQuery, getTaskByIdQuery } from "../models/task.Model";
import { getLabelsForTaskQuery } from "../models/labelModel";
import { getProjectByIdQuery } from "../models/projectModel";

// Standardized response function
// it's a function that returns a response to the client when a request is made (CRUD operations)
const handleResponse = (res: Response, status: number, message: string, data: any) => {
    return res.status(status).json({
        status,
        message,
        data
    });
};

export const createMilestone = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const project_id = req.params.projectId;
        const { name, description, due_date } = req.body;

        const project = await getProjectByIdQuery(project_id);
        if (!project) {
            handleResponse(res, 404, "Project not found", null);
            return;
        }

        if (project.read_only) {
            handleResponse(res, 400, "Project is read-only", null);
            return;
        }

        const newMilestone = await createMilestoneQuery(project_id, name, description, due_date);
        handleResponse(res, 201, "Milestone created successfully", newMilestone);
    } catch (error: Error | any) {
        // Check for unique constraint violation (duplicate email)
        if (error.code === "23505") {
            handleResponse(res, 409, "Milestone already exists", null);
        } else {
            // Pass other errors to the next middleware (errorHandling middleware)
            next(error);
        }
    }
}

export const getAllMilestonesForProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const milestones = await getAllMilestonesForProjectQuery(req.params.projectId);
        handleResponse(res, 200, "Milestones fetched successfully", milestones);
    } catch (error) {
        next(error);
    }
}

export const getMilestoneById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const milestone = await getMilestoneByIdQuery(req.params.milestoneId);
        handleResponse(res, 200, "Milestone fetched successfully", milestone);
    } catch (error) {
        next(error);
    }
}

export const addMilestoneToTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const projectId = req.params.projectId;
        const { taskIds } = req.body;
        const milestone_id = req.params.milestoneId;

        const project = await getProjectByIdQuery(projectId);
        if (!project) {
            handleResponse(res, 404, "Project not found", null);
            return;
        }

        if (project.read_only) {
            handleResponse(res, 400, "Project is read-only", null);
            return;
        }

        const updatedTasks = [];
        for (const taskId of taskIds) {
            const updateTask = await addMilestoneToTaskQuery(taskId, milestone_id);
            if (!updateTask) {
                handleResponse(res, 404, "Task not found", null);
                return;
            }

            await recalculateAllTasksInMilestoneQuery(projectId, milestone_id)
            await recalculateCompletedTasksInMilestoneQuery(projectId, milestone_id)
            updatedTasks.push(updateTask);
        }


        handleResponse(res, 200, "Task updated successfully", updatedTasks);
    } catch (error) {
        next(error);
    }
}

export const getAllTaskForMilestone = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const tasks = await getAllTaskForMilestoneQuery(req.params.milestoneId);

        for (const task of tasks) {
            const taskLabels = await getLabelsForTaskQuery(task.id);
            task.labels = taskLabels;

            task.parent_task_id = await getParentTaskForSubtaskQuery(task.id) || null;
            if (task.parent_task_id) {
                const parentTask = await getTaskByIdQuery(task.parent_task_id) || null;
                task.parent_task_name = parentTask.title || null;
            }
        }
        handleResponse(res, 200, "Tasks fetched successfully", tasks);
    } catch (error) {
        next(error);
    }
}

export const getAllUnassignedTaskForMilestone = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const tasks = await getAllUnassignedTaskForMilestoneQuery(req.params.projectId);

        for (const task of tasks) {
            const taskLabels = await getLabelsForTaskQuery(task.id);
            task.labels = taskLabels;

            task.parent_task_id = await getParentTaskForSubtaskQuery(task.id) || null;
            if (task.parent_task_id) {
                const parentTask = await getTaskByIdQuery(task.parent_task_id) || null;
                task.parent_task_name = parentTask.title || null;
            }
        }
        handleResponse(res, 200, "Tasks fetched successfully", tasks);
    } catch (error) {
        next(error);
    }
}

export const deleteMilestoneFromTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const projectId = req.params.projectId;
        const milestone_id = req.params.milestoneId;
        const taskId = req.body.taskId;

        const project = await getProjectByIdQuery(projectId);
        if (!project) {
            handleResponse(res, 404, "Project not found", null);
            return;
        }

        if (project.read_only) {
            handleResponse(res, 400, "Project is read-only", null);
            return;
        }

        await deleteMilestoneFromTaskQuery(taskId);

        await recalculateAllTasksInMilestoneQuery(projectId, milestone_id)
        await recalculateCompletedTasksInMilestoneQuery(projectId, milestone_id)
        handleResponse(res, 200, "Milestone removed from task successfully", null);
    } catch (error) {
        next(error);
    }
}

export const updateMilestone = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const milestone_id = req.params.milestoneId;
        const projectId = req.params.projectId;
        const { name, description, due_date } = req.body;

        const project = await getProjectByIdQuery(projectId);
        if (!project) {
            handleResponse(res, 404, "Project not found", null);
            return;
        }

        if (project.read_only) {
            handleResponse(res, 400, "Project is read-only", null);
            return;
        }

        const updatedMilestone = await updateMilestoneQuery(milestone_id, name, description, due_date);

        updatedMilestone.labels = await getLabelsForTaskQuery(updatedMilestone.id)
        handleResponse(res, 200, "Milestone updated successfully", updatedMilestone);

    } catch (error) {
        next(error);
    }
}

export const deleteMilestone = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const milestoneId = req.params.milestoneId;
        const projectId = req.params.projectId;

        const project = await getProjectByIdQuery(projectId);
        if (!project) {
            handleResponse(res, 404, "Project not found", null);
            return;
        }

        if (project.read_only) {
            handleResponse(res, 400, "Project is read-only", null);
            return;
        }

        await deleteMilestoneQuery(milestoneId);
        handleResponse(res, 200, "Milestone deleted successfully", null);
    } catch (error) {
        next(error);
    }
}