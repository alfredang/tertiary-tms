import React, { useState } from 'react';
import { Icon, IconName } from './common/Icon';
import { Button } from './common/Button';
import MegaMenu from './MegaMenu';
import { MOCK_TRAINING_PROVIDER_PROFILE } from '../constants';

interface HomePageHeaderProps {
    onLoginClick: () => void;
}

const NavLink: React.FC<{ children: React.ReactNode, hasDropdown?: boolean }> = ({ children, hasDropdown }) => (
    <a href="#" className="flex items-center gap-1 text-on-surface font-semibold hover:text-primary transition-colors">
        {children}
        {hasDropdown && <Icon name={IconName.ChevronDown} className="w-4 h-4" />}
    </a>
);

const HomePageHeader: React.FC<HomePageHeaderProps> = ({ onLoginClick }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <header className="bg-white/80 backdrop-blur-lg sticky top-0 z-40 border-b border-gray-200">
            <div className="container mx-auto px-6 lg:px-8 py-4 flex items-center justify-between">
                {/* Left Side */}
                <div className="flex items-center gap-8">
                     <div className="flex items-center space-x-2">
                        <img src={MOCK_TRAINING_PROVIDER_PROFILE.companyLogoUrl} alt="Company Logo" className="w-8 h-8 rounded-md" />
                        <span className="text-2xl font-bold text-on-surface">Tertiary</span>
                    </div>
                    <div 
                        className="relative hidden lg:inline-flex"
                        onMouseEnter={() => setIsMenuOpen(true)}
                        onMouseLeave={() => setIsMenuOpen(false)}
                    >
                        <Button variant="ghost" className="!font-semibold !text-on-surface border border-gray-300">
                            <Icon name={IconName.Courses} className="w-5 h-5 mr-2" />
                            All Courses
                            <Icon name={IconName.ChevronDown} className="w-4 h-4 ml-1" />
                        </Button>
                        {isMenuOpen && <MegaMenu />}
                    </div>
                </div>
                
                {/* Center Search */}
                <div className="hidden lg:block w-full max-w-md">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Icon name={IconName.Search} className="w-5 h-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="What do you want to learn today?"
                            className="w-full pl-10 pr-4 py-2 text-on-surface bg-surface border border-gray-300 rounded-full placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Right Side */}
                <div className="flex items-center gap-6">
                    <div className="hidden lg:flex items-center gap-6">
                        <NavLink hasDropdown>Gen AI Courses</NavLink>
                        <NavLink hasDropdown>Enterprise</NavLink>
                        <NavLink hasDropdown>Resources</NavLink>
                        <NavLink>Help</NavLink>
                    </div>
                    <button onClick={onLoginClick} className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors">
                        <Icon name={IconName.User} className="w-6 h-6 text-gray-600" />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default HomePageHeader;