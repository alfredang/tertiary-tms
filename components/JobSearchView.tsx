
import React, { useState, useEffect, useMemo } from 'react';
import { Card } from './common/Card';
import { Icon, IconName } from './common/Icon';
import { Button } from './common/Button';
import { apiGetJobPostings } from '../services/apiService';
import { JobPosting } from '../types';
import { SKILLS_FUTURE_INDUSTRIES } from '../constants';
import Spinner from './common/Spinner';

const SALARY_RANGES = [
    { label: 'Any', min: 0, max: Infinity },
    { label: '< $5,000', min: 0, max: 4999 },
    { label: '$5,000 - $7,000', min: 5000, max: 7000 },
    { label: '$7,001 - $9,000', min: 7001, max: 9000 },
    { label: '> $9,000', min: 9001, max: Infinity },
];

const JobCard: React.FC<{ job: JobPosting }> = ({ job }) => (
    <Card className="p-6 flex flex-col">
        <div className="flex justify-between items-start">
            <div>
                <h3 className="text-xl font-bold text-on-surface">{job.title}</h3>
                <p className="font-semibold text-primary">{job.company}</p>
            </div>
            <a href={job.url} target="_blank" rel="noopener noreferrer" className="text-xs font-bold bg-gray-200 text-gray-800 px-3 py-1.5 rounded-full hover:bg-gray-300">
                Apply
            </a>
        </div>
        <div className="flex items-center gap-4 text-sm text-subtle my-3">
            <span>{job.location}</span>
            <span>&bull;</span>
            <span>${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()}</span>
        </div>
        <p className="text-sm text-on-surface flex-grow mb-4">{job.description}</p>
        <div className="border-t pt-3">
             <span className="text-xs font-semibold bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {job.area}
            </span>
        </div>
    </Card>
);

const JobSearchView: React.FC = () => {
    const [jobs, setJobs] = useState<JobPosting[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedArea, setSelectedArea] = useState('All');
    const [selectedSalary, setSelectedSalary] = useState(SALARY_RANGES[0].label);

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const fetchedJobs = await apiGetJobPostings();
                setJobs(fetchedJobs);
            } catch (error) {
                console.error("Failed to fetch job postings:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchJobs();
    }, []);

    const filteredJobs = useMemo(() => {
        const salaryRange = SALARY_RANGES.find(r => r.label === selectedSalary);
        if (!salaryRange) return [];

        return jobs.filter(job => {
            const matchesQuery = job.title.toLowerCase().includes(searchQuery.toLowerCase()) || job.company.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesArea = selectedArea === 'All' || job.area === selectedArea;
            const matchesSalary = job.salaryMax >= salaryRange.min && job.salaryMin <= salaryRange.max;
            
            return matchesQuery && matchesArea && matchesSalary;
        });
    }, [jobs, searchQuery, selectedArea, selectedSalary]);

    return (
        <div>
            <h2 className="text-3xl font-bold mb-6">Job Search</h2>

            <Card className="p-6 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Search Bar */}
                    <div className="md:col-span-3">
                        <label htmlFor="job-search" className="block text-sm font-medium text-gray-700 mb-1">
                            Search for jobs
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Icon name={IconName.Search} className="w-5 h-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                id="job-search"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Job title or company"
                                className="w-full pl-10 pr-4 py-2 text-on-surface bg-surface border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                    </div>

                    {/* Area Filter */}
                    <div>
                         <label htmlFor="area-filter" className="block text-sm font-medium text-gray-700 mb-1">
                            Area
                        </label>
                        <select
                            id="area-filter"
                            value={selectedArea}
                            onChange={e => setSelectedArea(e.target.value)}
                            className="w-full px-4 py-2 text-on-surface bg-surface border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value="All">All Areas</option>
                            {SKILLS_FUTURE_INDUSTRIES.map(area => (
                                <option key={area} value={area}>{area}</option>
                            ))}
                        </select>
                    </div>

                    {/* Salary Filter */}
                    <div>
                         <label className="block text-sm font-medium text-gray-700 mb-1">
                            Salary Range
                        </label>
                        <select
                            id="salary-filter"
                            value={selectedSalary}
                            onChange={e => setSelectedSalary(e.target.value)}
                            className="w-full px-4 py-2 text-on-surface bg-surface border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            {SALARY_RANGES.map(range => (
                                <option key={range.label} value={range.label}>{range.label}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </Card>

            {isLoading ? (
                <div className="flex justify-center py-10">
                    <Spinner size="lg" text="Searching for jobs..." />
                </div>
            ) : (
                <div className="space-y-6">
                    <p className="text-subtle">{filteredJobs.length} job posting{filteredJobs.length !== 1 && 's'} found.</p>
                    {filteredJobs.length > 0 ? (
                        filteredJobs.map(job => (
                            <JobCard key={job.id} job={job} />
                        ))
                    ) : (
                        <Card className="p-12 text-center text-subtle">
                            No job postings found matching your criteria.
                        </Card>
                    )}
                </div>
            )}
        </div>
    );
};

export default JobSearchView;
