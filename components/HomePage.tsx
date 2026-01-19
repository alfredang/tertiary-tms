
import React, { useState, useEffect } from 'react';
import { useLms } from '../hooks/useLms';
import { Course } from '../types';
import { Button } from './common/Button';
import { Icon, IconName } from './common/Icon';
import { apiGetCourses } from '../services/apiService';
import CourseCatalogCard from './CourseCatalogCard';
import Spinner from './common/Spinner';
import HomePageChatbot from './HomePageChatbot';
import LoginModal from './LoginModal';
import HomePageHeader from './HomePageHeader';

const HomePage: React.FC = () => {
    const { isLoginModalOpen, setLoginModalOpen } = useLms();
    const [courses, setCourses] = useState<Course[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const fetchedCourses = await apiGetCourses();
                setCourses(fetchedCourses.filter(c => c.status === 'Published'));
            } catch (error) {
                console.error("Failed to fetch courses for catalog:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCourses();
    }, []);

    const scrollToCourses = () => {
        document.getElementById('course-catalog')?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="bg-white min-h-screen font-sans text-gray-800">
            <HomePageHeader onLoginClick={() => setLoginModalOpen(true)} />

            <main className="container mx-auto px-6 lg:px-8">
                {/* Hero Section */}
                <section className="py-20 lg:py-32 grid lg:grid-cols-2 gap-16 items-center">
                    {/* Left Content */}
                    <div className="text-center lg:text-left">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-on-surface">
                            Learn In-Demand Skills for <span className="relative inline-block">Tomorrow's Jobs
                            <span className="absolute bottom-0 left-0 w-full h-2 bg-yellow-300 transform -skew-x-12 -translate-y-1 z-[-1]"></span>
                            </span>
                        </h1>
                        <p className="mt-6 text-lg text-subtle max-w-xl mx-auto lg:mx-0">
                            Experience learning that delivers results. We're disrupting the way you learn <strong>new-age technologies</strong> and we'll help you get <strong>job-ready, fast.</strong>
                        </p>
                        <Button size="lg" className="mt-8 !bg-red-600 hover:!bg-red-700 !px-10 !py-4" onClick={scrollToCourses}>
                            Explore All Courses
                        </Button>
                        <div className="mt-12">
                            <p className="font-semibold text-subtle mb-4">Trusted by 4,500+ companies across the globe</p>
                            <div className="flex flex-wrap justify-center lg:justify-start items-center gap-x-8 gap-y-4 text-gray-400">
                                <Icon name={IconName.Infosys} className="h-8 w-auto" />
                                <Icon name={IconName.HP} className="h-6 w-auto" />
                                <Icon name={IconName.TigerAnalytics} className="h-8 w-auto" />
                                <Icon name={IconName.Terrapay} className="h-7 w-auto" />
                            </div>
                        </div>
                        <div className="mt-8 flex items-center justify-center lg:justify-start gap-4">
                             <div className="flex -space-x-2">
                                <img className="inline-block h-10 w-10 rounded-full ring-2 ring-white" src="https://i.pravatar.cc/150?img=1" alt="user"/>
                                <img className="inline-block h-10 w-10 rounded-full ring-2 ring-white" src="https://i.pravatar.cc/150?img=2" alt="user"/>
                                <img className="inline-block h-10 w-10 rounded-full ring-2 ring-white" src="https://i.pravatar.cc/150?img=3" alt="user"/>
                             </div>
                             <div>
                                <p className="font-semibold">Rated by Trainees</p>
                                <div className="flex items-center gap-1">
                                    <Icon name={IconName.Star} className="w-5 h-5 text-yellow-400" />
                                    <span className="font-bold">4.8/5</span>
                                    <span className="text-subtle text-sm">12,500+ Reviews</span>
                                </div>
                             </div>
                        </div>
                    </div>

                    {/* Right Visuals */}
                    <div className="hidden lg:block relative h-[500px]">
                        {/* Person 1 */}
                        <div className="absolute top-0 right-20">
                            <div className="relative w-48 h-48">
                                <div className="absolute inset-0 bg-green-200 rounded-full"></div>
                                <img src="https://i.pravatar.cc/300?img=31" alt="SDE" className="absolute bottom-0 left-1/2 -translate-x-1/2 w-44 h-auto rounded-full"/>
                            </div>
                            <div className="absolute bottom-0 -right-20 bg-white shadow-lg rounded-xl p-3 flex items-center gap-3 w-64">
                                <p className="font-bold">150% Salary Hike <Icon name={IconName.ArrowUpRight} className="inline w-4 h-4 text-red-500"/></p>
                                <p className="text-sm text-subtle">SDE II @ Microsoft</p>
                            </div>
                        </div>
                        {/* Person 2 */}
                        <div className="absolute top-1/2 left-0 -translate-y-1/2">
                             <div className="relative w-40 h-40">
                                <div className="absolute inset-0 bg-yellow-200 rounded-full"></div>
                                <img src="https://i.pravatar.cc/300?img=11" alt="Project Manager" className="absolute bottom-0 left-1/2 -translate-x-1/2 w-36 h-auto rounded-full"/>
                            </div>
                            <div className="absolute bottom-0 -left-16 bg-white shadow-lg rounded-xl p-3 w-60 text-center">
                                <p className="font-bold">Business Analyst</p>
                                <p className="text-sm text-subtle">To Project Manager</p>
                            </div>
                        </div>
                         {/* Person 3 */}
                        <div className="absolute bottom-0 left-1/4">
                             <div className="relative w-52 h-52">
                                <div className="absolute inset-0 bg-teal-200 rounded-full"></div>
                                <img src="https://i.pravatar.cc/300?img=14" alt="Data Engineer" className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-auto rounded-full"/>
                            </div>
                            <div className="absolute bottom-0 right-0 bg-white shadow-lg rounded-xl p-3 w-64 text-center">
                                <p className="font-bold">Data Analyst <Icon name={IconName.ArrowUpRight} className="inline w-4 h-4"/></p>
                                <p className="text-sm text-subtle">To Data Engineer</p>
                            </div>
                        </div>
                        {/* Person 4 */}
                        <div className="absolute bottom-10 right-0">
                             <div className="relative w-44 h-44">
                                <div className="absolute inset-0 bg-yellow-300 rounded-full"></div>
                                <img src="https://i.pravatar.cc/300?img=4" alt="Cloud Architect" className="absolute bottom-0 left-1/2 -translate-x-1/2 w-40 h-auto rounded-full"/>
                            </div>
                        </div>

                         {/* Floating Icons */}
                        <div className="absolute top-10 left-20 bg-white shadow-lg p-3 rounded-full"><Icon name={IconName.React} className="w-8 h-8"/></div>
                        <div className="absolute bottom-5 right-20 bg-white shadow-lg p-3 rounded-full"><Icon name={IconName.Python} className="w-8 h-8"/></div>

                    </div>
                </section>

                {/* Course Catalog Section */}
                <section id="course-catalog" className="py-20">
                    <h2 className="text-3xl font-bold text-center mb-12">Explore Our Courses</h2>
                    {isLoading ? (
                        <div className="flex justify-center py-10">
                            <Spinner size="lg" text="Loading courses..." />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {courses.map(course => (
                                <CourseCatalogCard key={course.id} course={course} />
                            ))}
                        </div>
                    )}
                </section>
            </main>

            <LoginModal isOpen={isLoginModalOpen} onClose={() => setLoginModalOpen(false)} />
            <HomePageChatbot courses={courses} />
        </div>
    );
};

export default HomePage;