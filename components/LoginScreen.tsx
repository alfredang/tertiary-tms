

import React, { useState } from 'react';
import { useLms } from '../hooks/useLms';
import { Button } from './common/Button';
import { Card } from './common/Card';
import { UserRole } from '../types';
import HelpAndSupportView from './HelpAndSupportView';
import { Icon, IconName } from './common/Icon';

const LoginScreen: React.FC = () => {
  const { login, trainingProviderProfile } = useLms();
  const { securitySettings } = trainingProviderProfile;
  
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('learner@example.com'); // Pre-fill for convenience
  const [password, setPassword] = useState('password123'); // Pre-fill for convenience
  const [otp, setOtp] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.Learner);
  const [error, setError] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [currentView, setCurrentView] = useState<'login' | 'help'>('login');

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple email validation
    if (!email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    setError(null);
    // In a real app, this would be an API call
    console.log(`Sending OTP to ${email} for role ${selectedRole}`);
    alert(`An OTP has been sent to your email.`);
    // The default OTP will be used for verification if enabled
    setStep('otp');
  };

  const handlePasswordLogin = (e: React.FormEvent) => {
      e.preventDefault();
      // Simple validation
      if (!email.includes('@') || password.length < 6) {
          setError('Please enter a valid email and password.');
          return;
      }
      setError(null);
      // In a real app, this would be an API call to verify the password.
      // For this mock, we accept any password.
      console.log(`Logging in ${email} with password for role ${selectedRole}`);
      login(selectedRole);
  };
  
  const handleResendOtp = () => {
      setIsResending(true);
      alert(`A new OTP has been sent to your email.`);
      // The default OTP will be used for verification if enabled
      setTimeout(() => setIsResending(false), 5000); // Simulate cooldown
  }

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();

    // Use default OTP if enabled, otherwise use the test OTP
    const correctOtp = securitySettings.enableDefaultOtp 
        ? securitySettings.defaultOtp 
        : '123456';

    if (otp === correctOtp) {
      setError(null);
      login(selectedRole);
    } else {
      setError('Invalid OTP. Please try again.');
    }
  };

  const inputClasses = "block w-full px-4 py-3 text-on-surface bg-surface border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent";

  if (currentView === 'help') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background p-4">
          <div className="w-full max-w-5xl">
              <Button variant="ghost" onClick={() => setCurrentView('login')} className="mb-4">
                  <Icon name={IconName.Back} className="w-5 h-5 mr-2" />
                  Back to Login
              </Button>
              <HelpAndSupportView />
          </div>
      </div>
    );
  }

  const renderEmailStep = () => (
    <form onSubmit={handleSendOtp} className="space-y-6">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClasses}
        />
      </div>
      <div>
        <label htmlFor="role-select" className="block text-sm font-medium text-gray-700 mb-1">
          Log in as
        </label>
        <select
          id="role-select"
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value as UserRole)}
          className={inputClasses}
        >
          <option value={UserRole.Learner}>Learner</option>
          <option value={UserRole.Trainer}>Trainer</option>
          <option value={UserRole.Developer}>Developer</option>
          <option value={UserRole.Admin}>Admin</option>
          <option value={UserRole.TrainingProvider}>Training Provider</option>
        </select>
      </div>
      {error && <p className="text-red-500 text-sm text-center">{error}</p>}
      <div>
        <Button type="submit" className="w-full !py-3" size="lg">
          Send OTP
        </Button>
      </div>
    </form>
  );

  const renderOtpStep = () => (
    <div>
        <div className="text-center mb-6">
            <p className="font-semibold">Verify your identity</p>
            <p className="text-sm text-subtle mt-1">
                An OTP has been sent to <span className="font-bold text-on-surface">{email}</span>.
            </p>
        </div>
        <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
                <label htmlFor="otp" className="sr-only">Enter OTP</label>
                <input
                    id="otp"
                    name="otp"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                    maxLength={6}
                    className={`${inputClasses} text-center text-2xl tracking-[0.5em] font-mono`}
                    placeholder="______"
                />
            </div>
             {error && <p className="text-red-500 text-sm text-center">{error}</p>}
             <Button type="submit" className="w-full !py-3" size="lg">
                Verify & Log In
            </Button>
        </form>
        <div className="mt-4 text-center text-sm">
            <button onClick={() => { setStep('email'); setError(null); setOtp(''); }} className="font-medium text-primary hover:text-primary-hover">
                Change Email
            </button>
            <span className="mx-2 text-subtle">|</span>
            <button onClick={handleResendOtp} disabled={isResending} className="font-medium text-primary hover:text-primary-hover disabled:text-subtle disabled:cursor-not-allowed">
                {isResending ? 'Resending...' : 'Resend OTP'}
            </button>
        </div>
    </div>
  );
  
  const renderPasswordStep = () => (
    <form onSubmit={handlePasswordLogin} className="space-y-6">
      <div>
        <label htmlFor="email-pw" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input id="email-pw" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputClasses} />
      </div>
      <div>
        <label htmlFor="password-login" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
        <input id="password-login" name="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className={inputClasses}/>
      </div>
      <div>
        <label htmlFor="role-select-pw" className="block text-sm font-medium text-gray-700 mb-1">Log in as</label>
        <select id="role-select-pw" value={selectedRole} onChange={(e) => setSelectedRole(e.target.value as UserRole)} className={inputClasses}>
            <option value={UserRole.Learner}>Learner</option>
            <option value={UserRole.Trainer}>Trainer</option>
            <option value={UserRole.Developer}>Developer</option>
            <option value={UserRole.Admin}>Admin</option>
            <option value={UserRole.TrainingProvider}>Training Provider</option>
        </select>
      </div>
      {error && <p className="text-red-500 text-sm text-center">{error}</p>}
      <div>
          <Button type="submit" className="w-full !py-3" size="lg">Sign In</Button>
      </div>
    </form>
  );

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#1a3a69]">
      <div className="w-full max-w-md px-4">
        <Card className="!p-8 sm:!p-10 !shadow-2xl">
          <div className="flex flex-col items-center text-center mb-8">
            <img src={trainingProviderProfile.companyLogoUrl} alt="Company Logo" className="w-20 h-20 rounded-md mb-4" />
            <h1 className="text-2xl font-bold text-on-surface">
              {trainingProviderProfile.companyName}
            </h1>
            <p className="text-subtle mt-2">LMS cum TMS for WSQ Courses</p>
          </div>
          {securitySettings.enableOtpLogin ? (
              step === 'email' ? renderEmailStep() : renderOtpStep()
          ) : (
              renderPasswordStep()
          )}
          <div className="mt-8 text-center text-xs text-subtle">
            <div className="flex justify-center space-x-4">
              <a href="#" onClick={(e) => { e.preventDefault(); setCurrentView('help'); }} className="hover:underline">Help</a>
              <a href="#privacy" className="hover:underline">Privacy Policy</a>
              <a href="#acceptable-use" className="hover:underline">Acceptable Use Policy</a>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default LoginScreen;