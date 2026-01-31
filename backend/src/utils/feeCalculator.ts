import { FeeCalculationResult } from '../types/index';

interface LearnerInfo {
  dob?: Date | null;
  nationality?: string | null;
  employmentStatus?: string | null;
}

interface CourseInfo {
  courseFee: number;
  taxPercent: number;
  isWsqFunded: boolean;
  isSkillsFutureEligible: boolean;
  isPseaEligible: boolean;
  isMcesEligible: boolean;
  isIbfFunded: boolean;
  isUtapEligible: boolean;
}

interface FundingInputs {
  discount?: number;
  skillsFutureCredit?: number;
  pseaClaim?: number;
  utapClaim?: number;
  ibfClaim?: number;
}

// Singapore GST rate
const GST_RATE = 0.09;

// SSG funding rates
const SSG_STANDARD_RATE = 0.50; // 50% for regular
const SSG_ENHANCED_RATE = 0.70; // 70% for MCES (age 40+) or SME

// Check if learner qualifies for MCES (Mid-Career Enhanced Subsidy)
function isMcesEligible(learner: LearnerInfo): boolean {
  if (!learner.dob || !learner.nationality) return false;

  // Must be Singapore Citizen
  if (learner.nationality.toLowerCase() !== 'singaporean' &&
      learner.nationality.toLowerCase() !== 'singapore citizen') {
    return false;
  }

  // Must be 40 years or older
  const today = new Date();
  const age = today.getFullYear() - learner.dob.getFullYear();
  const monthDiff = today.getMonth() - learner.dob.getMonth();
  const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < learner.dob.getDate())
    ? age - 1
    : age;

  return actualAge >= 40;
}

// Check if learner is eligible for enhanced funding (MCES or employed by SME)
function isEnhancedFundingEligible(
  learner: LearnerInfo,
  isSmeEmployer: boolean = false
): boolean {
  return isMcesEligible(learner) || isSmeEmployer;
}

export function calculateFees(
  course: CourseInfo,
  learner: LearnerInfo,
  fundingInputs: FundingInputs = {},
  isSmeEmployer: boolean = false
): FeeCalculationResult {
  const grossCourseFee = Number(course.courseFee);
  const discount = fundingInputs.discount || 0;
  const subtotalBeforeGst = grossCourseFee - discount;

  // Calculate GST (on the net fee after discount)
  const gstRate = Number(course.taxPercent) / 100 || GST_RATE;
  const gstAmount = subtotalBeforeGst * gstRate;
  const totalWithGst = subtotalBeforeGst + gstAmount;

  // Initialize funding breakdown
  const fundingBreakdown = {
    grantAmount: 0,
    skillsFutureCredit: 0,
    pseaClaim: 0,
    mcesClaim: 0,
    utapClaim: 0,
    ibfClaim: 0,
  };

  // Calculate SSG Grant amount (if WSQ funded)
  if (course.isWsqFunded) {
    const fundingRate = isEnhancedFundingEligible(learner, isSmeEmployer)
      ? SSG_ENHANCED_RATE
      : SSG_STANDARD_RATE;

    // Grant is calculated on course fee before GST
    fundingBreakdown.grantAmount = subtotalBeforeGst * fundingRate;

    // If MCES eligible, additional subsidy may apply
    if (course.isMcesEligible && isMcesEligible(learner)) {
      // MCES provides additional 20% on top of standard 50% (total 70%)
      // Already handled by enhanced rate above
      fundingBreakdown.mcesClaim = 0; // Included in grantAmount
    }
  }

  // SkillsFuture Credit (if eligible)
  if (course.isSkillsFutureEligible && fundingInputs.skillsFutureCredit) {
    // SF Credit can be used for course fee and GST
    const maxSfUsable = totalWithGst - fundingBreakdown.grantAmount;
    fundingBreakdown.skillsFutureCredit = Math.min(
      fundingInputs.skillsFutureCredit,
      maxSfUsable
    );
  }

  // PSEA (Post-Secondary Education Account) - for students
  if (course.isPseaEligible && fundingInputs.pseaClaim) {
    const remainingAfterGrant =
      totalWithGst - fundingBreakdown.grantAmount - fundingBreakdown.skillsFutureCredit;
    fundingBreakdown.pseaClaim = Math.min(fundingInputs.pseaClaim, remainingAfterGrant);
  }

  // UTAP (Union Training Assistance Programme)
  if (course.isUtapEligible && fundingInputs.utapClaim) {
    const remainingAfterOther =
      totalWithGst -
      fundingBreakdown.grantAmount -
      fundingBreakdown.skillsFutureCredit -
      fundingBreakdown.pseaClaim;
    fundingBreakdown.utapClaim = Math.min(fundingInputs.utapClaim, remainingAfterOther);
  }

  // IBF Funding (for financial sector courses)
  if (course.isIbfFunded && fundingInputs.ibfClaim) {
    const remainingAfterOther =
      totalWithGst -
      fundingBreakdown.grantAmount -
      fundingBreakdown.skillsFutureCredit -
      fundingBreakdown.pseaClaim -
      fundingBreakdown.utapClaim;
    fundingBreakdown.ibfClaim = Math.min(fundingInputs.ibfClaim, remainingAfterOther);
  }

  // Calculate total funding
  const totalFunding = Object.values(fundingBreakdown).reduce((sum, val) => sum + val, 0);

  // Net payable by learner
  const netPayable = Math.max(0, totalWithGst - totalFunding);

  return {
    grossCourseFee: Math.round(grossCourseFee * 100) / 100,
    discount: Math.round(discount * 100) / 100,
    subtotalBeforeGst: Math.round(subtotalBeforeGst * 100) / 100,
    gstAmount: Math.round(gstAmount * 100) / 100,
    totalWithGst: Math.round(totalWithGst * 100) / 100,
    fundingBreakdown: {
      grantAmount: Math.round(fundingBreakdown.grantAmount * 100) / 100,
      skillsFutureCredit: Math.round(fundingBreakdown.skillsFutureCredit * 100) / 100,
      pseaClaim: Math.round(fundingBreakdown.pseaClaim * 100) / 100,
      mcesClaim: Math.round(fundingBreakdown.mcesClaim * 100) / 100,
      utapClaim: Math.round(fundingBreakdown.utapClaim * 100) / 100,
      ibfClaim: Math.round(fundingBreakdown.ibfClaim * 100) / 100,
    },
    netPayable: Math.round(netPayable * 100) / 100,
  };
}

export default calculateFees;
