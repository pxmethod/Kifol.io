import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Test basic connection
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1)
    
    if (error) {
      return NextResponse.json({ 
        success: false, 
        error: error.message,
        details: error
      }, { status: 500 })
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Supabase connection successful!',
      data: data
    })
    
  } catch (error) {
    console.error('Connection test failed:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to connect to Supabase',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
