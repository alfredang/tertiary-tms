import React from 'react';
import { Icon, IconName } from './common/Icon';

const DomainItem: React.FC<{ icon: IconName; label: string; active?: boolean }> = ({ icon, label, active }) => (
    <a href="#" className={`flex items-center gap-3 p-3 rounded-md text-sm font-semibold transition-colors ${active ? 'bg-gray-100 text-primary' : 'hover:bg-gray-100'}`}>
        <Icon name={icon} className="w-5 h-5" />
        <span>{label}</span>
        {active && <span className="ml-auto">&gt;</span>}
    </a>
);

const CourseLink: React.FC<{ icon: IconName; title: string; subtitle: string; tag?: string; tagColor?: string }> = ({ icon, title, subtitle, tag, tagColor }) => (
    <a href="#" className="flex items-center gap-4 p-2 rounded-md hover:bg-gray-50">
        <Icon name={icon} className="w-8 h-8 flex-shrink-0" />
        <div>
            <p className="font-semibold text-sm">{title}</p>
            <p className="text-xs text-subtle flex items-center gap-2">
                {subtitle}
                {tag && <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${tagColor}`}>{tag}</span>}
            </p>
        </div>
    </a>
);

const ResourceLink: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <a href="#" className="flex items-center justify-between text-sm font-semibold text-on-surface hover:text-primary py-1.5">
        <span>{children}</span>
        <Icon name={IconName.ArrowUpRight} className="w-4 h-4" />
    </a>
);


const MegaMenu: React.FC = () => {
    return (
        <div 
            className="absolute top-full left-0 mt-2 w-[1000px] bg-white rounded-lg shadow-2xl z-50 p-6 grid grid-cols-12 gap-6 animate-fade-in-down"
            style={{ animationDuration: '300ms' }}
        >
            {/* Column 1: Domains */}
            <div className="col-span-3 border-r pr-5">
                <h3 className="font-bold mb-3 px-3">Domains</h3>
                <div className="space-y-1">
                    <DomainItem icon={IconName.Agile} label="Agile Management" active />
                    <DomainItem icon={IconName.ProjectManagement} label="Project Management" />
                    <DomainItem icon={IconName.CloudComputing} label="Cloud Computing" />
                    <DomainItem icon={IconName.ITService} label="IT Service Management" />
                    <DomainItem icon={IconName.DataScience} label="Data Science" />
                    <DomainItem icon={IconName.DevOps} label="DevOps" />
                    <DomainItem icon={IconName.CyberSecurity} label="Cyber Security" />
                    <a href="#" className="flex items-center gap-2 text-sm font-semibold text-primary p-3">
                        Browse All Domains <Icon name={IconName.ArrowUpRight} className="w-4 h-4" />
                    </a>
                </div>
            </div>

            {/* Column 2: Courses */}
            <div className="col-span-6">
                <h2 className="text-lg font-bold">Agile Management</h2>
                <p className="text-sm text-subtle mb-4">Master Agile methodologies for efficient and timely project delivery.</p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                    <div>
                        <h4 className="font-bold text-sm mb-2">Certifications</h4>
                        <div className="space-y-1">
                            <CourseLink icon={IconName.CSM} title="Certified ScrumMaster (CSM)" subtitle="Scrum Alliance • 16 Hours" tag="Best Seller" tagColor="bg-red-100 text-red-700" />
                            <CourseLink icon={IconName.CSPO} title="Certified Scrum Product Owner (CSPO)" subtitle="Scrum Alliance • 16 Hours" tag="Best Seller" tagColor="bg-red-100 text-red-700" />
                            <CourseLink icon={IconName.SAFe} title="Leading SAFe 6.0 Certification" subtitle="Scaled Agile • 16 Hours" tag="Trending" tagColor="bg-purple-100 text-purple-700" />
                        </div>
                    </div>
                    <div>
                        <h4 className="font-bold text-sm mb-2">Masters</h4>
                        <CourseLink icon={IconName.Agile} title="Agile Management Master's Program" subtitle="32 Hours" tag="Trending" tagColor="bg-purple-100 text-purple-700" />
                        <CourseLink icon={IconName.Agile} title="Agile Excellence Master's Program" subtitle="32 Hours" />
                        
                        <h4 className="font-bold text-sm mb-2 mt-4">Roles</h4>
                        <ResourceLink>Scrum Master</ResourceLink>
                        <ResourceLink>Product Owner</ResourceLink>
                    </div>
                </div>
            </div>

            {/* Column 3: Bodies & Resources */}
            <div className="col-span-3 bg-gray-50 p-4 rounded-lg">
                <h4 className="font-bold text-sm mb-3">Accreditation Bodies</h4>
                <div className="space-y-2 mb-6">
                    <a href="#" className="flex items-center gap-2 text-sm hover:text-primary"><Icon name={IconName.ScrumAlliance} className="w-5 h-5"/> Scrum Alliance</a>
                    <a href="#" className="flex items-center gap-2 text-sm hover:text-primary"><Icon name={IconName.ScaledAgile} className="w-5 h-5"/> Scaled Agile, Inc.</a>
                    <a href="#" className="flex items-center gap-2 text-sm hover:text-primary"><Icon name={IconName.ScrumOrg} className="w-5 h-5"/> Scrum.org</a>
                    <a href="#" className="flex items-center gap-2 text-sm hover:text-primary"><Icon name={IconName.PMI} className="w-5 h-5"/> PMI</a>
                </div>
                
                <h4 className="font-bold text-sm mb-2">Top Resources</h4>
                <div className="space-y-1">
                    <ResourceLink>Scrum Tutorial</ResourceLink>
                    <ResourceLink>CSM VS CSPO</ResourceLink>
                    <ResourceLink>Scrum Practice Test</ResourceLink>
                </div>
            </div>
            <style>{`
                @keyframes fade-in-down {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-down {
                    animation: fade-in-down 0.2s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default MegaMenu;