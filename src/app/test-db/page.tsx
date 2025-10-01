'use client'

import { useState } from 'react'
import { userService, portfolioService, achievementService } from '@/lib/database'
import { useAuth } from '@/contexts/AuthContext'

export default function TestDBPage() {
  const { user } = useAuth()
  const [testResults, setTestResults] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const runTests = async () => {
    setIsLoading(true)
    const results: string[] = []
    
    try {
      // Test 0: Basic connectivity test (works without auth)
      try {
        const response = await fetch('/api/test-connection')
        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            results.push(`✅ API connection test: ${data.message}`)
          } else {
            results.push(`⚠️ API connection test: ${data.error}`)
          }
        } else {
          results.push(`❌ API connection test failed: ${response.status}`)
        }
      } catch (error) {
        results.push(`❌ API connection test error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }

      // Test 1: Check if user is authenticated
      if (user) {
        results.push(`✅ User authenticated: ${user.email}`)
        
        // Test 2: Get user profile
        try {
          const profile = await userService.getCurrentUser()
          if (profile) {
            results.push(`✅ User profile retrieved: ${profile.name || 'No name set'}`)
          } else {
            results.push(`⚠️ User profile not found (may need to confirm email first)`)
          }
        } catch (error) {
          results.push(`❌ Error getting user profile: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }

        // Test 3: Get email preferences
        try {
          const preferences = await userService.getEmailPreferences()
          if (preferences) {
            results.push(`✅ Email preferences retrieved: Kifolio=${preferences.kifolio_communications}, Account=${preferences.account_activity}`)
          } else {
            results.push(`⚠️ Email preferences not found`)
          }
        } catch (error) {
          results.push(`❌ Error getting email preferences: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }

        // Test 4: Get user portfolios
        try {
          const portfolios = await portfolioService.getUserPortfolios()
          results.push(`✅ User portfolios retrieved: ${portfolios.length} found`)
          
          // Test 4b: Create a test portfolio if none exist
          if (portfolios.length === 0) {
            try {
              const testPortfolio = await portfolioService.createPortfolio({
                child_name: 'Test Child',
                portfolio_title: 'Test Portfolio',
                template: 'ren',
                is_private: false
              })
              results.push(`✅ Test portfolio created: ${testPortfolio.id}`)
              
              // Test 4c: Try to retrieve the public portfolio
              const retrievedPortfolio = await portfolioService.getPublicPortfolio(testPortfolio.id)
              if (retrievedPortfolio) {
                results.push(`✅ Public portfolio retrieval working: ${retrievedPortfolio.portfolio_title}`)
              } else {
                results.push(`⚠️ Public portfolio retrieval failed`)
              }
              
              // Test 4d: Create a test achievement
              try {
                const testAchievement = await achievementService.createAchievement({
                  portfolio_id: testPortfolio.id,
                  title: 'Test Achievement',
                  description: 'This is a test achievement',
                  date_achieved: new Date().toISOString().split('T')[0],
                  media_urls: [],
                  category: 'milestone',
                  type: 'achievement'
                })
                results.push(`✅ Test achievement created: ${testAchievement.id}`)
                
                // Test 4e: Retrieve achievements for the portfolio
                const portfolioAchievements = await achievementService.getPortfolioAchievements(testPortfolio.id)
                results.push(`✅ Portfolio achievements retrieved: ${portfolioAchievements.length} found`)
                
                // Test 4f: Update the achievement
                const updatedAchievement = await achievementService.updateAchievement(testAchievement.id, {
                  title: 'Updated Test Achievement',
                  description: 'This achievement was updated'
                })
                results.push(`✅ Achievement updated: ${updatedAchievement.title}`)
                
                // Test 4g: Delete the achievement
                await achievementService.deleteAchievement(testAchievement.id)
                results.push(`✅ Test achievement deleted`)
                
              } catch (error) {
                results.push(`❌ Error testing achievement operations: ${error instanceof Error ? error.message : 'Unknown error'}`)
              }
              
              // Clean up test portfolio
              await portfolioService.deletePortfolio(testPortfolio.id)
              results.push(`✅ Test portfolio cleaned up`)
              
            } catch (error) {
              results.push(`❌ Error creating test portfolio: ${error instanceof Error ? error.message : 'Unknown error'}`)
            }
          }
        } catch (error) {
          results.push(`❌ Error getting portfolios: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }

        // Test 5: Test public portfolio access (should work without auth)
        try {
          // This will fail if no portfolios exist, but should not throw auth errors
          const publicPortfolio = await portfolioService.getPublicPortfolio('test-id')
          if (publicPortfolio === null) {
            results.push(`✅ Public portfolio access working (correctly returned null for non-existent ID)`)
          }
        } catch (error) {
          // Check if this is an expected "not found" error vs a real connection issue
          if (error instanceof Error && error.message.includes('Failed to fetch portfolio')) {
            // This is expected - it means the database is working but no portfolio exists
            results.push(`✅ Public portfolio access working (database responding correctly)`)
          } else {
            results.push(`❌ Error testing public portfolio access: ${error instanceof Error ? error.message : 'Unknown error'}`)
          }
        }

      } else {
        results.push(`⚠️ No user authenticated - sign in to test database operations`)
      }

    } catch (error) {
      results.push(`❌ Test suite error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    setTestResults(results)
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Database Connection Test</h1>
          
          <div className="mb-6">
            <button
              onClick={runTests}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md font-medium"
            >
              {isLoading ? 'Running Tests...' : 'Run Database Tests'}
            </button>
          </div>

          {testResults.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-gray-900">Test Results:</h2>
              {testResults.map((result, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-md">
                  <span className="font-mono text-sm">{result}</span>
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 p-4 bg-blue-50 rounded-md">
            <h3 className="font-semibold text-blue-900 mb-2">What This Tests:</h3>
            <ul className="text-blue-800 text-sm space-y-1">
              <li>• Supabase connection and authentication</li>
              <li>• Database schema and table access</li>
              <li>• Row Level Security policies</li>
              <li>• User profile creation and retrieval</li>
              <li>• Email preferences system</li>
              <li>• Portfolio access controls</li>
            </ul>
          </div>

          {!user && (
            <div className="mt-6 p-4 bg-yellow-50 rounded-md">
              <p className="text-yellow-800 text-sm">
                <strong>Note:</strong> Sign in to test authenticated database operations. 
                Some tests will show limited results for unauthenticated users.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
