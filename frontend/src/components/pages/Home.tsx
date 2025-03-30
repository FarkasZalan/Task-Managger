import { Link } from "react-router-dom";
import { TypeAnimation } from 'react-type-animation';
import { FaTasks, FaProjectDiagram, FaRegLightbulb, FaUserPlus } from "react-icons/fa";
import { useState } from "react";

export const Home = () => {
    const [currentWord, setCurrentWord] = useState('');
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-900">
            {/* Hero Section */}
            <section className="relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
                    <div className="relative z-10 text-center">
                        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                            <span className="block mb-2">Manage Your Work with <span className="text-indigo-600">Novo</span></span>
                            <span className={currentWord === 'Collaborate.' ? 'text-indigo-600' : ''}>
                                <TypeAnimation
                                    sequence={[
                                        () => setCurrentWord('Organize.'),
                                        'Organize',
                                        4000,
                                        () => setCurrentWord('Collaborate.'),
                                        'Collaborate',
                                        4000,
                                        () => setCurrentWord('Achieve.'),
                                        'Achieve',
                                        4000
                                    ]}
                                    wrapper="span"
                                    speed={30}
                                    repeat={Infinity}
                                    style={{
                                        display: 'inline-block',
                                        opacity: 1,
                                        transition: 'opacity 0.5s ease-in-out'
                                    }}
                                />
                            </span>
                        </h1>
                        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-200 max-w-3xl mx-auto mb-10">
                            Novo helps teams manage projects, track tasks, and resolve issues - all in one beautiful workspace.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <Link
                                to="/register"
                                className="px-8 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                            >
                                <FaUserPlus className="text-lg" />
                                Get Started For Free
                            </Link>
                            <Link
                                to="/login"
                                className="px-8 py-3 border border-gray-300 dark:border-gray-600 bg-transparent text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shadow hover:shadow-md"
                            >
                                Sign In
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16 bg-white dark:bg-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-200 mb-4">Powerful Features</h2>
                        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                            Everything you need to manage your projects effectively
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-gray-50 dark:bg-gray-700 p-8 rounded-xl hover:shadow-lg transition-shadow">
                            <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-500 rounded-lg flex items-center justify-center mb-6">
                                <FaProjectDiagram className="text-indigo-600 dark:text-white text-2xl" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-200 mb-3">Project Management</h3>
                            <p className="text-gray-600 dark:text-gray-300">
                                Organize your work into projects with customizable workflows and team collaboration.
                            </p>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-700 p-8 rounded-xl hover:shadow-lg transition-shadow">
                            <div className="w-14 h-14 bg-blue-100 dark:bg-blue-600 rounded-lg flex items-center justify-center mb-6">
                                <FaTasks className="text-blue-600 dark:text-white text-2xl" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-200 mb-3">Task Tracking</h3>
                            <p className="text-gray-600 dark:text-gray-300">
                                Create, assign, and track tasks with deadlines, priorities, and progress indicators.
                            </p>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-700 p-8 rounded-xl hover:shadow-lg transition-shadow">
                            <div className="w-14 h-14 bg-purple-100 dark:bg-purple-600 rounded-lg flex items-center justify-center mb-6">
                                <FaRegLightbulb className="text-purple-600 dark:text-white text-2xl" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-200 mb-3">Issue Resolution</h3>
                            <p className="text-gray-600 dark:text-gray-300">
                                Identify, categorize, and resolve issues efficiently with your team.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 bg-indigo-600 text-white dark:bg-indigo-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold mb-6 dark:text-indigo-200">Ready to boost your productivity?</h2>
                    <p className="text-lg text-indigo-100 dark:text-indigo-200 max-w-2xl mx-auto mb-8 dark:text-indigo-300">
                        Join thousands of teams who are already managing their work more effectively with Novo.
                    </p>
                    <Link
                        to="/register"
                        className="dark:bg-indigo-600 dark:hover:bg-indigo-700 dark:text-white inline-block px-8 py-3 bg-white text-indigo-600 font-medium rounded-lg hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl"
                    >
                        Get Started for Free
                    </Link>
                </div>
            </section>
        </div>
    );
};
