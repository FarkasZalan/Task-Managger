import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
    FaTasks,
    FaUsers,
    FaCheckCircle,
    FaClock,
    FaExclamationTriangle,
    FaUserPlus,
    FaEdit,
    FaArrowLeft,
} from "react-icons/fa";
import { useAuth } from "../../../context/AuthContext";
import { fetchProjectById, getProjectMembers, deleteMemberFromProject } from "../../../services/projectService";
import { AddMemberDialog } from "./ProjectTabs/MemberHandle/AddMemberModal";
import { MembersTab } from "./ProjectTabs/MemberHandle/MembersTab";
import { TasksTab } from "./ProjectTabs/TasksTab";
import { FilesTab } from "./ProjectTabs/FilesTab";
import ProjectMember from "../../../types/projectMember";
import { DiscussionsTab } from "./ProjectTabs/DiscussionTab";

export const ProjectPage = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const { authState } = useAuth();
    const navigate = useNavigate();

    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState("tasks");
    const [showAddMember, setShowAddMember] = useState(false);
    const [members, setMembers] = useState<ProjectMember[]>([]);
    const [membersLoading, setMembersLoading] = useState(false);
    const [membersError, setMembersError] = useState<string | null>(null);

    useEffect(() => {
        const loadProject = async () => {
            try {
                setLoading(true);
                const projectData = await fetchProjectById(projectId!, authState.accessToken!);
                setProject(projectData);
            } catch (err) {
                setError("Failed to load project");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (authState.accessToken && projectId) {
            loadProject();
        }
    }, [authState.accessToken, projectId]);

    useEffect(() => {
        const loadMembers = async () => {
            if (projectId && authState.accessToken && activeTab === "members") {
                try {
                    setMembersLoading(true);
                    setMembersError(null);
                    const membersData = await getProjectMembers(projectId, authState.accessToken);

                    // Destructure the response into members and pending members array
                    const [members = [], pending = []] = membersData;

                    // Transform active members
                    const transformedMembers = members.map((member: any) => {
                        const userDetails = member.user || {};
                        return {
                            id: member.user_id,
                            name: userDetails.name || 'Unknown User',
                            role: member.role,
                            status: 'active',
                            email: userDetails.email,
                            joined_at: member.joined_at,
                        };
                    }).filter((member: ProjectMember) => member.id !== authState.user?.id);

                    const transformedPendingMembers = pending
                        .filter((member: ProjectMember) => member.id !== authState.user?.id)
                        .map((member: ProjectMember) => ({
                            id: member.id,
                            name: member?.name || member.email.split('@')[0],
                            role: member.role,
                            status: 'pending',
                            email: member?.email,
                            joined_at: member.joined_at
                        }));

                    const allMembers = [...transformedMembers, ...transformedPendingMembers];
                    setMembers(allMembers);
                } catch (err) {
                    setMembersError("Failed to load project members");
                    console.error(err);
                } finally {
                    setMembersLoading(false);
                }
            }
        };

        loadMembers();
    }, [projectId, authState.accessToken, activeTab, authState.user?.id]);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "completed":
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200">
                        <FaCheckCircle className="mr-1.5" />
                        Completed
                    </span>
                );
            case "in-progress":
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200">
                        <FaClock className="mr-1.5" />
                        In Progress
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                        <FaExclamationTriangle className="mr-1.5" />
                        Not Started
                    </span>
                );
        }
    };

    const refreshMembers = async () => {
        if (projectId && authState.accessToken) {
            try {
                setMembersLoading(true);
                setMembersError(null);
                const membersData = await getProjectMembers(projectId, authState.accessToken);
                const [registeredMembers = [], invitedMembers = []] = membersData;
                const transformedMembers = registeredMembers.map((member: any) => {
                    const userDetails = member.user || {};
                    return {
                        id: member.user_id,
                        name: userDetails.name || 'Unknown User',
                        role: member.role,
                        status: 'active',
                        email: userDetails.email,
                        joined_at: member.joined_at,
                    };
                }).filter((member: ProjectMember) => member.id !== authState.user?.id);

                const transformedPendingMembers = invitedMembers
                    .filter((member: ProjectMember) => member.id !== authState.user?.id)
                    .map((member: ProjectMember) => ({
                        id: member.id,
                        name: member?.name || member.email.split('@')[0],
                        role: member.role,
                        status: 'pending',
                        email: member?.email,
                        joined_at: member.joined_at
                    }));

                setMembers([...transformedMembers, ...transformedPendingMembers]);
            } catch (err) {
                setMembersError("Failed to load project members");
                console.error(err);
            } finally {
                setMembersLoading(false);
            }
        }
    };

    const handleRemoveMember = async (memberId: string) => {
        try {
            await deleteMemberFromProject(projectId!, memberId, authState.user.id, authState.accessToken!);
            setMembers(prevMembers => prevMembers.filter(member => member.id !== memberId));
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-300">Loading project...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center text-red-500 dark:text-red-400">
                    <p>{error}</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600 dark:text-gray-300">Project not found</p>
                    <button
                        onClick={() => navigate("/dashboard")}
                        className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                    >
                        Return to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
            {/* Project Header */}
            <div className="bg-white dark:bg-gray-800 shadow-sm transition-colors duration-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => navigate(-1)}
                                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-pointer"
                            >
                                <FaArrowLeft className="w-5 h-5" />
                            </button>
                            <div>
                                <div className="flex items-center space-x-3">
                                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                        {project.name}
                                    </h1>
                                    {getStatusBadge(project.status)}
                                </div>
                                <p className="mt-1 text-gray-600 dark:text-gray-300">
                                    {project.description}
                                </p>
                            </div>
                        </div>

                        <div className="flex space-x-3">
                            <button
                                onClick={() => setShowAddMember(true)}
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 cursor-pointer dark:hover:bg-indigo-800 text-white rounded-lg font-medium transition-colors duration-200 flex items-center"
                            >
                                <FaUserPlus className="mr-2" />
                                Add Member
                            </button>
                            <Link
                                to={`/projects/${projectId}/edit`}
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 cursor-pointer bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors duration-200 flex items-center"
                            >
                                <FaEdit className="mr-2" />
                                Edit
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Project Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Total Tasks */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md dark:shadow-gray-700/50 p-6 transition-colors duration-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Tasks</p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                                    {project.total_tasks || 0}
                                </p>
                            </div>
                            <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300">
                                <FaTasks className="text-2xl" />
                            </div>
                        </div>
                    </div>

                    {/* Completed Tasks */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md dark:shadow-gray-700/50 p-6 transition-colors duration-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Completed Tasks</p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                                    {project.completed_tasks || 0}
                                </p>
                            </div>
                            <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300">
                                <FaCheckCircle className="text-2xl" />
                            </div>
                        </div>
                    </div>

                    {/* Progress */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md dark:shadow-gray-700/50 p-6 transition-colors duration-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Progress</p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                                    {project.progress || 0}%
                                </p>
                            </div>
                            <div className="w-16">
                                <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-indigo-600 dark:bg-indigo-500"
                                        style={{ width: `${project.progress}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Members */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md dark:shadow-gray-700/50 p-6 transition-colors duration-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Team Members</p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                                    {members.length + 1 || 1}
                                </p>
                            </div>
                            <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300">
                                <FaUsers className="text-2xl" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
                    <nav className="-mb-px flex space-x-8">
                        <button
                            onClick={() => setActiveTab("tasks")}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm cursor-pointer ${activeTab === "tasks" ? "border-indigo-500 text-indigo-600 dark:text-indigo-400" : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500"}`}
                        >
                            Tasks
                        </button>
                        <button
                            onClick={() => setActiveTab("members")}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm cursor-pointer ${activeTab === "members" ? "border-indigo-500 text-indigo-600 dark:text-indigo-400" : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500"}`}
                        >
                            Members
                        </button>
                        <button
                            onClick={() => setActiveTab("discussions")}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm cursor-pointer ${activeTab === "discussions" ? "border-indigo-500 text-indigo-600 dark:text-indigo-400" : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500"}`}
                        >
                            Discussions
                        </button>
                        <button
                            onClick={() => setActiveTab("files")}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm cursor-pointer ${activeTab === "files" ? "border-indigo-500 text-indigo-600 dark:text-indigo-400" : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500"}`}
                        >
                            Files
                        </button>
                    </nav>
                </div>

                {/* Tab Content */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md dark:shadow-gray-700/50 overflow-hidden transition-colors duration-200">
                    {activeTab === "tasks" && <TasksTab project={project} />}
                    {activeTab === "members" && (
                        <MembersTab
                            project={project}
                            members={members}
                            membersLoading={membersLoading}
                            membersError={membersError}
                            authState={authState}
                            handleRemoveMember={handleRemoveMember}
                            setShowAddMember={setShowAddMember}
                        />
                    )}
                    {activeTab === "discussions" && <DiscussionsTab authState={authState} />}
                    {activeTab === "files" && <FilesTab />}
                </div>
            </main>

            {/* Add Member Modal */}
            {showAddMember && project && (
                <AddMemberDialog
                    project={project}
                    onClose={() => setShowAddMember(false)}
                    onInvite={async () => {
                        await refreshMembers();
                    }}
                />
            )}
        </div>
    );
};