// Database services
import { PortfolioService } from './portfolios'
import { AchievementService } from './achievements'
import { UserService } from './users'
import { InvitationService } from './invitations'
import { EventReminderService } from './event-reminders'

// Create service instances for easy import
export const portfolioService = new PortfolioService()
export const achievementService = new AchievementService()
export const userService = new UserService()
export const invitationService = new InvitationService()
export const eventReminderService = new EventReminderService()

// Export classes for type usage
export { PortfolioService, AchievementService, UserService, InvitationService, EventReminderService }

