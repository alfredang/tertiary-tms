
import React, { useMemo } from 'react';
import { useLms } from '../hooks/useLms';
import { Card } from './common/Card';
import { AgeGroup, Course, CourseSponsorship, Ethnicity, Gender, LearnerProgress, calculateAgeGroup } from '../types';

// Reusable Components
const StatCard: React.FC<{ title: string; value: string | number; subtext?: string }> = ({ title, value, subtext }) => (
    <Card className="p-6 text-center">
        <p className="text-4xl font-bold text-primary">{value}</p>
        <p className="font-semibold text-on-surface mt-1">{title}</p>
        {subtext && <p className="text-sm text-subtle">{subtext}</p>}
    </Card>
);

const ChartCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <Card className="p-6">
        <h3 className="text-xl font-bold mb-4">{title}</h3>
        <div>{children}</div>
    </Card>
);

const BarChart: React.FC<{ data: { label: string; value: number }[]; color: 'primary' | 'secondary' }> = ({ data, color }) => {
    const maxValue = Math.max(...data.map(d => d.value), 0);
    const colorClass = color === 'primary' ? 'bg-primary' : 'bg-secondary';
    
    return (
        <div className="space-y-3">
            {data.map(item => (
                <div key={item.label} className="flex items-center">
                    <div className="w-1/3 text-sm font-semibold text-subtle pr-2">{item.label}</div>
                    <div className="w-2/3 bg-gray-200 rounded-full h-6">
                        <div 
                            className={`${colorClass} h-6 rounded-full flex items-center justify-end px-2 text-white text-xs font-bold`}
                            style={{ width: `${(item.value / maxValue) * 100}%` }}
                        >
                            {item.value}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

// Main Dashboard Component
const TrainingProviderDashboard: React.FC = () => {
    const { courses } = useLms();

    const analyticsData = useMemo(() => {
        const allLearners = courses.flatMap(c => c.learners || []);
        const uniqueLearners = Array.from(new Map(allLearners.map(l => [l.email, l])).values());
        
        // --- KPI Calculations ---
        const totalLearners = uniqueLearners.length;
        // Mock grant/claim/forecast data as it's not in the data model
        const totalGrants = 125800;
        const totalClaims = 98250;

        // --- Chart Data Calculations ---

        // Enrollment by Month
        const enrollmentByMonth = courses.reduce((acc, course) => {
            const month = new Date(course.startDate).toLocaleString('default', { month: 'short', year: 'numeric' });
            acc[month] = (acc[month] || 0) + (course.learners?.length || 0);
            return acc;
        }, {} as Record<string, number>);
        const enrollmentByMonthData = Object.entries(enrollmentByMonth)
            .map(([label, value]) => ({ label, value }))
            .sort((a,b) => new Date(a.label).getTime() - new Date(b.label).getTime());

        // Course Ranking
        const courseRankingData = courses
            .map(course => ({ label: course.title, value: course.learners?.length || 0 }))
            .sort((a, b) => b.value - a.value);

        // Demographics
        const countBy = (key: keyof LearnerProgress) => uniqueLearners.reduce((acc, learner) => {
            const value = learner[key] as string;
            acc[value] = (acc[value] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const ageGroupCounts = uniqueLearners.reduce((acc, learner) => {
            const group = calculateAgeGroup(learner.dob);
            acc[group] = (acc[group] || 0) + 1;
            return acc;
        }, {} as Record<AgeGroup, number>);

        const ageProfileData = Object.entries(ageGroupCounts)
            .map(([label, value]) => ({ label, value }))
            .sort((a, b) => {
                const order = Object.values(AgeGroup);
                return order.indexOf(a.label as AgeGroup) - order.indexOf(b.label as AgeGroup);
            });
            
        const genderBreakdownData = Object.entries(countBy('gender')).map(([label, value]) => ({ label, value }));
        const sponsorshipBreakdownData = Object.entries(countBy('courseSponsorship')).map(([label, value]) => ({ label, value }));
        const ethnicityBreakdownData = Object.entries(countBy('ethnicity')).map(([label, value]) => ({ label, value }));

        return {
            totalLearners,
            totalGrants,
            totalClaims,
            enrollmentByMonthData,
            courseRankingData,
            ageProfileData,
            genderBreakdownData,
            sponsorshipBreakdownData,
            ethnicityBreakdownData,
        };
    }, [courses]);

    return (
        <div>
            <h2 className="text-3xl font-bold mb-6">AI Analytics Dashboard</h2>
            
            {/* KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <StatCard title="Total Learners Enrolled" value={analyticsData.totalLearners} />
                <StatCard title="Total Grants Applied" value={`$${analyticsData.totalGrants.toLocaleString()}`} />
                <StatCard title="Total Claims Received" value={`$${analyticsData.totalClaims.toLocaleString()}`} />
                <StatCard title="Enrollment Forecast" value="~25" subtext="Next 3 Months" />
                <StatCard title="Grant Forecast" value="~$45k" subtext="Next 3 Months" />
                <StatCard title="Claim Forecast" value="~$32k" subtext="Next 3 Months" />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartCard title="Total Learners Enrolled by Month">
                    <BarChart data={analyticsData.enrollmentByMonthData} color="primary" />
                </ChartCard>
                <ChartCard title="Course Ranking by Enrolment">
                    <BarChart data={analyticsData.courseRankingData} color="secondary" />
                </ChartCard>
                <ChartCard title="Learner Age Profile">
                     <BarChart data={analyticsData.ageProfileData} color="primary" />
                </ChartCard>
                <ChartCard title="Learner Gender Breakdown">
                     <BarChart data={analyticsData.genderBreakdownData} color="secondary" />
                </ChartCard>
                 <ChartCard title="Learner Sponsorship Type">
                     <BarChart data={analyticsData.sponsorshipBreakdownData} color="primary" />
                </ChartCard>
                 <ChartCard title="Learner Ethnicity">
                     <BarChart data={analyticsData.ethnicityBreakdownData} color="secondary" />
                </ChartCard>
            </div>
        </div>
    );
};

export default TrainingProviderDashboard;
