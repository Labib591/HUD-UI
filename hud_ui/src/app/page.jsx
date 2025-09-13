"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  const { data: session, status } = useSession();
  const [preference, setPreference] = useState("");
  const [preferences, setPreferences] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch user preferences on component mount
  useEffect(() => {
    if (session?.user?.id) {
      fetchPreferences();
    }
  }, [session]);

  const fetchPreferences = async () => {
    try {
      const response = await fetch("/api/preferences");
      if (response.ok) {
        const data = await response.json();
        setPreferences(data.preferences || []);
      }
    } catch (error) {
      console.error("Error fetching preferences:", error);
    }
  };

  const handleAddPreference = async (e) => {
    e.preventDefault();
    if (!preference.trim()) return;

    setLoading(true);
    try {
      const response = await fetch("/api/preferences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ preference: preference.trim() }),
      });

      if (response.ok) {
        const data = await response.json();
        setPreferences(data.preferences);
        setPreference("");
      } else {
        console.error("Failed to add preference");
      }
    } catch (error) {
      console.error("Error adding preference:", error);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Welcome to HUD UI</h1>
          <p className="text-gray-600 mb-6">Please sign in to access your dashboard.</p>
          <div className="space-x-4">
            <Link href="/login">
              <Button>Sign In</Button>
            </Link>
            <Link href="/register">
              <Button variant="outline">Sign Up</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
          {/* Left Side - Preference Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Add Preference</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddPreference} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="preference">Preference</Label>
                    <Input
                      id="preference"
                      type="text"
                      placeholder="Enter your preference..."
                      value={preference}
                      onChange={(e) => setPreference(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  <Button type="submit" disabled={loading || !preference.trim()}>
                    {loading ? "Adding..." : "Add Preference"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Current Preferences List */}
            <Card>
              <CardHeader>
                <CardTitle>Your Preferences</CardTitle>
              </CardHeader>
              <CardContent>
                {preferences.length > 0 ? (
                  <ul className="space-y-2">
                    {preferences.map((pref, index) => (
                      <li key={index} className="p-2 bg-gray-100 rounded-md">
                        {pref}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No preferences added yet.</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Placeholder for future content */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Dashboard
                  </h3>
                  <p className="text-gray-500">
                    This area will contain your main dashboard content.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
