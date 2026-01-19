
import React, { useState, useMemo } from 'react';
import { useLms } from '../hooks/useLms';
import { Card } from './common/Card';
import { Button } from './common/Button';
import { Icon, IconName } from './common/Icon';
import { CourseType, UserRole, ModeOfLearning } from '../types';
import EnrolledCourseListItem from './EnrolledCourseListItem';

const getTypeColor = (courseType: CourseType) => {
    switch(courseType) {
        case CourseType.WSQ: return 'bg-blue-100 text-blue-800';
        case CourseType.IBF: return 'bg-purple-100 text-purple-800';
        default: return 'bg-gray-100 text-gray-800';
    }
}

const DetailRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div className="flex justify-between items-start gap-2">
        <p className="font-semibold text-gray-600 flex-shrink-0">{label}:</p>
        <div className="text-right text-gray-800">{value}</div>
    </div>
);

const ManagementCourseList: React.FC = () => {
    const { courses, setSelectedCourse, setEditingCourse, role } = useLms();
    
    // Trainers only see courses they are assigned to. Admins and Developers see all.
    const relevantCourses = role === UserRole.Trainer
        ? courses.filter(c => c.trainer === 'John Smith') // In a real app, this would be the logged-in user's name
        : courses;
        
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCourseType, setFilterCourseType] = useState<CourseType | 'All'>('All');
    const [filterMode, setFilterMode] = useState<ModeOfLearning | 'All'>('All');
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [viewMode, setViewMode] = useState<'block' | 'table'>('block');
    
    const filteredCourses = useMemo(() => {
        return relevantCourses.filter(course => {
            const searchLower = searchQuery.toLowerCase();
            const matchesSearch = searchQuery === '' ||
                course.title.toLowerCase().includes(searchLower) ||
                course.courseCode.toLowerCase().includes(searchLower) ||
                course.tscTitle.toLowerCase().includes(searchLower) ||
                course.tscCode.toLowerCase().includes(searchLower);

            const matchesType = filterCourseType === 'All' || course.courseType === filterCourseType;
            const matchesMode = filterMode === 'All' || course.modeOfLearning.includes(filterMode);

            return matchesSearch && matchesType && matchesMode;
        });
    }, [relevantCourses, searchQuery, filterCourseType, filterMode]);
    
    const handleResetFilters = () => {
        setSearchQuery('');
        setFilterCourseType('All');
        setFilterMode('All');
    };
    
    const inputClasses = "block w-full px-3 py-2 text-on-surface bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent";

    const CourseBlockView = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map(course => {
                const totalHours = course.trainingHours + course.assessmentHours;
                return (
                  <Card key={course.id} className="flex flex-col">
                    <img src={course.imageUrl || `https://picsum.photos/seed/${course.id}/400/200`} alt={course.title} className="w-full h-40 object-cover" />
                    <div className="p-6 flex flex-col flex-grow">
                      <h3 className="text-xl font-bold mb-4">{course.title}</h3>
                      
                      <div className="text-xs space-y-2 mb-4 flex-grow">
                          <DetailRow label="TGS Ref" value={course.courseCode} />
                          <DetailRow label="TSC Title" value={course.tscTitle} />
                          <DetailRow label="TSC Code" value={course.tscCode} />
                          <DetailRow label="Course Type" value={
                              <span className={`font-semibold px-2 py-0.5 rounded-full ${getTypeColor(course.courseType)}`}>
                                  {course.courseType}
                              </span>
                          } />
                          <DetailRow label="Mode of Training" value={course.modeOfLearning.join(', ')} />
                          <DetailRow label="Course Duration" value={
                              <div className="flex flex-col items-end">
                                  <span>{totalHours} Hours Total</span>
                                  <span className="text-gray-400 font-normal">
                                      ({course.trainingHours}T + {course.assessmentHours}A)
                                  </span>
                              </div>
                          } />
                      </div>
                      
                      <div className="flex justify-between items-center mt-auto pt-4 border-t">
                        <Button onClick={() => setSelectedCourse(course)}>
                          {role === UserRole.Trainer ? 'View Roster' : 'View Course'}
                        </Button>
                        {(role === UserRole.Developer || role === UserRole.Admin) && (
                            <button onClick={() => setEditingCourse(course)} className="flex items-center text-subtle font-semibold hover:text-primary transition-colors">
                                <Icon name={IconName.Edit} className="w-4 h-4 mr-1"/>
                                <span>Edit</span>
                            </button>
                        )}
                      </div>
                    </div>
                  </Card>
                );
            })}
        </div>
    );
    
    const CourseTableView = () => (
        <Card className="p-0 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {filteredCourses.map(course => {
                        const totalHours = course.trainingHours + course.assessmentHours;
                        return (
                            <tr key={course.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10">
                                            <img className="h-10 w-10 rounded-md object-cover" src={course.imageUrl || `https://picsum.photos/seed/${course.id}/100/100`} alt={course.title} />
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">{course.title}</div>
                                            <div className="text-sm text-gray-500">{course.courseCode}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <span className={`font-semibold px-2 py-0.5 rounded-full text-xs ${getTypeColor(course.courseType)}`}>{course.courseType}</span>
                                    <div className="mt-1">{course.modeOfLearning.join(', ')}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <div>{totalHours} Hours Total</div>
                                    <div className="text-xs">({course.trainingHours}T + {course.assessmentHours}A)</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${course.status === 'Published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                        {course.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex items-center space-x-2">
                                        <Button size="sm" onClick={() => setSelectedCourse(course)}>
                                            {role === UserRole.Trainer ? 'View Roster' : 'View Course'}
                                        </Button>
                                        {(role === UserRole.Developer || role === UserRole.Admin) && (
                                            <Button size="sm" variant="ghost" onClick={() => setEditingCourse(course)} className="!text-blue-600 hover:!bg-blue-50">
                                                <Icon name={IconName.Edit} className="w-4 h-4 mr-1"/>
                                                Edit
                                            </Button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </Card>
    );

    return (
        <div>
            <Card className="p-6 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div className="md:col-span-2">
                        <label htmlFor="general-search-courses" className="block text-sm font-medium text-gray-700">General Search</label>
                        <div className="relative mt-1">
                             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Icon name={IconName.Search} className="w-5 h-5 text-gray-400" />
                            </div>
                            <input 
                                type="text" 
                                id="general-search-courses" 
                                placeholder="Search title, code, TSC..." 
                                value={searchQuery} 
                                onChange={e => setSearchQuery(e.target.value)} 
                                className={`${inputClasses} pl-10`} 
                            />
                        </div>
                    </div>
                    <div className="md:col-span-2 flex justify-end items-center gap-4">
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-gray-700 hidden sm:block">View:</label>
                            <div className="flex items-center rounded-md bg-gray-100 p-0.5 border">
                                <button
                                    onClick={() => setViewMode('block')}
                                    className={`p-1.5 rounded-md transition-colors ${viewMode === 'block' ? 'bg-white shadow text-primary' : 'text-gray-500 hover:text-gray-800'}`}
                                    aria-label="Block view"
                                    aria-pressed={viewMode === 'block'}
                                >
                                    <Icon name={IconName.Dashboard} className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => setViewMode('table')}
                                    className={`p-1.5 rounded-md transition-colors ${viewMode === 'table' ? 'bg-white shadow text-primary' : 'text-gray-500 hover:text-gray-800'}`}
                                    aria-label="Table view"
                                    aria-pressed={viewMode === 'table'}
                                >
                                    <Icon name={IconName.Menu} className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        <Button variant="ghost" onClick={handleResetFilters}>Reset</Button>
                        <Button variant="secondary" onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}>
                            {showAdvancedFilters ? 'Hide' : 'Show'} Filters
                        </Button>
                    </div>
                </div>
                
                {showAdvancedFilters && (
                    <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Course Type</label>
                            <select value={filterCourseType} onChange={e => setFilterCourseType(e.target.value as CourseType | 'All')} className={`${inputClasses} mt-1`}>
                                <option value="All">All Types</option>
                                {Object.values(CourseType).map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Mode of Training</label>
                            <select value={filterMode} onChange={e => setFilterMode(e.target.value as ModeOfLearning | 'All')} className={`${inputClasses} mt-1`}>
                                <option value="All">All Modes</option>
                                {Object.values(ModeOfLearning).map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                        </div>
                    </div>
                )}
            </Card>

            <div>
                {filteredCourses.length > 0 ? (
                    viewMode === 'block' ? <CourseBlockView /> : <CourseTableView />
                ) : (
                    <Card className="p-12 text-center text-subtle">
                        No courses found matching your criteria.
                    </Card>
                )}
            </div>
        </div>
    )
}

const TrendingCoursesCard: React.FC = () => {
    const { courses, setSelectedCourse } = useLms();
    const trending = courses.filter(c => c.enrollmentStatus === 'not-enrolled').slice(0, 4);

    return (
        <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">Trending Courses</h3>
            <ul className="space-y-2">
                {trending.map(course => (
                    <li key={course.id}>
                        <a 
                            href="#" 
                            onClick={(e) => { e.preventDefault(); setSelectedCourse(course); }}
                            className="flex justify-between items-center p-2 rounded-md hover:bg-gray-100 group"
                        >
                            <span className="font-semibold text-on-surface group-hover:text-primary">{course.title}</span>
                            <svg className="w-5 h-5 text-subtle group-hover:text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                        </a>
                    </li>
                ))}
            </ul>
        </Card>
    );
};


const LearnerCourseList: React.FC = () => {
    const { courses } = useLms();
    const enrolledCourses = courses.filter(c => c.enrollmentStatus === 'enrolled');

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-3xl font-bold">Courses</h2>
                    <p className="text-subtle mt-1">Continue your learning now</p>
                </div>
                <div className="flex items-center space-x-2">
                    <div className="relative">
                        <Icon name={IconName.Search} className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="w-full pl-10 pr-4 py-2 text-on-surface bg-surface border border-gray-300 rounded-md placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                    </div>
                    <Button variant="ghost" className="!border !border-gray-300">
                        <Icon name={IconName.Filter} className="w-5 h-5" />
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                    {enrolledCourses.map(course => (
                        <EnrolledCourseListItem key={course.id} course={course} />
                    ))}
                </div>
                <div className="lg:col-span-1">
                    <TrendingCoursesCard />
                </div>
            </div>
        </div>
    );
}


const CourseList: React.FC = () => {
  const { role } = useLms();

  if (role === UserRole.Learner) {
    return <LearnerCourseList />;
  }
  
  // Trainer, Developer, and Admin view
  const title = role === UserRole.Trainer ? "My Assigned Classes" : "Course Management";
  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">{title}</h2>
      <ManagementCourseList />
    </div>
  );
};

export default CourseList;
