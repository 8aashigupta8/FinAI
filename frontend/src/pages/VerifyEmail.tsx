import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import api from "../api";

const VerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const navigate = useNavigate();

    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [message, setMessage] = useState("Verifying your email...");

    useEffect(() => {
        if (!token) {
            setStatus("error");
            setMessage("No verification token found.");
            return;
        }

        const verifyEmail = async () => {
            try {
                await api.get(`verify-email/?token=${token}`);
                setStatus("success");
                setMessage("Your email has been successfully verified!");
            } catch (error: any) {
                setStatus("error");
                setMessage(error.response?.data?.error || "Verification failed. The token may be invalid or expired.");
            }
        };

        verifyEmail();
    }, [token]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
            <Card className="w-full max-w-md shadow-2xl text-center">
                <CardHeader>
                    <div className="mx-auto mb-4 h-16 w-16 rounded-full flex items-center justify-center bg-muted">
                        {status === "loading" && <Loader2 className="h-8 w-8 animate-spin text-primary" />}
                        {status === "success" && <CheckCircle2 className="h-8 w-8 text-green-500" />}
                        {status === "error" && <XCircle className="h-8 w-8 text-destructive" />}
                    </div>
                    <CardTitle>Email Verification</CardTitle>
                    <CardDescription>{message}</CardDescription>
                </CardHeader>
                <CardContent>
                    {status !== "loading" && (
                        <Button className="w-full" onClick={() => navigate("/auth")}>
                            Proceed to Login
                        </Button>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default VerifyEmail;
