import { Link } from "react-router-dom";
import { useState } from "react";
import { FaUser, FaEnvelope, FaPlus } from "react-icons/fa";
import { DarkModeToggle } from "../utils/DarkModeToggle";

export const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="bg-white dark:bg-gray-900 shadow-md sticky top-0 z-50 transition-all duration-300">
            <div className="mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo/Brand */}
                    <div className="flex-shrink-0 flex items-center">
                        <Link
                            to="/"
                            className="flex items-center text-gray-900 dark:text-white text-2xl font-bold hover:scale-105 transform transition-transform transition-colors"
                        >
                            <span className="text-indigo-600 dark:text-indigo-400 rounded-lg flex items-center justify-center">
                                <svg
                                    className="w-7 h-7"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <polygon
                                        points="5 3, 19 3, 12 21"
                                        className="text-indigo-600 dark:text-indigo-400"
                                    ></polygon>
                                </svg>
                            </span>
                            <span className="ml-2 hidden sm:inline uppercase tracking-wide">Novo</span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-4">
                        <Link
                            to="/projects"
                            className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-indigo-500 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
                        >
                            <FaPlus className="text-indigo-600 dark:text-indigo-200 hover:text-white dark:hover:text-indigo-100" />
                            New Project
                        </Link>
                        <Link
                            to="/profile"
                            className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-indigo-500 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
                        >
                            <FaUser className="text-indigo-600 dark:text-indigo-200 hover:text-white dark:hover:text-indigo-100" />
                            Profile
                        </Link>
                        <Link
                            to="/contact"
                            className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-indigo-500 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
                        >
                            <FaEnvelope className="text-indigo-600 dark:text-indigo-200 hover:text-white dark:hover:text-indigo-100" />
                            Contact
                        </Link>

                        {/* Dark Mode Toggle Button */}
                        <DarkModeToggle />

                        <Link
                            to="/register"
                            className="ml-2 bg-indigo-600 text-white dark:bg-indigo-900 dark:text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 dark:hover:bg-indigo-800 transition-colors shadow hover:shadow-md flex items-center gap-1"
                        >
                            Get Started
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center">
                        {/* Dark Mode Toggle in Mobile */}
                        <DarkModeToggle />

                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-900 dark:text-white hover:text-indigo-200 hover:bg-indigo-600 focus:outline-none transition-colors"
                        >
                            <span className="sr-only">Open menu</span>
                            {isOpen ? (
                                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            ) : (
                                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation Menu */}
            <div className={`md:hidden ${isOpen ? 'block' : 'hidden'}`}>
                <div className="pt-2 pb-3 space-y-1 px-2 bg-indigo-700 dark:bg-[#1E1B47] shadow-lg">
                    <Link
                        to="/projects"
                        className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-gray-100 dark:hover:bg-indigo-500 transition-colors flex items-center gap-3"
                        onClick={() => setIsOpen(false)}
                    >
                        <FaPlus />
                        New Project
                    </Link>
                    <Link
                        to="/profile"
                        className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-gray-100 dark:hover:bg-indigo-500 transition-colors flex items-center gap-3"
                        onClick={() => setIsOpen(false)}
                    >
                        <FaUser />
                        Profile
                    </Link>
                    <Link
                        to="/contact"
                        className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-gray-100 dark:hover:bg-indigo-500 transition-colors flex items-center gap-3"
                        onClick={() => setIsOpen(false)}
                    >
                        <FaEnvelope />
                        Contact
                    </Link>
                    <Link
                        to="/register"
                        className="block px-3 py-2 rounded-md text-base font-medium bg-white text-indigo-700 dark:bg-indigo-900 dark:text-white hover:bg-gray-100 dark:hover:bg-indigo-700 transition-colors mt-2 text-center flex items-center justify-center gap-2"
                        onClick={() => setIsOpen(false)}
                    >
                        Get Started
                    </Link>
                </div>
            </div>
        </nav>
    );
};
