import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { city, state } = body

    console.log('Testing user operations with:', { city, state })

    // Create server-side Supabase client
    const supabase = await createClient()
    
    // Get the authenticated user
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !authUser) {
      console.error('Authentication error:', authError)
      return NextResponse.json({
        success: false,
        error: 'User not authenticated',
        details: authError?.message || 'No user found'
      }, { status: 401 })
    }

    console.log('User authenticated:', authUser.id)

    // Try to get current user first
    let user
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (error) {
        console.log('Get user error:', error)
        user = null
      } else {
        user = data
        console.log('Current user found:', user ? 'Yes' : 'No')
      }
    } catch (getUserError) {
      console.log('Get user error:', getUserError)
      user = null
    }

    // If no user found, try to create one
    if (!user) {
      try {
        console.log('Attempting to create user...')
        const { data, error } = await supabase
          .from('users')
          .insert([{
            id: authUser.id,
            email: authUser.email || '',
            name: authUser.user_metadata?.name || null,
            city: city || null,
            state: state || null
          }])
          .select()
          .single()

        if (error) {
          throw error
        }

        user = data
        console.log('User created successfully:', user)
        return NextResponse.json({
          success: true,
          action: 'created',
          user: user
        })
      } catch (createError) {
        console.error('Create user failed:', createError)
        return NextResponse.json({
          success: false,
          error: 'Failed to create user',
          details: createError instanceof Error ? createError.message : 'Unknown error'
        }, { status: 500 })
      }
    }

    // If user exists, try to update
    try {
      console.log('Attempting to update user...')
      const { data, error } = await supabase
        .from('users')
        .update({ city, state })
        .eq('id', authUser.id)
        .select()
        .single()

      if (error) {
        throw error
      }

      console.log('User updated successfully:', data)
      return NextResponse.json({
        success: true,
        action: 'updated',
        user: data
      })
    } catch (updateError) {
      console.error('Update user failed:', updateError)
      return NextResponse.json({
        success: false,
        error: 'Failed to update user',
        details: updateError instanceof Error ? updateError.message : 'Unknown error'
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Test user API failed:', error)
    return NextResponse.json({
      success: false,
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
