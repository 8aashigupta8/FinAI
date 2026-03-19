import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Shield, TrendingUp, ArrowLeft, Mail } from "lucide-react";
import { useAuth } from "@/App";
import api from "../api";

// Basic types - expand as needed based on backend response
type RegisterResponse = {
  message: string;
};

type LoginResponse = {
  access: string;
  refresh: string;
  user: {
    id: string;
    email: string;
    name?: string;
    user_type?: string;
  }
};

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setUser } = useAuth();

  const handleForgotPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await api.post("password-reset/", { email: forgotEmail });

      toast({
        title: "Email Sent!",
        description: "Check your email for the password reset link.",
      });
      setShowForgotPassword(false);
      setForgotEmail("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to send reset email",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const form = e.currentTarget;

    const formData = new FormData(form);
    const email = formData.get("signup-email") as string;
    const password = formData.get("signup-password") as string;
    const fullName = formData.get("full-name") as string;
    const phoneNumber = formData.get("phone-number") as string;
    const role = formData.get("user-role") as string;

    try {
      // TODO: Replace with Django API call
      await api.post<RegisterResponse>("signup/", {
        name: fullName,
        email,
        mobile_number: phoneNumber,
        user_type: role,
        password,
      });

      toast({
        title: "Registration Successful",
        description: "Please check your email to verify your account before logging in.",
      });

      form.reset();

    } catch (error: any) {
      console.log("Signup error:", error.response?.data);
      toast({
        title: "Registration Failed",
        description: error instanceof Error ? error.message : "Unable to create account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("signin-email") as string;
    const password = formData.get("signin-password") as string;

    try {
      const response = await api.post<LoginResponse>("login/", { email, password });

      const { access, refresh } = response.data;

      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);

      // We need to decode the token or use the user data from response if provided
      // Assuming CustomLoginView returns user data (it usually doesn't by default unless customized, 
      // but let's assume we decode token or fetch user profile next. 
      // For now, let's use a placeholder or the returned user if available)

      // If the backend doesn't return user info in login, we might need a /me endpoint or decode the token.
      // Based on typical JWT, we can decode it. But let's check if my previous view inspection showed CustomLoginView.

      setUser({
        id: "user-id-placeholder", // You might want to decode token to get ID or fetch proper user profile
        email: email,
        full_name: "User", // Fetch real name if possible
      });

      toast({
        title: "Welcome back!",
        description: "Successfully signed in.",
      });

      navigate("/dashboard");
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Login Failed",
        description: error.response?.data?.detail || "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center">
        {/* Branding Section */}
        <div className="space-y-6 text-center md:text-left">
          <div className="flex items-center gap-3 justify-center md:justify-start">
            <div className="h-12 w-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
              <Shield className="h-7 w-7 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              FinGuardian OS
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-md">
            AI-powered compliance and finance automation for GST, ROC, and Tax management
          </p>
          <div className="space-y-4 pt-4">
            <div className="flex items-start gap-3">
              <TrendingUp className="h-5 w-5 text-primary mt-1" />
              <div>
                <h3 className="font-semibold">Automated Compliance Checking</h3>
                <p className="text-sm text-muted-foreground">Real-time GST validation and error detection</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-primary mt-1" />
              <div>
                <h3 className="font-semibold">AI Document Processing</h3>
                <p className="text-sm text-muted-foreground">Extract invoice data with high accuracy</p>
              </div>
            </div>
          </div>
        </div>

        {/* Auth Forms */}
        <Card className="shadow-2xl">
          {showForgotPassword ? (
            <>
              <CardHeader>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-fit -ml-2 mb-2"
                  onClick={() => setShowForgotPassword(false)}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to login
                </Button>
                <div className="mx-auto mb-2 h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-center">Forgot Password?</CardTitle>
                <CardDescription className="text-center">
                  Enter your email and we'll send you a reset link
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="forgot-email">Email</Label>
                    <Input
                      id="forgot-email"
                      type="email"
                      placeholder="name@company.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Sending..." : "Send Reset Link"}
                  </Button>
                </form>
              </CardContent>
            </>
          ) : (
            <>
              <CardHeader>
                <CardTitle>Get Started</CardTitle>
                <CardDescription>Create an account or sign in to continue</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="signin" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="signin">Sign In</TabsTrigger>
                    <TabsTrigger value="signup">Sign Up</TabsTrigger>
                  </TabsList>

                  <TabsContent value="signin">
                    <form onSubmit={handleSignIn} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="signin-email">Email</Label>
                        <Input
                          id="signin-email"
                          name="signin-email"
                          type="email"
                          placeholder="name@company.com"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="signin-password">Password</Label>
                          <Button
                            type="button"
                            variant="link"
                            className="px-0 h-auto font-normal text-sm"
                            onClick={() => setShowForgotPassword(true)}
                          >
                            Forgot password?
                          </Button>
                        </div>
                        <Input
                          id="signin-password"
                          name="signin-password"
                          type="password"
                          placeholder="••••••••"
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? "Signing in..." : "Sign In"}
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="signup">
                    <form onSubmit={handleSignUp} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="full-name">Full Name</Label>
                        <Input
                          id="full-name"
                          name="full-name"
                          type="text"
                          placeholder="John Doe"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone-number">Phone Number</Label>
                        <Input
                          id="phone-number"
                          name="phone-number"
                          type="tel"
                          placeholder="+91 9876543210"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="user-role">Role</Label>
                        <select
                          id="user-role"
                          name="user-role"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          required
                        >
                          <option value="">Select your role</option>
                          <option value="Founder/Co-founder">Founder/Co-founder</option>
                          <option value="CA (Chartered Accountant)">CA (Chartered Accountant)</option>
                          <option value="CS (Company Secretary)">CS (Company Secretary)</option>
                          <option value="Legal">Legal</option>
                          <option value="Firm">Firm</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-email">Email</Label>
                        <Input
                          id="signup-email"
                          name="signup-email"
                          type="email"
                          placeholder="name@company.com"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-password">Password</Label>
                        <Input
                          id="signup-password"
                          name="signup-password"
                          type="password"
                          placeholder="••••••••"
                          minLength={6}
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? "Creating account..." : "Create Account"}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Auth;
