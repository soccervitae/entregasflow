/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_SUPABASE_URL:
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://wdgpmpgdlauiawbtbxmn.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkZ3BtcGdkbGF1aWF3YnRieG1uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0MTQ2NDAsImV4cCI6MjA3MTk5MDY0MH0.N4GcBwufglOUGhJ9pARhgxsA3_NOY9WbAtsKRmtBA08',
  },
};

export default nextConfig;
