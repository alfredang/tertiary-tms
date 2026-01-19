import React, { useState, useMemo } from 'react';
import { useLms } from '../hooks/useLms';
import { Card } from './common/Card';
import { Button } from './common/Button';
import { Course, AdminPage } from '../types';
// FIX: Import Icon and IconName to be used in the component.
import { Icon, IconName } from './common/Icon';
import ClassDetailView from './admin/ClassDetailView';

const StatCard: React.FC<{ title: string; value: string | number }> = ({ title, value }) => (
    <Card className="p-6 text-center">
        <p className="text-4xl font-bold text-primary">{value}</p>
        <p className="text-subtle mt-1">{title}</p>
    </Card>
);

const getStatusColor = (status: string) => {
    switch (status) {
        case 'Paid':
        case 'Claimed':
        case 'Approved':
        case 'C':
        case 'Competent':
        case 'Pass':
        case 'Success':
        case 'Successful':
        case 'Full Payment':
        case 'Confirmed':
            return 'bg-green-100 text-green-800';
        case 'Processing':
        case 'Reschedule':
             return 'bg-blue-100 text-blue-800';
        case 'Pending':
        case 'In Progress':
            return 'bg-yellow-100 text-yellow-800';
        case 'Overdue':
        case 'Rejected':
        case 'Unpaid':
        case 'NYC':
        case 'Not Yet Competent':
        case 'Fail':
        case 'Failed':
        case 'Cancelled':
            return 'bg-red-100 text-red-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

const AdminView: React.FC = () => {
    const { courses, adminPage, setAdminPage, setEditingCourse, deleteCourse } = useLms();
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const ITEMS_PER_PAGE = 20;

    // Filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCourseTitle, setFilterCourseTitle] = useState('');
    const [filterCourseCode, setFilterCourseCode] = useState('');
    const [filterCourseRunId, setFilterCourseRunId] = useState('');
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');
    const [filterTrainer, setFilterTrainer] = useState('');
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    
    const allTrainers = useMemo(() => Array.from(new Set(courses.map(c => c.trainer))), [courses]);

    const { 
        filteredUpcomingClasses, 
        totalLearners, 
        totalTrainers, 
        nextWeekCount, 
        nextMonthCount,
        ongoingClassesCount,
        completedClassesCount,
    } = useMemo(() => {
        const now = new Date();
        now.setHours(0, 0, 0, 0); // Set to start of day

        const upcoming = courses
            .filter(c => new Date(c.endDate) >= now)
            .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
        
        const filtered = upcoming.filter(course => {
            const searchLower = searchQuery.toLowerCase();
            const matchesGeneralSearch = searchQuery === '' ||
                course.title.toLowerCase().includes(searchLower) ||
                course.courseCode.toLowerCase().includes(searchLower) ||
                course.courseRunId.toLowerCase().includes(searchLower);

            const matchesTitle = filterCourseTitle === '' || course.title.toLowerCase().includes(filterCourseTitle.toLowerCase());
            const matchesCode = filterCourseCode === '' || course.courseCode.toLowerCase().includes(filterCourseCode.toLowerCase());
            const matchesRunId = filterCourseRunId === '' || course.courseRunId.toLowerCase().includes(filterCourseRunId.toLowerCase());
            const matchesTrainer = filterTrainer === '' || course.trainer === filterTrainer;
            
            const matchesStartDate = filterStartDate === '' || new Date(course.startDate) >= new Date(filterStartDate);
            const matchesEndDate = filterEndDate === '' || new Date(course.endDate) <= new Date(filterEndDate);

            return matchesGeneralSearch && matchesTitle && matchesCode && matchesRunId && matchesTrainer && matchesStartDate && matchesEndDate;
        });
        
        const inDays = (days: number) => {
            const futureDate = new Date();
            futureDate.setDate(now.getDate() + days);
            return courses.filter(c => {
                const startDate = new Date(c.startDate);
                return startDate >= now && startDate <= futureDate;
            }).length;
        };

        const uniqueLearners = new Set<string>();
        courses.forEach(c => {
            c.learners?.forEach(l => uniqueLearners.add(l.name));
        });

        const ongoing = courses.filter(c => {
            const startDate = new Date(c.startDate);
            const endDate = new Date(c.endDate);
            return startDate <= now && endDate >= now;
        }).length;

        const completed = courses.filter(c => new Date(c.endDate) < now).length;

        return {
            filteredUpcomingClasses: filtered,
            totalLearners: uniqueLearners.size,
            totalTrainers: new Set(courses.map(c => c.trainer)).size,
            nextWeekCount: inDays(7),
            nextMonthCount: inDays(30),
            ongoingClassesCount: ongoing,
            completedClassesCount: completed,
        };
    }, [courses, searchQuery, filterCourseTitle, filterCourseCode, filterCourseRunId, filterStartDate, filterEndDate, filterTrainer]);
    
    const paginatedClasses = filteredUpcomingClasses.slice(currentPage * ITEMS_PER_PAGE, (currentPage + 1) * ITEMS_PER_PAGE);
    const totalPages = Math.ceil(filteredUpcomingClasses.length / ITEMS_PER_PAGE);
    
    const handleDelete = (courseId: string, courseTitle: string) => {
        if (window.confirm(`Are you sure you want to delete the class "${courseTitle}"? This action cannot be undone.`)) {
            deleteCourse(courseId).catch(err => {
                console.error("Failed to delete course:", err);
                alert("An error occurred while deleting the course. Please try again.");
            });
        }
    };

    const handleEditClass = (courseToEdit: Course) => {
        setEditingCourse(courseToEdit);
        setAdminPage(AdminPage.EditClass);
    };
    
    const handleResetFilters = () => {
        setSearchQuery('');
        setFilterCourseTitle('');
        setFilterCourseCode('');
        setFilterCourseRunId('');
        setFilterStartDate('');
        setFilterEndDate('');
        setFilterTrainer('');
    };


    if (selectedCourse) {
        return <ClassDetailView course={selectedCourse} onBack={() => setSelectedCourse(null)} />;
    }

    const pageTitle = adminPage === AdminPage.UpcomingClasses ? 'Upcoming Classes' : 'Admin Dashboard';
    const inputClasses = "block w-full px-3 py-2 text-on-surface bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent";

    return (
        <div>
            <h2 className="text-3xl font-bold mb-6">{pageTitle}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <StatCard title="Total Learners" value={totalLearners} />
                <StatCard title="Total Trainers" value={totalTrainers} />
                <StatCard title="Ongoing Classes" value={ongoingClassesCount} />
                <StatCard title="Classes (Next 7 Days)" value={nextWeekCount} />
                <StatCard title="Classes (Next 30 Days)" value={nextMonthCount} />
                <StatCard title="Completed Classes" value={completedClassesCount} />
            </div>

            <h3 className="text-2xl font-bold mb-4">Upcoming Classes</h3>
            
            <Card className="p-6 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                    <div className="lg:col-span-2">
                        <label htmlFor="general-search" className="block text-sm font-medium text-gray-700">General Search</label>
                        <div className="relative mt-1">
                             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Icon name={IconName.Search} className="w-5 h-5 text-gray-400" />
                            </div>
                            <input type="text" id="general-search" placeholder="Search title, code, run ID..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className={`${inputClasses} pl-10`} />
                        </div>
                    </div>
                    <div className="lg:col-span-2 flex justify-end gap-2">
                         <Button variant="ghost" onClick={handleResetFilters}>Reset Filters</Button>
                        <Button variant="secondary" onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}>
                            {showAdvancedFilters ? 'Hide' : 'Show'} Advanced Filters
                        </Button>
                    </div>
                </div>
                
                {showAdvancedFilters && (
                    <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                        <div><label className="block text-sm font-medium text-gray-700">Course Title</label><input type="text" value={filterCourseTitle} onChange={e => setFilterCourseTitle(e.target.value)} className={`${inputClasses} mt-1`} /></div>
                        <div><label className="block text-sm font-medium text-gray-700">Course Code</label><input type="text" value={filterCourseCode} onChange={e => setFilterCourseCode(e.target.value)} className={`${inputClasses} mt-1`} /></div>
                        <div><label className="block text-sm font-medium text-gray-700">Course Run ID</label><input type="text" value={filterCourseRunId} onChange={e => setFilterCourseRunId(e.target.value)} className={`${inputClasses} mt-1`} /></div>
                        <div><label className="block text-sm font-medium text-gray-700">Trainer</label><select value={filterTrainer} onChange={e => setFilterTrainer(e.target.value)} className={`${inputClasses} mt-1`}><option value="">All Trainers</option>{allTrainers.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                        <div><label className="block text-sm font-medium text-gray-700">Start Date (From)</label><input type="date" value={filterStartDate} onChange={e => setFilterStartDate(e.target.value)} className={`${inputClasses} mt-1`} /></div>
                        <div><label className="block text-sm font-medium text-gray-700">End Date (Until)</label><input type="date" value={filterEndDate} onChange={e => setFilterEndDate(e.target.value)} className={`${inputClasses} mt-1`} /></div>
                    </div>
                )}
            </Card>

            <Card className="p-0 overflow-x-auto">
                 <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course Run ID</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course Title</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">TGS Ref</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class Status</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DA ID</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trainer</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"># of Trainee</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {paginatedClasses.map(course => (
                            <tr key={course.id} className="hover:bg-gray-50">
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{course.courseRunId}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{course.title}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{course.courseCode}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(course.classStatus)}`}>
                                        {course.classStatus}
                                    </span>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{course.daId || 'N/A'}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(course.startDate).toLocaleDateString()}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(course.endDate).toLocaleDateString()}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{course.trainer}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{course.learners?.length || 0}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex items-center space-x-2">
                                        <Button size="sm" variant="ghost" onClick={() => setSelectedCourse(course)}>Details</Button>
                                        <Button size="sm" variant="ghost" onClick={() => handleEditClass(course)} className="!text-blue-600 hover:!bg-blue-50">
                                            <Icon name={IconName.Edit} className="w-4 h-4 mr-1"/>
                                            Edit
                                        </Button>
                                        <Button size="sm" variant="ghost" onClick={() => handleDelete(course.id, course.title)} className="!text-red-600 hover:!bg-red-50">
                                            <Icon name={IconName.Delete} className="w-4 h-4 mr-1"/>
                                            Delete
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {totalPages > 1 && (
                    <div className="p-4 flex justify-between items-center border-t">
                        <Button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 0}>
                            Previous
                        </Button>
                        <span className="text-sm text-subtle">
                            Page {currentPage + 1} of {totalPages}
                        </span>
                        <Button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage >= totalPages - 1}>
                            Next
                        </Button>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default AdminView;