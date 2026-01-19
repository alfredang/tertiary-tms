

import React from 'react';
import { Card } from './common/Card';
import { Course } from '../types';
import { Icon, IconName } from './common/Icon';

interface CourseCatalogCardProps {
  course: Course;
}

const FundingTag: React.FC<{ eligible: boolean; label: string }> = ({ eligible, label }) => {
    if (!eligible) return null;
    return (
        <span className="flex items-center text-xs font-medium bg-green-100 text-green-800 px-2.5 py-1 rounded-full">
            <Icon name={IconName.CheckCircle} className="w-3 h-3 mr-1.5" />
            {label}
        </span>
    );
};

const CourseCatalogCard: React.FC<CourseCatalogCardProps> = ({ course }) => {
    const totalPrice = course.courseFee * (1 + course.taxPercent / 100);
    
    return (
        <Card className="flex flex-col h-full">
            <img src={course.imageUrl || `https://picsum.photos/seed/${course.id}/400/200`} alt={course.title} className="w-full h-40 object-cover" />
            <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-xl font-bold mb-2">{course.title}</h3>
                <p className="text-subtle mb-4 flex-grow text-sm">{course.learningOutcomes}</p>
                
                <div className="border-t pt-4 mt-auto">
                    <div className="flex justify-between items-center mb-3">
                        <div className="flex items-baseline">
                            <span className="text-2xl font-bold text-primary">${course.courseFee.toFixed(2)}</span>
                            <span className="text-sm text-subtle ml-1">+ tax</span>
                        </div>
                        <div className="text-right">
                             <p className="font-semibold text-on-surface">${totalPrice.toFixed(2)}</p>
                             <p className="text-xs text-subtle">Total Price</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <FundingTag eligible={course.isWsqFunded} label="WSQ Funded" />
                        <FundingTag eligible={course.isSkillsFutureEligible} label="SkillsFuture" />
                        <FundingTag eligible={course.isPseaEligible} label="PSEA" />
                        <FundingTag eligible={course.isMcesEligible} label="MCES" />
                        <FundingTag eligible={course.isIbfFunded} label="IBF Funded" />
                        <FundingTag eligible={course.isUtapEligible} label="UTAP Eligible" />
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default CourseCatalogCard;