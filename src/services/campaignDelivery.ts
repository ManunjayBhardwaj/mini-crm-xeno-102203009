import { messageQueue, QUEUES, MessageStatus } from './messageQueue';
import Campaign from '@/models/Campaign';
import Customer from '@/models/Customer';
import Segment from '@/models/Segment';
import { generateCampaignMessage } from './ai';

export interface DeliveryResult {
  customerId: string;
  campaignId: string;
  status: MessageStatus;
  error?: string;
}

class CampaignDeliveryService {
  private static instance: CampaignDeliveryService;

  private constructor() {
    this.setupMessageHandlers();
  }

  public static getInstance(): CampaignDeliveryService {
    if (!CampaignDeliveryService.instance) {
      CampaignDeliveryService.instance = new CampaignDeliveryService();
    }
    return CampaignDeliveryService.instance;
  }

  private setupMessageHandlers() {
    messageQueue.onMessage(QUEUES.CAMPAIGN_DELIVERY, this.handleCampaignDelivery.bind(this));
    messageQueue.onMessage(QUEUES.MESSAGE_DELIVERY, this.handleMessageDelivery.bind(this));
    messageQueue.onMessage(QUEUES.DELIVERY_RECEIPT, this.handleDeliveryReceipt.bind(this));
  }

  private async evaluateSegmentRules(customer: any, rules: any[]): Promise<boolean> {
    return rules.every(rule => {
      const value = customer[rule.field];
      switch (rule.operator) {
        case '>': return value > rule.value;
        case '<': return value < rule.value;
        case '>=': return value >= rule.value;
        case '<=': return value <= rule.value;
        case '==': return value === rule.value;
        case '!=': return value !== rule.value;
        default: return false;
      }
    });
  }

  public async startCampaign(campaignId: string) {
    const campaign = await Campaign.findById(campaignId).populate('segmentId');
    if (!campaign) throw new Error('Campaign not found');

    // Update campaign status to running
    campaign.status = 'running';
    await campaign.save();

    // Queue campaign for delivery
    await messageQueue.enqueue(QUEUES.CAMPAIGN_DELIVERY, {
      campaignId,
      segmentId: campaign.segmentId._id,
      message: campaign.message
    });
  }

  private async handleCampaignDelivery(message: any) {
    const { campaignId, segmentId, message: template } = message.data;
    
    try {
      const segment = await Segment.findById(segmentId);
      const customers = await Customer.find({});
      const qualifiedCustomers = customers.filter(customer => 
        this.evaluateSegmentRules(customer, segment.rules)
      );

      // Update campaign with audience size
      await Campaign.findByIdAndUpdate(campaignId, {
        'stats.audienceSize': qualifiedCustomers.length
      });

      // Queue individual messages for delivery
      for (const customer of qualifiedCustomers) {
        const personalizedMessage = template.replace('{firstName}', customer.firstName);
        await messageQueue.enqueue(QUEUES.MESSAGE_DELIVERY, {
          campaignId,
          customerId: customer._id,
          message: personalizedMessage
        });
      }
    } catch (error) {
      console.error('Error in campaign delivery:', error);
      await Campaign.findByIdAndUpdate(campaignId, { status: 'failed' });
    }
  }

  private async handleMessageDelivery(message: any) {
    const { campaignId, customerId, message: content } = message.data;

    try {
      // Simulate message delivery with 90% success rate
      const isSuccessful = Math.random() < 0.9;
      
      const deliveryResult: DeliveryResult = {
        campaignId,
        customerId,
        status: isSuccessful ? MessageStatus.DELIVERED : MessageStatus.FAILED,
        error: isSuccessful ? undefined : 'Delivery failed'
      };

      // Queue delivery receipt
      await messageQueue.enqueue(QUEUES.DELIVERY_RECEIPT, deliveryResult);
    } catch (error) {
      console.error('Error in message delivery:', error);
    }
  }

  private async handleDeliveryReceipt(message: any) {
    const result: DeliveryResult = message.data;

    try {
      const updateQuery = result.status === MessageStatus.DELIVERED
        ? { $inc: { 'stats.delivered': 1 } }
        : { $inc: { 'stats.failed': 1 } };

      const campaign = await Campaign.findByIdAndUpdate(
        result.campaignId,
        updateQuery,
        { new: true }
      );

      // Check if campaign is complete
      if (campaign.stats.delivered + campaign.stats.failed >= campaign.stats.audienceSize) {
        campaign.status = 'completed';
        campaign.completedAt = new Date();
        await campaign.save();
      }
    } catch (error) {
      console.error('Error handling delivery receipt:', error);
    }
  }
}

export const campaignDeliveryService = CampaignDeliveryService.getInstance();
