import { PaymentStatus } from '@prisma/client';
import Stripe from 'stripe';
import { prisma, stripe } from '../config/index';
import { AppError } from '../middleware/error.middleware';
import { calculateFees } from '../utils/feeCalculator';
import { FeeCalculationResult, CreatePaymentIntentRequest, PaymentIntentResponse } from '../types/index';

export const paymentService = {
  async calculateEnrollmentFees(
    enrollmentId: string,
    fundingInputs: {
      discount?: number;
      skillsFutureCredit?: number;
      pseaClaim?: number;
      utapClaim?: number;
      ibfClaim?: number;
    } = {},
    isSmeEmployer: boolean = false
  ): Promise<FeeCalculationResult> {
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        courseRun: {
          include: { course: true },
        },
        learner: true,
      },
    });

    if (!enrollment) {
      throw new AppError('Enrollment not found', 404);
    }

    const course = enrollment.courseRun.course;
    const learner = enrollment.learner;

    const feeCalculation = calculateFees(
      {
        courseFee: Number(course.courseFee),
        taxPercent: Number(course.taxPercent),
        isWsqFunded: course.isWsqFunded,
        isSkillsFutureEligible: course.isSkillsFutureEligible,
        isPseaEligible: course.isPseaEligible,
        isMcesEligible: course.isMcesEligible,
        isIbfFunded: course.isIbfFunded,
        isUtapEligible: course.isUtapEligible,
      },
      {
        dob: learner.dob,
        nationality: learner.nationality,
        employmentStatus: learner.employmentStatus,
      },
      fundingInputs,
      isSmeEmployer
    );

    // Update enrollment fee record
    await prisma.enrollmentFee.upsert({
      where: { enrollmentId },
      update: {
        totalCourseFee: feeCalculation.grossCourseFee,
        discount: feeCalculation.discount,
        grantAmount: feeCalculation.fundingBreakdown.grantAmount,
        skillsFutureCreditClaim: feeCalculation.fundingBreakdown.skillsFutureCredit,
        pseaClaim: feeCalculation.fundingBreakdown.pseaClaim,
        mcesClaim: feeCalculation.fundingBreakdown.mcesClaim,
        utapClaim: feeCalculation.fundingBreakdown.utapClaim,
        ibfClaim: feeCalculation.fundingBreakdown.ibfClaim,
        gstAmount: feeCalculation.gstAmount,
        netPayable: feeCalculation.netPayable,
      },
      create: {
        enrollmentId,
        totalCourseFee: feeCalculation.grossCourseFee,
        discount: feeCalculation.discount,
        grantAmount: feeCalculation.fundingBreakdown.grantAmount,
        skillsFutureCreditClaim: feeCalculation.fundingBreakdown.skillsFutureCredit,
        pseaClaim: feeCalculation.fundingBreakdown.pseaClaim,
        mcesClaim: feeCalculation.fundingBreakdown.mcesClaim,
        utapClaim: feeCalculation.fundingBreakdown.utapClaim,
        ibfClaim: feeCalculation.fundingBreakdown.ibfClaim,
        gstAmount: feeCalculation.gstAmount,
        netPayable: feeCalculation.netPayable,
      },
    });

    return feeCalculation;
  },

  async createPaymentIntent(
    data: CreatePaymentIntentRequest
  ): Promise<PaymentIntentResponse> {
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: data.enrollmentId },
      include: {
        learner: {
          include: { user: true },
        },
        enrollmentFee: true,
        courseRun: {
          include: { course: true },
        },
      },
    });

    if (!enrollment) {
      throw new AppError('Enrollment not found', 404);
    }

    // Use calculated net payable or provided amount
    const amount = data.amount || Number(enrollment.enrollmentFee?.netPayable || 0);

    if (amount <= 0) {
      throw new AppError('Payment amount must be greater than zero', 400);
    }

    // Amount in cents for Stripe
    const amountInCents = Math.round(amount * 100);

    // Create or get Stripe customer
    let stripeCustomerId = enrollment.learner.user.email; // Use email as identifier

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: data.currency || 'sgd',
      description:
        data.description ||
        `Course enrollment: ${enrollment.courseRun.course.title}`,
      metadata: {
        enrollmentId: enrollment.id,
        courseRunId: enrollment.courseRunId,
        learnerId: enrollment.learnerId,
      },
    });

    // Create payment record
    await prisma.payment.create({
      data: {
        enrollmentId: data.enrollmentId,
        trainingProviderId: enrollment.courseRun.trainingProviderId,
        stripePaymentIntentId: paymentIntent.id,
        stripeCustomerId,
        amount,
        currency: data.currency || 'SGD',
        status: PaymentStatus.Processing,
        description: data.description,
      },
    });

    if (!paymentIntent.client_secret) {
      throw new AppError('Failed to create payment intent', 500);
    }

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount,
      currency: data.currency || 'SGD',
    };
  },

  async handleWebhook(event: Stripe.Event) {
    const paymentIntent = event.data.object as { id: string };

    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.handlePaymentSuccess(paymentIntent.id);
        break;

      case 'payment_intent.payment_failed':
        await this.handlePaymentFailure(paymentIntent.id);
        break;

      case 'payment_intent.canceled':
        await this.handlePaymentCanceled(paymentIntent.id);
        break;
    }
  },

  async handlePaymentSuccess(paymentIntentId: string) {
    const payment = await prisma.payment.findFirst({
      where: { stripePaymentIntentId: paymentIntentId },
    });

    if (!payment) {
      console.error(`Payment not found for intent: ${paymentIntentId}`);
      return;
    }

    // Update payment status
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: PaymentStatus.Paid },
    });

    // Update enrollment payment status
    await prisma.enrollment.update({
      where: { id: payment.enrollmentId },
      data: { paymentStatus: PaymentStatus.Paid },
    });

    // Create transaction record
    await prisma.paymentTransaction.create({
      data: {
        paymentId: payment.id,
        transactionType: 'payment_succeeded',
        amount: payment.amount,
        status: 'completed',
        stripeEventId: paymentIntentId,
      },
    });
  },

  async handlePaymentFailure(paymentIntentId: string) {
    const payment = await prisma.payment.findFirst({
      where: { stripePaymentIntentId: paymentIntentId },
    });

    if (!payment) return;

    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: PaymentStatus.Failed },
    });

    await prisma.enrollment.update({
      where: { id: payment.enrollmentId },
      data: { paymentStatus: PaymentStatus.Failed },
    });

    await prisma.paymentTransaction.create({
      data: {
        paymentId: payment.id,
        transactionType: 'payment_failed',
        amount: payment.amount,
        status: 'failed',
        stripeEventId: paymentIntentId,
      },
    });
  },

  async handlePaymentCanceled(paymentIntentId: string) {
    const payment = await prisma.payment.findFirst({
      where: { stripePaymentIntentId: paymentIntentId },
    });

    if (!payment) return;

    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: PaymentStatus.Failed },
    });

    await prisma.paymentTransaction.create({
      data: {
        paymentId: payment.id,
        transactionType: 'payment_canceled',
        amount: payment.amount,
        status: 'canceled',
        stripeEventId: paymentIntentId,
      },
    });
  },

  async getPaymentsByEnrollment(enrollmentId: string) {
    const payments = await prisma.payment.findMany({
      where: { enrollmentId },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return payments;
  },

  async refundPayment(paymentId: string, amount?: number) {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new AppError('Payment not found', 404);
    }

    if (payment.status !== PaymentStatus.Paid) {
      throw new AppError('Can only refund completed payments', 400);
    }

    if (!payment.stripePaymentIntentId) {
      throw new AppError('No Stripe payment intent found', 400);
    }

    const refundAmount = amount || Number(payment.amount);
    const refundAmountInCents = Math.round(refundAmount * 100);

    // Create Stripe refund
    const refund = await stripe.refunds.create({
      payment_intent: payment.stripePaymentIntentId,
      amount: refundAmountInCents,
    });

    // Create transaction record
    await prisma.paymentTransaction.create({
      data: {
        paymentId: payment.id,
        transactionType: 'refund',
        amount: refundAmount,
        status: refund.status || 'pending',
        stripeEventId: refund.id,
      },
    });

    // Update payment status if full refund
    if (refundAmount >= Number(payment.amount)) {
      await prisma.payment.update({
        where: { id: paymentId },
        data: { status: PaymentStatus.Failed }, // or create a "Refunded" status
      });
    }

    return refund;
  },
};

export default paymentService;
