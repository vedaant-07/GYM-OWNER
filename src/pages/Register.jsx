import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Mail, Lock, Loader2, User, Phone, Building2, CheckCircle } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import { useAuth } from "@/lib/AuthContext";
import { renderGoogleSignInButton } from "@/lib/google-web-auth";
import { isPhone10, normalizePhone10 } from "@/lib/phone";

export default function Register() {
  const { register, loginWithGoogleCredential } = useAuth();
  const googleButtonRef = useRef(null);
  const errorTimerRef = useRef(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");

  const showError = (message) => {
    setError(message);
    if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    errorTimerRef.current = setTimeout(() => setError(""), 3000);
  };

  useEffect(() => {
    let cancelled = false;

    renderGoogleSignInButton({
      element: googleButtonRef.current,
      onError: (message) => {
        if (!cancelled) showError(message);
      },
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
    }).catch((err) => {
      if (!cancelled) showError(err.message || "Google registration could not load.");
    });

    return () => {
      cancelled = true;
      if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    };
  }, [loginWithGoogleCredential]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const formData = new FormData(e.currentTarget);
    const ownerName = String(formData.get("ownerName") || "").trim();
    const gymName = String(formData.get("gymName") || "").trim();
    const phone = normalizePhone10(formData.get("phone") || "");
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");
    const confirmPassword = String(formData.get("confirmPassword") || "");

    if (!ownerName) {
      showError("Please enter owner name");
      return;
    }
    if (phone && !isPhone10(phone)) {
      showError("Phone number must be exactly 10 digits");
      return;
    }
    if (!email) {
      showError("Please enter email");
      return;
    }
    if (!password) {
      showError("Please enter password");
      return;
    }
    if (password !== confirmPassword) {
      showError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const result = await register({
        name: ownerName,
        ownerName,
        gymName,
        phone,
        email,
        password,
      });

      if (result?.requires_email_verification || !result?.access_token) {
        setVerificationEmail(email);
        return;
      }

      window.location.href = "/onboarding";
    } catch (err) {
      showError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const limitPhone = (event) => {
    event.currentTarget.value = normalizePhone10(event.currentTarget.value);
  };

  if (verificationEmail) {
    return (
      <AuthLayout
        icon={CheckCircle}
        title="Verify your email"
        subtitle="We sent a confirmation email to activate your owner account"
        footer={
          <>
            Already verified?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Log in
            </Link>
          </>
        }
      >
        <div className="space-y-4 text-center">
          <p className="text-sm text-foreground">
            Check <span className="font-semibold">{verificationEmail}</span> and open the verification link from Supabase/SE7EN FIT.
          </p>
          <p className="text-xs text-muted-foreground">
            After verification, return to login and use your email/password.
          </p>
          <Button type="button" className="w-full h-12 font-medium" onClick={() => (window.location.href = "/login")}>
            Go to login
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      icon={UserPlus}
      title="Create your owner account"
      subtitle="Connect your gym to SE7EN FIT"
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="text-primary font-medium hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <div className="w-full mb-6 min-h-[48px] flex items-center justify-center">
        <div ref={googleButtonRef} className="w-full flex justify-center" />
        {googleLoading && <Loader2 className="w-4 h-4 ml-3 animate-spin text-primary" />}
      </div>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-3 text-muted-foreground">or</span>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="ownerName">Owner Name</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input id="ownerName" name="ownerName" autoComplete="name" placeholder="Your full name" className="pl-10 h-12" required />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="gymName">Gym Name</Label>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input id="gymName" name="gymName" autoComplete="organization" placeholder="Your gym name" className="pl-10 h-12" />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Mobile Number</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input id="phone" name="phone" type="tel" inputMode="numeric" autoComplete="tel" maxLength={10} pattern="[0-9]{10}" placeholder="9876543210" onInput={limitPhone} className="pl-10 h-12" />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" aria-hidden="true" />
            <Input id="email" name="email" type="email" autoComplete="email" placeholder="owner@example.com" className="pl-10 h-12" required />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" aria-hidden="true" />
            <Input id="password" name="password" type="password" autoComplete="new-password" placeholder="••••••••" className="pl-10 h-12" required />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" aria-hidden="true" />
            <Input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" placeholder="••••••••" className="pl-10 h-12" required />
          </div>
        </div>
        <Button type="submit" className="w-full h-12 font-medium" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating account...
            </>
          ) : (
            "Create owner account"
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}
