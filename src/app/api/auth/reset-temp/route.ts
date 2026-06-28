import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// ENDPOINT TEMPORÁRIO - REMOVER APÓS USO
export async function POST(req: Request) {
  const { secret, userId, newPassword } = await req.json()

  if (secret !== process.env.TEMP_RESET_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data, error } = await supabase.auth.admin.updateUserById(userId, {
    password: newPassword,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ ok: true, email: data.user?.email })
}
