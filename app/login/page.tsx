import { LoginForm } from './LoginForm'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-5">
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl mx-auto">D</div>
          <h1 className="text-2xl font-bold">Dev Knowledge Hub</h1>
          <p className="text-sm text-muted-foreground">Sign in to access your knowledge base</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
