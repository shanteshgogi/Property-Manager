import { useState } from "react";
import { Redirect } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { signInWithGoogle } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Building2, Chrome } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
    const { user, loading } = useAuth();
    const [signingIn, setSigningIn] = useState(false);
    const { toast } = useToast();

    const handleGoogleSignIn = async () => {
        setSigningIn(true);
        try {
            await signInWithGoogle();
            toast({
                title: "Welcome!",
                description: "Successfully signed in with Google",
            });
        } catch (error: any) {
            console.error("Sign-in error:", error);
            toast({
                title: "Sign-in failed",
                description: error.message || "Failed to sign in with Google",
                variant: "destructive",
            });
        } finally {
            setSigningIn(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
                <div className="text-center">
                    <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                    <p className="mt-4 text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    if (user) {
        return <Redirect to="/" />;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
            <Card className="w-full max-w-md p-8 space-y-6">
                <div className="text-center space-y-2">
                    <div className="flex justify-center">
                        <div className="p-3 bg-primary/10 rounded-full">
                            <Building2 className="w-12 h-12 text-primary" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold">Property Manager</h1>
                    <p className="text-muted-foreground">
                        Manage your properties, tenants, and transactions all in one place
                    </p>
                </div>

                <div className="space-y-4">
                    <Button
                        onClick={handleGoogleSignIn}
                        disabled={signingIn}
                        className="w-full h-12 text-base"
                        size="lg"
                    >
                        {signingIn ? (
                            <>
                                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></div>
                                Signing in...
                            </>
                        ) : (
                            <>
                                <Chrome className="mr-2 h-5 w-5" />
                                Sign in with Google
                            </>
                        )}
                    </Button>

                    <p className="text-xs text-center text-muted-foreground">
                        By signing in, you agree to our Terms of Service and Privacy Policy
                    </p>
                </div>

                <div className="pt-4 border-t">
                    <div className="text-sm text-muted-foreground space-y-2">
                        <p className="font-semibold">Features:</p>
                        <ul className="space-y-1 ml-4 list-disc">
                            <li>Manage multiple properties</li>
                            <li>Track tenants and leases</li>
                            <li>Record income and expenses</li>
                            <li>Generate reports</li>
                        </ul>
                    </div>
                </div>
            </Card>
        </div>
    );
}
