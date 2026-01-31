import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { paymentService } from '../services/payment.service.js';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { stripeConfig, stripe } from '../config/index.js';

const calculateFeesSchema = z.object({
  enrollmentId: z.string().uuid(),
  discount: z.number().min(0).optional(),
  skillsFutureCredit: z.number().min(0).optional(),
  pseaClaim: z.number().min(0).optional(),
  utapClaim: z.number().min(0).optional(),
  ibfClaim: z.number().min(0).optional(),
  isSmeEmployer: z.boolean().optional(),
});

const createPaymentIntentSchema = z.object({
  enrollmentId: z.string().uuid(),
  amount: z.number().min(0).optional(),
  currency: z.string().length(3).optional(),
  description: z.string().optional(),
});

const refundSchema = z.object({
  amount: z.number().min(0).optional(),
});

export const paymentController = {
  async calculateFees(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = calculateFeesSchema.parse(req.body);

      const feeCalculation = await paymentService.calculateEnrollmentFees(
        data.enrollmentId,
        {
          discount: data.discount,
          skillsFutureCredit: data.skillsFutureCredit,
          pseaClaim: data.pseaClaim,
          utapClaim: data.utapClaim,
          ibfClaim: data.ibfClaim,
        },
        data.isSmeEmployer
      );

      res.json({
        success: true,
        data: feeCalculation,
      });
    } catch (error) {
      next(error);
    }
  },

  async createPaymentIntent(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = createPaymentIntentSchema.parse(req.body);

      const result = await paymentService.createPaymentIntent(data);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async webhook(req: Request, res: Response, next: NextFunction) {
    try {
      const sig = req.headers['stripe-signature'] as string;

      if (!sig) {
        res.status(400).json({
          success: false,
          error: 'Missing Stripe signature',
        });
        return;
      }

      let event;
      try {
        event = stripe.webhooks.constructEvent(
          req.body,
          sig,
          stripeConfig.webhookSecret
        );
      } catch (err) {
        console.error('Webhook signature verification failed:', err);
        res.status(400).json({
          success: false,
          error: 'Invalid signature',
        });
        return;
      }

      await paymentService.handleWebhook(event);

      res.json({ received: true });
    } catch (error) {
      next(error);
    }
  },

  async getByEnrollment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { enrollmentId } = req.params;

      const payments = await paymentService.getPaymentsByEnrollment(enrollmentId);

      res.json({
        success: true,
        data: payments,
      });
    } catch (error) {
      next(error);
    }
  },

  async refund(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { paymentId } = req.params;
      const { amount } = refundSchema.parse(req.body);

      const refund = await paymentService.refundPayment(paymentId, amount);

      res.json({
        success: true,
        data: refund,
      });
    } catch (error) {
      next(error);
    }
  },

  async getPublishableKey(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      res.json({
        success: true,
        data: {
          publishableKey: stripeConfig.publishableKey,
        },
      });
    } catch (error) {
      next(error);
    }
  },
};

export default paymentController;
