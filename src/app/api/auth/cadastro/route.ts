import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { nome, sobrenome, email, senha } = await req.json()

  if (!nome || !sobrenome || !email || !senha) {
    return NextResponse.json({ error: 'Campos obrigatórios faltando.' }, { status: 400 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Cria o usuário no auth (o trigger cria o profile automaticamente)
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password: senha,
    user_metadata: { nome, sobrenome },
    email_confirm: true, // confirma o e-mail automaticamente
  })

  if (error) {
    if (error.message.includes('already been registered') || error.message.includes('already exists')) {
      return NextResponse.json({ error: 'Este e-mail já está cadastrado.' }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ userId: data.user?.id }, { status: 201 })
}
