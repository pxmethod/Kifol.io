import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('Delete user API called')
    
    const supabase = await createClient()
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      console.error('User authentication error:', userError)
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 })
    }

    console.log(`Attempting to delete user: ${user.id} (${user.email})`)

    // Create admin client with service role key for user deletion
    const adminSupabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
    
    // Delete the user from auth.users using Admin API
    // This will cascade delete all related data due to foreign key constraints
    const { error: deleteError } = await adminSupabase.auth.admin.deleteUser(user.id)

    if (deleteError) {
      console.error('Error deleting user account:', deleteError)
      return NextResponse.json({ error: `Failed to delete account: ${deleteError.message}` }, { status: 500 })
    }

    console.log(`Successfully deleted user account: ${user.id}`)
    
    // Clear the user's session after successful deletion
    await supabase.auth.signOut()
    
    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('Error in delete user API:', error)
    return NextResponse.json({ error: `Internal server error: ${error}` }, { status: 500 })
  }
}
