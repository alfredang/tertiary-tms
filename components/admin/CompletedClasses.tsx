
import React, { useMemo, useState } from 'react';
import { useLms } from '../../hooks/useLms';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Icon, IconName } from '../common/Icon';
import { Course } from '../../types';
import ClassDetailView from './ClassDetailView';

// Reusable StatCard component, similar to the one in AdminView
const StatCard: React.FC<{ title: string; value: string | number }> = ({ title, value }) => (
    <Card className="p-6 text-center">
        <p className="text-4xl font-bold text-primary">{value}</p>
        <p className="text-subtle mt-1">{title}</p>
    </Card>
);


const CompletedClasses: React.FC = () => {
  const { courses } = useLms();
  const [currentPage, setCurrentPage] = useState(0);
  const ITEMS_PER_PAGE = 20;
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

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

  const { filteredCompletedClasses, totalGraduatedLearners, involvedTrainers } = useMemo(() => {
      const now = new Date();
      now.setHours(0, 0, 0, 0); // Start of today

      const completed = courses
          .filter(c => new Date(c.endDate) < now);
          
      const filtered = completed.filter(course => {
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
      
      const learners = filtered.reduce((sum, course) => sum + (course.learners?.length || 0), 0);
      const trainers = new Set(filtered.map(c => c.trainer)).size;
      
      return {
          filteredCompletedClasses: filtered.sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime()),
          totalGraduatedLearners: learners,
          involvedTrainers: trainers,
      };
  }, [courses, searchQuery, filterCourseTitle, filterCourseCode, filterCourseRunId, filterStartDate, filterEndDate, filterTrainer]);

  const paginatedClasses = filteredCompletedClasses.slice(currentPage * ITEMS_PER_PAGE, (currentPage + 1) * ITEMS_PER_PAGE);
  const totalPages = Math.ceil(filteredCompletedClasses.length / ITEMS_PER_PAGE);
  
  const handleResetFilters = () => {
    setSearchQuery('');
    setFilterCourseTitle('');
    setFilterCourseCode('');
    setFilterCourseRunId('');
    setFilterStartDate('');
    setFilterEndDate('');
    setFilterTrainer('');
    setCurrentPage(0);
  };

  const inputClasses = "block w-full px-3 py-2 text-on-surface bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent";

  if (selectedCourse) {
      return <ClassDetailView course={selectedCourse} onBack={() => setSelectedCourse(null)} />;
  }

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Completed Classes</h2>
      
      {/* KPIs for Completed Classes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatCard title="Completed Classes Found" value={filteredCompletedClasses.length} />
          <StatCard title="Total Graduated Learners" value={totalGraduatedLearners} />
          <StatCard title="Involved Trainers" value={involvedTrainers} />
      </div>

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
        {paginatedClasses.length > 0 ? (
          <>
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course Title</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">TGS Ref</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course Run ID</th>
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
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{course.title}</td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{course.courseCode}</td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{course.courseRunId}</td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(course.startDate).toLocaleDateString()}</td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(course.endDate).toLocaleDateString()}</td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{course.trainer}</td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{course.learners?.length || 0}</td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                                <Button size="sm" variant="ghost" onClick={() => setSelectedCourse(course)}>
                                    View Details
                                </Button>
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
          </>
        ) : (
          <p className="text-subtle text-center py-12">No completed classes found.</p>
        )}
      </Card>
    </div>
  );
};

export default CompletedClasses;
