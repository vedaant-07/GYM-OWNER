import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Mail, Lock, Loader2, User, Phone, Building2, ShieldCheck } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import { useAuth } from "@/lib/AuthContext";
import { renderGoogleSignInButton } from "@/lib/google-web-auth";
import { isPhone10, normalizePhone10 } from "@/lib/phone";

export default function Register() {
  const { register, verifyOtp, resendOtp, loginWithGoogleCredential } = useAuth();
  const googleButtonRef = useRef(null);
  const errorTimerRef = useRef(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState("");
  const [pendingEmail, setPendingEmail] = useState("");

  const showError = (messageText) => {
    setError(messageText);
    if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    errorTimerRef.current = setTimeout(() => setError(""), 4000);
  };

  useEffect(() => {
    let cancelled = false;
    renderGoogleSignInButton({
      element: googleButtonRef.current,
      onError: (msg) => { if (!cancelled) showError(msg); },
      onCredential: async (credential) => {
        if (cancelled) return;
        setError("");
        setGoogleLoading(true);
        try {
          await loginWithGoogleCredential(credential);
          window.location.href = "/onboarding";
        } catch (err) {
          showError(err.message || "Google registration failed. Please try again or use email registration.");
        } finally {
          if (!cancelled) setGoogleLoading(false);
        }
      },
    }).catch((err) => { if (!cancelled) showError(err.message || "Google registration could not load."); });

    return () => {
      cancelled = true;
      if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    };
  }, [loginWithGoogleCredential]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (otpStep) {
      setLoading(true);
      try {
        await verifyOtp({ email: pendingEmail, token: otp.trim(), purpose: 'register' });
        window.location.href = "/onboarding";
      } catch (err) {
        showError(err.message || "OTP verification failed");
      } finally {
        setLoading(false);
      }
      return;
    }

    const formData = new FormData(e.currentTarget);
    const ownerName = String(formData.get("ownerName") || "").trim();
    const gymName = String(formData.get("gymName") || "").trim();
    const phone = normalizePhone10(formData.get("phone") || "");
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");
    const confirmPassword = String(formData.get("confirmPassword") || "");

    if (!ownerName) return showError("Please enter owner name");
    if (phone && !isPhone10(phone)) return showError("Phone number must be exactly 10 digits");
    if (!email) return showError("Please enter email");
    if (!password) return showError("Please enter password");
    if (password !== confirmPassword) return showError("Passwords do not match");

    setLoading(true);
    try {
      const result = await register({ name: ownerName, ownerName, gymName, phone, email, password });
      if (result?.requires_otp) {
        setPendingEmail(email);
        setOtpStep(true);
        setMessage(result.message || "Verification code sent to your email.");
        return;
      }
      window.location.href = "/onboarding";
    } catch (err) {
      showError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setMessage("");
    setLoading(true);
    try {
      await resendOtp(pendingEmail, 'register');
      setMessage("New verification code sent.");
    } catch (err) {
      showError(err.message || "Could not resend OTP.");
    } finally {
      setLoading(false);
    }
  };

  const limitPhone = (event) => { event.currentTarget.value = normalizePhone10(event.currentTarget.value); };

  return (
    <AuthLayout
      icon={otpStep ? ShieldCheck : UserPlus}
      title={otpStep ? "Verify your owner account" : "Create your owner account"}
      subtitle={otpStep ? `Enter the code sent to ${pendingEmail}` : "Connect your gym to SE7EN FIT"}
      footer={<>{otpStep ? "Wrong email?" : "Already have an account?"}{" "}<Link to={otpStep ? "/register" : "/login"} className="text-primary font-medium hover:underline">{otpStep ? "Start again" : "Log in"}</Link></>}
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
        {otpStep ? (
          <div className="space-y-2">
            <Label htmlFor="otp">Verification Code</Label>
            <Input id="otp" inputMode="numeric" maxLength={6} autoFocus placeholder="Enter 6-digit OTP" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} className="h-12 text-center text-lg tracking-[0.35em]" required />
            <button type="button" onClick={handleResend} className="text-xs text-primary hover:underline" disabled={loading}>Resend code</button>
          </div>
        ) : (
          <>
            <div className="space-y-2"><Label htmlFor="ownerName">Owner Name</Label><div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" /><Input id="ownerName" name="ownerName" autoComplete="name" placeholder="Your full name" className="pl-10 h-12" required /></div></div>
            <div className="space-y-2"><Label htmlFor="gymName">Gym Name</Label><div className="relative"><Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" /><Input id="gymName" name="gymName" autoComplete="organization" placeholder="Your gym name" className="pl-10 h-12" /></div></div>
            <div className="space-y-2"><Label htmlFor="phone">Mobile Number</Label><div className="relative"><Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" /><Input id="phone" name="phone" type="tel" inputMode="numeric" autoComplete="tel" maxLength={10} pattern="[0-9]{10}" placeholder="9876543210" onInput={limitPhone} className="pl-10 h-12" /></div></div>
            <div className="space-y-2"><Label htmlFor="email">Email</Label><div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" aria-hidden="true" /><Input id="email" name="email" type="email" autoComplete="email" placeholder="owner@example.com" className="pl-10 h-12" required /></div></div>
            <div className="space-y-2"><Label htmlFor="password">Password</Label><div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" aria-hidden="true" /><Input id="password" name="password" type="password" autoComplete="new-password" placeholder="••••••••" className="pl-10 h-12" required /></div></div>
            <div className="space-y-2"><Label htmlFor="confirmPassword">Confirm Password</Label><div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" aria-hidden="true" /><Input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" placeholder="••••••••" className="pl-10 h-12" required /></div></div>
          </>
        )}
        <Button type="submit" className="w-full h-12 font-medium" disabled={loading || (otpStep && otp.length !== 6)}>
          {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{otpStep ? 'Verifying...' : 'Creating account...'}</> : otpStep ? 'Verify & Continue' : 'Create owner account'}
        </Button>
      </form>
    </AuthLayout>
  );
}
