import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useAuth } from "@/App";
import api from "../api";
import { LogOut } from "lucide-react";

const Dashboard = () => {
    const { user, setUser } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            const refreshToken = localStorage.getItem("refresh_token");
            if (refreshToken) {
                await api.post("logout/", { refresh: refreshToken });
            }
        } catch (error) {
            console.error("Logout failed", error);
        } finally {
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            setUser(null);
            navigate("/auth");
        }
    };

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <Button variant="destructive" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Welcome back{user?.full_name ? `, ${user.full_name}` : ""}!</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">
                        You are securely logged in. This is a protected route.
                    </p>
                    <div className="mt-4 p-4 bg-muted rounded-md">
                        <p className="font-mono text-sm">User ID: {user?.id || "N/A"}</p>
                        <p className="font-mono text-sm">Email: {user?.email || "N/A"}</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Dashboard;
