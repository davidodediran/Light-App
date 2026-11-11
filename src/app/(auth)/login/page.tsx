import { LoginForm } from './login-form'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-slate-900">Light App</h1>
          <p className="text-slate-500 mt-1">Sign in to your school portal</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
