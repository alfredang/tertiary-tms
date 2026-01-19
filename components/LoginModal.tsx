
import React, { useState } from 'react';
import { useLms } from '../hooks/useLms';
import { UserRole } from '../types';
import { Card } from './common/Card';
import { Button } from './common/Button';
import { Icon, IconName } from './common/Icon';

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
    const { login, setRole } = useLms();
    const [activeTab, setActiveTab] = useState<UserRole>(UserRole.Learner);

    if (!isOpen) return null;

    const handleFormLogin = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setRole(activeTab);
        login(activeTab);
    };
    
    const handleSsoLogin = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setRole(UserRole.Learner); // Default SSO to Learner
        login(UserRole.Learner);
    };

    const TabButton = ({ role, label }: { role: UserRole; label: string }) => (
        <button
            onClick={() => setActiveTab(role)}
            className={`w-full py-3 text-lg font-semibold transition-colors duration-200 focus:outline-none ${
                activeTab === role
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-subtle hover:text-on-surface'
            }`}
        >
            {label}
        </button>
    );

    const SsoButton = ({ provider, icon }: { provider: string; icon: IconName }) => (
        <Button
            variant="ghost"
            className="w-full !justify-start !text-on-surface !font-semibold border border-gray-300 hover:!bg-gray-50"
            leftIcon={<Icon name={icon} className="w-5 h-5" />}
            onClick={handleSsoLogin}
        >
            Continue with {provider}
        </Button>
    );
    
    const inputClasses = "block w-full px-3 py-2 text-on-surface bg-surface border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent";

    return (
        <div 
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div onClick={e => e.stopPropagation()}>
                <Card className="p-8 w-full max-w-md relative">
                    <button onClick={onClose} className="absolute top-4 right-4 text-subtle hover:text-on-surface">
                        <Icon name={IconName.Close} className="w-6 h-6" />
                    </button>

                    <h2 className="text-2xl font-bold text-center mb-6">Access Your Dashboard</h2>
                    <div className="flex border-b mb-6">
                        <TabButton role={UserRole.Learner} label="Learner" />
                        <TabButton role={UserRole.Trainer} label="Trainer" />
                        <TabButton role={UserRole.Developer} label="Developer" />
                        <TabButton role={UserRole.Admin} label="Admin" />
                    </div>

                    <form className="space-y-6">
                        <div>
                            <label htmlFor="email-modal" className="block text-sm font-medium text-gray-700">Email Address</label>
                            <input id="email-modal" name="email" type="email" required placeholder="you@example.com" className={`mt-1 ${inputClasses}`}/>
                        </div>
                        <div>
                            <label htmlFor="password-modal" className="block text-sm font-medium text-gray-700">Password</label>
                            <input id="password-modal" name="password" type="password" required placeholder="••••••••" className={`mt-1 ${inputClasses}`}/>
                        </div>
                        <Button type="submit" className="w-full" onClick={handleFormLogin}>Sign In as {activeTab}</Button>
                    </form>
                    
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center" aria-hidden="true"><div className="w-full border-t border-gray-300" /></div>
                        <div className="relative flex justify-center text-sm"><span className="px-2 bg-surface text-subtle">Or continue with</span></div>
                    </div>

                    <div className="space-y-3">
                        <SsoButton provider="Google" icon={IconName.Google} />
                        <SsoButton provider="Meta" icon={IconName.Meta} />
                        <SsoButton provider="LinkedIn" icon={IconName.LinkedIn} />
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default LoginModal;