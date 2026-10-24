import { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle2, Compass, LoaderCircle, Mail, ShieldCheck } from 'lucide-react';
import { useAuth } from './AuthContext.jsx';
import { supabase } from '../lib/supabase.js';
import './auth.css';

const OTP_LIFETIME_SECONDS = 300;

function friendlyError(error) {
  const message = error?.message || 'Something went wrong. Please try again.';
  if (error?.code === 'auth_locked') return message;
  if (/invalid.*(otp|token)|otp.*invalid|expired/i.test(message)) return 'That code is incorrect or has expired. Request a new code and try again.';
  if (/already registered|already been registered/i.test(message)) return 'An account already uses this email. Sign in, use Forgot password to recover it, or sign in to request a fresh verification code if it is not verified yet.';
  if (/password.*(least|short|weak)/i.test(message)) return 'Choose a stronger password with at least 8 characters.';
  if (/rate limit|too many requests/i.test(message)) return 'Too many email requests were made. Wait a little and try again.';
  if (/email not confirmed|email_not_confirmed/i.test(message)) return 'This account is registered but its email is not verified yet. Request a fresh verification code below.';
  return message;
}

function formatTime(seconds) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

export default function AuthPage({ onBack, initialMode = 'signin' }) {
  const { configured, clearPasswordRecovery } = useAuth();
  const [mode, setMode] = useState(initialMode);
  const [step, setStep] = useState('details');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [emailNotRegistered, setEmailNotRegistered] = useState(false);

  useEffect(() => {
    if (!['verify', 'verify-recovery'].includes(step) || secondsLeft <= 0) return undefined;
    const timer = window.setTimeout(() => setSecondsLeft(value => Math.max(0, value - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [step, secondsLeft]);

  function changeMode(nextMode) {
    setMode(nextMode);
    setStep('details');
    setError('');
    setNotice('');
    setEmailNotRegistered(false);
    setPassword('');
    setNewPassword('');
    setConfirmPassword('');
  }

  async function submitDetails(event) {
    event.preventDefault();
    if (!configured || !supabase) return;
    setBusy(true);
    setError('');
    setNotice('');
    const normalizedEmail = email.trim().toLowerCase();
    try {
      if (mode === 'forgot') {
        setEmailNotRegistered(false);
        const lookupResponse = await fetch('/api/auth/email-exists', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: normalizedEmail })
        });
        const lookup = await lookupResponse.json().catch(() => ({}));
        if (!lookupResponse.ok) throw new Error(lookup.error || 'Could not check this email right now. Please try again.');
        if (!lookup.registered) {
          setEmailNotRegistered(true);
          setError('This email is not registered.');
          return;
        }
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(normalizedEmail);
        if (resetError) throw resetError;
        setEmail(normalizedEmail);
        setOtp('');
        setSecondsLeft(OTP_LIFETIME_SECONDS);
        setStep('verify-recovery');
        setNotice('We sent a password reset code to this email. Enter it within 5 minutes.');
      } else if (mode === 'signup') {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: normalizedEmail,
          password,
          options: { data: { display_name: normalizedEmail.split('@')[0] } }
        });
        if (signUpError) throw signUpError;
        if (Array.isArray(signUpData?.user?.identities) && signUpData.user.identities.length === 0) {
          setError('This email is already registered. Sign in or choose Forgot password to recover your account.');
          return;
        }
        setEmail(normalizedEmail);
        setPassword('');
        setOtp('');
        setSecondsLeft(OTP_LIFETIME_SECONDS);
        setStep('verify');
        setNotice('We sent a verification code to your email. Enter it within 5 minutes. If you already signed up but did not verify, request a fresh code.');
      } else {
        const { data: signInData, error: signInError } = await supabase.functions.invoke('guarded-sign-in', {
          body: { email: normalizedEmail, password }
        });
        if (signInError) {
          let payload = {};
          try {
            if (typeof signInError.context?.json === 'function') {
              const response = typeof signInError.context.clone === 'function' ? signInError.context.clone() : signInError.context;
              payload = await response.json();
            }
          } catch { /* use the SDK's fallback error text */ }
          const authError = new Error(payload.error || signInError.message);
          authError.code = payload.code;
          throw authError;
        }
        if (!signInData?.session?.access_token || !signInData?.session?.refresh_token) {
          throw new Error('Sign-in did not return a session. Please try again.');
        }
        const { error: sessionError } = await supabase.auth.setSession(signInData.session);
        if (sessionError) throw sessionError;
        onBack();
      }
    } catch (requestError) {
      if (mode === 'signin' && /email not confirmed|email_not_confirmed/i.test(requestError?.message || '')) {
        setEmail(normalizedEmail);
        setSecondsLeft(0);
        setStep('verify');
        setNotice('This account is registered but not verified yet. Send a fresh code to continue.');
      } else {
        setError(friendlyError(requestError));
      }
    } finally {
      setBusy(false);
    }
  }

  async function verifyEmail(event) {
    event.preventDefault();
    if (!supabase) return;
    if (secondsLeft === 0) {
      setError('This code has expired. Request a new one to continue.');
      return;
    }
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: otp.replace(/\s/g, ''),
        type: 'signup'
      });
      if (verifyError) throw verifyError;
      onBack();
    } catch (verificationError) {
      setError(friendlyError(verificationError));
    } finally {
      setBusy(false);
    }
  }

  async function resendCode() {
    if (!supabase) return;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const { error: resendError } = step === 'verify-recovery'
        ? await supabase.auth.resetPasswordForEmail(email)
        : await supabase.auth.resend({ type: 'signup', email });
      if (resendError) throw resendError;
      setOtp('');
      setSecondsLeft(OTP_LIFETIME_SECONDS);
      setNotice(step === 'verify-recovery'
        ? 'A new password reset code is on its way. Use the latest code.'
        : 'A new verification code is on its way. Use the latest code.');
    } catch (requestError) {
      setError(friendlyError(requestError));
    } finally {
      setBusy(false);
    }
  }

  async function verifyRecoveryCode(event) {
    event.preventDefault();
    if (!supabase) return;
    if (secondsLeft === 0) {
      setError('This code has expired. Request a new one to continue.');
      return;
    }
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: otp.replace(/\s/g, ''),
        type: 'recovery'
      });
      if (verifyError) throw verifyError;
      setStep('details');
      setMode('reset');
      setOtp('');
      setNotice('Email verified. Choose a new password.');
    } catch (verificationError) {
      setError(friendlyError(verificationError));
    } finally {
      setBusy(false);
    }
  }

  async function updatePassword(event) {
    event.preventDefault();
    if (!supabase) return;
    if (newPassword.length < 8) {
      setError('Choose a password with at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('The passwords do not match.');
      return;
    }
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
      if (updateError) throw updateError;
      clearPasswordRecovery();
      setNotice('Your password has been updated. You can now sign in with it.');
      setPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setMode('signin');
    } catch (updateError) {
      setError(friendlyError(updateError));
    } finally {
      setBusy(false);
    }
  }

  return <main className="auth-page">
    <section className="auth-card" aria-labelledby="auth-title">
      <button className="auth-back" type="button" onClick={onBack}><ArrowLeft size={17}/> Back to EKTA</button>
      <div className="auth-brand"><span><Compass size={25}/></span><b>ekta<span>.</span></b></div>
      {step === 'verify-recovery' ? <>
        <div className="auth-icon"><Mail size={23}/></div>
        <p className="auth-kicker">PASSWORD RESET VERIFICATION</p>
        <h1 id="auth-title">Verify your email</h1>
        <p className="auth-description">Enter the one-time password sent to <strong>{email}</strong> before changing your password.</p>
        <form onSubmit={verifyRecoveryCode} className="auth-form">
          <label htmlFor="auth-recovery-otp">Password reset code</label>
          <input id="auth-recovery-otp" autoComplete="one-time-code" inputMode="numeric" pattern="[0-9]{6,8}" minLength={6} maxLength={8} required value={otp} onChange={event => setOtp(event.target.value.replace(/\D/g, '').slice(0, 8))} placeholder="Enter the code" disabled={!configured}/>
          <div className="otp-timer" aria-live="polite">{secondsLeft > 0 ? <>Code expires in <b>{formatTime(secondsLeft)}</b></> : <span>Code expired. Request a new one.</span>}</div>
          {error && <p className="auth-message auth-error" role="alert">{error}</p>}
          {notice && <p className="auth-message auth-notice" role="status">{notice}</p>}
          <button className="auth-submit" type="submit" disabled={busy || !configured || otp.length < 6 || secondsLeft === 0}>{busy ? <LoaderCircle className="auth-spin" size={17}/> : <><ShieldCheck size={17}/> Verify code</>}</button>
        </form>
        <button className="auth-switch" type="button" onClick={resendCode} disabled={busy || !configured || secondsLeft > 0}>{busy ? 'Sending…' : secondsLeft > 0 ? `Resend available in ${formatTime(secondsLeft)}` : 'Send a new code'}</button>
      </> : step === 'verify' ? <>
        <div className="auth-icon"><Mail size={23}/></div>
        <p className="auth-kicker">EMAIL VERIFICATION</p>
        <h1 id="auth-title">Check your inbox</h1>
        <p className="auth-description">Enter the one-time code sent to <strong>{email}</strong>.</p>
        <form onSubmit={verifyEmail} className="auth-form">
          <label htmlFor="auth-otp">Verification code</label>
          <input id="auth-otp" autoComplete="one-time-code" inputMode="numeric" pattern="[0-9]{6,8}" minLength={6} maxLength={8} required value={otp} onChange={event => setOtp(event.target.value.replace(/\D/g, '').slice(0, 8))} placeholder="Enter the code" disabled={!configured}/>
          <div className="otp-timer" aria-live="polite">{secondsLeft > 0 ? <>Code expires in <b>{formatTime(secondsLeft)}</b></> : <span>Code expired. Request a new one.</span>}</div>
          {error && <p className="auth-message auth-error" role="alert">{error}</p>}
          {notice && <p className="auth-message auth-notice" role="status">{notice}</p>}
          <button className="auth-submit" type="submit" disabled={busy || !configured || otp.length < 6 || secondsLeft === 0}>{busy ? <LoaderCircle className="auth-spin" size={17}/> : <><ShieldCheck size={17}/> Verify email</>}</button>
        </form>
        <button className="auth-switch" type="button" onClick={resendCode} disabled={busy || !configured || secondsLeft > 0}>{busy ? 'Sending…' : secondsLeft > 0 ? `Resend available in ${formatTime(secondsLeft)}` : 'Send a new code'}</button>
      </> : mode === 'reset' ? <>
        <div className="auth-icon"><ShieldCheck size={23}/></div>
        <p className="auth-kicker">ACCOUNT SECURITY</p>
        <h1 id="auth-title">Choose a new password</h1>
        <p className="auth-description">Set a new password for your EKTA account.</p>
        <form onSubmit={updatePassword} className="auth-form">
          <label htmlFor="auth-new-password">New password</label>
          <input id="auth-new-password" type="password" autoComplete="new-password" minLength={8} required value={newPassword} onChange={event => setNewPassword(event.target.value)} placeholder="At least 8 characters" disabled={!configured}/>
          <label htmlFor="auth-confirm-password">Confirm new password</label>
          <input id="auth-confirm-password" type="password" autoComplete="new-password" minLength={8} required value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} placeholder="Enter it again" disabled={!configured}/>
          {error && <p className="auth-message auth-error" role="alert">{error}</p>}
          {notice && <p className="auth-message auth-notice" role="status">{notice}</p>}
          <button className="auth-submit" type="submit" disabled={busy || !configured}>{busy ? <LoaderCircle className="auth-spin" size={17}/> : 'Update password'}</button>
        </form>
      </> : <>
        <div className="auth-icon"><ShieldCheck size={23}/></div>
        <p className="auth-kicker">YOUR JOURNEY, YOURS</p>
        <h1 id="auth-title">{mode === 'signup' ? 'Create your account' : 'Welcome back'}</h1>
        <p className="auth-description">{mode === 'signup' ? 'Sign up to keep your saved places and trip plans with you.' : 'Sign in to continue planning your next journey.'}</p>
        <form onSubmit={submitDetails} className="auth-form">
          <label htmlFor="auth-email">Email address</label>
          <input id="auth-email" type="email" autoComplete="email" required value={email} onChange={event => setEmail(event.target.value)} placeholder="you@example.com" disabled={!configured}/>
          {mode !== 'forgot' && <>
            <label htmlFor="auth-password">Password</label>
            <input id="auth-password" type="password" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} minLength={8} required value={password} onChange={event => setPassword(event.target.value)} placeholder="At least 8 characters" disabled={!configured}/>
          </>}
          {mode === 'signin' && <button className="auth-switch auth-forgot" type="button" onClick={() => changeMode('forgot')}>Forgot password?</button>}
          {error && <p className="auth-message auth-error" role="alert">{error}{emailNotRegistered && <> <button className="auth-inline-action" type="button" onClick={() => changeMode('signup')}>Sign up instead</button></>}</p>}
          {notice && <p className="auth-message auth-notice" role="status">{notice}</p>}
          {!configured && <p className="auth-message auth-setup" role="status">Authentication is not connected yet. Add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> to your local <code>.env</code> file, then restart the app.</p>}
          <button className="auth-submit" type="submit" disabled={busy || !configured}>{busy ? <LoaderCircle className="auth-spin" size={17}/> : mode === 'signup' ? 'Create account' : mode === 'forgot' ? 'Send OTP' : 'Sign in'}</button>
        </form>
        {mode !== 'forgot' && <p className="auth-switch">{mode === 'signup' ? 'Already have an account?' : 'New to EKTA?'} <button type="button" onClick={() => changeMode(mode === 'signup' ? 'signin' : 'signup')}>{mode === 'signup' ? 'Sign in' : 'Create account'}</button></p>}
        {mode === 'forgot' && <p className="auth-switch"><button type="button" onClick={() => changeMode('signin')}>Back to sign in</button></p>}
      </>}
    </section>
  </main>;
}
