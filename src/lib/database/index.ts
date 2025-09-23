// Database services
import { PortfolioService } from './portfolios'
import { HighlightService } from './achievements'
import { UserService } from './users'
import { InvitationService } from './invitations'

// Create service instances for easy import
export const portfolioService = new PortfolioService()
export const achievementService = new HighlightService() // Keep achievementService name for backward compatibility
export const userService = new UserService()
export const invitationService = new InvitationService()

// Export classes for type usage
export { PortfolioService, HighlightService as AchievementService, UserService, InvitationService }

