import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, Mail, Lock, Loader2, ShieldCheck } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import { useAuth } from "@/lib/AuthContext";
import { renderGoogleSignInButton } from "@/lib/google-web-auth";

export default function Login() {
  const { login, verifyOtp, resendOtp, loginWithGoogleCredential } = useAuth();
  const googleButtonRef = useRef(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpStep, setOtpStep] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    renderGoogleSignInButton({
      element: googleButtonRef.current,
      onError: (msg) => { if (!cancelled) setError(msg); },
      onCredential: async (credential) => {
        if (cancelled) return;
        setError("");
        setGoogleLoading(true);
        try {
          await loginWithGoogleCredential(credential);
          window.location.href = "/dashboard";
        } catch (err) {
          setError(err.message || "Google login failed. Please try again or use email login.");
        } finally {
          if (!cancelled) setGoogleLoading(false);
        }
      },
    }).catch((err) => { if (!cancelled) setError(err.message || "Google login could not load."); });
    return () => { cancelled = true; };
  }, [loginWithGoogleCredential]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      if (otpStep) {
        await verifyOtp({ email: email.trim(), token: otp.trim(), purpose: 'login' });
        window.location.href = "/dashboard";
        return;
      }
      const result = await login(email.trim(), password);
      if (result?.requires_otp) {
        setOtpStep(true);
        setMessage(result.message || "Verification code sent to your email.");
        return;
      }
      window.location.href = "/dashboard";
    } catch (err) {
      setError(err.message || "Invalid owner email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setMessage("");
    setLoading(true);
    try {
      await resendOtp(email.trim(), 'login');
      setMessage("New verification code sent.");
    } catch (err) {
      setError(err.message || "Could not resend OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      icon={otpStep ? ShieldCheck : LogIn}
      title={otpStep ? "Verify login" : "Welcome back"}
      subtitle={otpStep ? `Enter the code sent to ${email}` : "Log in to your SE7EN FIT owner account"}
      footer={<>{otpStep ? "Wrong email?" : "Don&apos;t have an account?"}{" "}<Link to={otpStep ? "/login" : "/register"} className="text-primary font-medium hover:underline">{otpStep ? "Start again" : "Create one"}</Link></>}
    >
      {!otpStep && (
        <>
          <div className="w-full mb-6 min-h-[48px] flex items-center justify-center">
            <div ref={googleButtonRef} className="w-full flex justify-center" />
            {googleLoading && <Loader2 className="w-4 h-4 ml-3 animate-spin text-primary" />}
          </div>
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-3 text-muted-foreground">or</span></div>
          </div>
        </>
      )}

      {error && <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}
      {message && <div className="mb-4 p-3 rounded-lg bg-primary/10 text-primary text-sm">{message}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        {!otpStep ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
                <Input id="email" type="email" autoComplete="email" autoFocus placeholder="owner@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10 h-12" required />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link to="/forgot-password" className="text-xs text-primary hover:underline">Forgot password?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
                <Input id="password" type="password" autoComplete="current-password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 h-12" required />
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="otp">Verification Code</Label>
            <Input id="otp" inputMode="numeric" maxLength={6} autoFocus placeholder="Enter 6-digit OTP" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} className="h-12 text-center text-lg tracking-[0.35em]" required />
            <button type="button" onClick={handleResend} className="text-xs text-primary hover:underline" disabled={loading}>Resend code</button>
          </div>
        )}
        <Button type="submit" className="w-full h-12 font-medium" disabled={loading || (otpStep && otp.length !== 6)}>
          {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{otpStep ? 'Verifying...' : 'Logging in...'}</> : otpStep ? 'Verify & Continue' : 'Log in'}
        </Button>
      </form>
    </AuthLayout>
  );
}
