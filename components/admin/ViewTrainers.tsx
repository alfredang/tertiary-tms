
import React, { useState, useMemo } from 'react';
import { useLms } from '../../hooks/useLms';
import { Card } from '../common/Card';
import { MOCK_TRAINERS } from '../../constants';
import { TrainerStatus } from '../../types';
import { Icon, IconName } from '../common/Icon';
import { Button } from '../common/Button';

const getStatusColor = (status: TrainerStatus) => {
    switch (status) {
        case TrainerStatus.Active:
            return 'bg-green-100 text-green-800';
        case TrainerStatus.Inactive:
            return 'bg-gray-100 text-gray-800';
        default:
            return 'bg-yellow-100 text-yellow-800';
    }
};

const ViewTrainers: React.FC = () => {
  const { courses } = useLms();
  const trainers = MOCK_TRAINERS;
  const ITEMS_PER_PAGE = 10;

  // Filter and pagination state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterName, setFilterName] = useState('');
  const [filterStatus, setFilterStatus] = useState<TrainerStatus | 'All'>('All');
  const [filterCourse, setFilterCourse] = useState<string>('All');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  
  const allCoursesForFilter = useMemo(() => {
    return Array.from(new Map(courses.map(c => [c.id, { id: c.id, title: c.title }])).values());
  }, [courses]);

  const filteredTrainers = useMemo(() => {
    return trainers.filter(trainer => {
        // General Search (name, email)
        const searchLower = searchQuery.toLowerCase();
        if (searchQuery && !(
            trainer.name.toLowerCase().includes(searchLower) ||
            trainer.email.toLowerCase().includes(searchLower)
        )) {
            return false;
        }

        // Advanced Filters
        if (filterName && !trainer.name.toLowerCase().includes(filterName.toLowerCase())) {
            return false;
        }

        if (filterStatus !== 'All' && trainer.status !== filterStatus) {
            return false;
        }

        if (filterCourse !== 'All') {
            const isAssociated = courses.some(course => 
                course.trainer === trainer.name && course.id === filterCourse
            );
            if (!isAssociated) {
                return false;
            }
        }

        return true;
    });
  }, [trainers, courses, searchQuery, filterName, filterStatus, filterCourse]);

  const paginatedTrainers = filteredTrainers.slice(currentPage * ITEMS_PER_PAGE, (currentPage + 1) * ITEMS_PER_PAGE);
  const totalPages = Math.ceil(filteredTrainers.length / ITEMS_PER_PAGE);

  const handleResetFilters = () => {
      setSearchQuery('');
      setFilterName('');
      setFilterStatus('All');
      setFilterCourse('All');
      setCurrentPage(0);
  };

  const inputClasses = "block w-full px-3 py-2 text-on-surface bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent";

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">View Trainers</h2>
      
      <Card className="p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
              <div className="lg:col-span-2">
                  <label htmlFor="general-search" className="block text-sm font-medium text-gray-700">General Search</label>
                  <div className="relative mt-1">
                       <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Icon name={IconName.Search} className="w-5 h-5 text-gray-400" />
                      </div>
                      <input type="text" id="general-search" placeholder="Search name, email..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className={`${inputClasses} pl-10`} />
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
              <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
                  <div><label className="block text-sm font-medium text-gray-700">Trainer Name</label><input type="text" value={filterName} onChange={e => setFilterName(e.target.value)} className={`${inputClasses} mt-1`} /></div>
                  <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as TrainerStatus | 'All')} className={`${inputClasses} mt-1`}>
                          <option value="All">All Statuses</option>
                          <option value={TrainerStatus.Active}>Active</option>
                          <option value={TrainerStatus.Inactive}>Inactive</option>
                      </select>
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-gray-700">Associated Course</label>
                      <select value={filterCourse} onChange={e => setFilterCourse(e.target.value)} className={`${inputClasses} mt-1`}>
                          <option value="All">All Courses</option>
                          {allCoursesForFilter.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                      </select>
                  </div>
              </div>
          )}
      </Card>

      <Card className="p-0 overflow-x-auto">
        {paginatedTrainers.length > 0 ? (
          <>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trainer Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trainer Type</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">LinkedIn Profile</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Associated Courses</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedTrainers.map((trainer) => {
                  const associatedCourses = courses.filter(course => course.trainer === trainer.name);
                  return (
                    <tr key={trainer.loginId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <img className="h-10 w-10 rounded-full object-cover" src={trainer.profilePictureUrl} alt={trainer.name} />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{trainer.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{trainer.email}</div>
                        <div className="text-sm text-gray-500">{trainer.tel}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{trainer.trainerType}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(trainer.status)}`}>
                          {trainer.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {trainer.linkedinUrl ? (
                          <a href={trainer.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1.5">
                            <Icon name={IconName.LinkedIn} className="w-4 h-4" />
                            View
                          </a>
                        ) : (
                          'N/A'
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {associatedCourses.length > 0 ? (
                          <ul className="list-disc list-inside space-y-1">
                            {associatedCourses.map(course => <li key={course.id}>{course.title}</li>)}
                          </ul>
                        ) : (
                          'None'
                        )}
                      </td>
                    </tr>
                  );
                })}
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
          <p className="text-subtle text-center py-12">No trainers found matching your criteria.</p>
        )}
      </Card>
    </div>
  );
};

export default ViewTrainers;
