"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import NewsFeed from "@/components/NewsFeed";

export default function Home() {
  const { data: session, status } = useSession();
  const [preference, setPreference] = useState("");
  const queryClient = useQueryClient();

  // Fetch preferences
  const { data: preferences = [], isLoading: isPreferencesLoading } = useQuery({
    queryKey: ["preferences", session?.user?.id],
    queryFn: async () => {
      const res = await fetch("/api/preferences");
      if (!res.ok) throw new Error("Failed to fetch preferences");
      const data = await res.json();
      return data.preferences || [];
    },
    enabled: !!session?.user?.id,
  });

  // Add preference
  const addPreferenceMutation = useMutation({
    mutationFn: async (newPreference) => {
      const res = await fetch("/api/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preference: newPreference }),
      });
      if (!res.ok) throw new Error("Failed to add preference");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["preferences", session?.user?.id]);
      // This will also trigger NewsFeed refetch if it depends on preferences
      queryClient.invalidateQueries(["newsFeed", session?.user?.id]);
      setPreference("");
    },
  });

  const deletePreferenceMutation = useMutation({
    mutationFn: async (preferenceToDelete) => {
      const res = await fetch("/api/preferences", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preference: preferenceToDelete }),
      });
      if (!res.ok) throw new Error("Failed to delete preference");
      return res.json();
    },
    onSuccess: () => {
      // Refetch preferences and news feed
      queryClient.invalidateQueries(["preferences", session?.user?.id]);
      queryClient.invalidateQueries(["newsFeed", session?.user?.id]);
    },
  });

  const handleAddPreference = (e) => {
    e.preventDefault();
    if (!preference.trim()) return;
    addPreferenceMutation.mutate(preference.trim());
  };

  if (status === "loading" || isPreferencesLoading) {
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
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Welcome to HUD UI
          </h1>
          <p className="text-gray-600 mb-6">
            Please sign in to access your dashboard.
          </p>
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
          {/* Left Side */}
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
                      disabled={addPreferenceMutation.isLoading}
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={
                      addPreferenceMutation.isLoading || !preference.trim()
                    }
                  >
                    {addPreferenceMutation.isLoading
                      ? "Adding..."
                      : "Add Preference"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Your Preferences</CardTitle>
              </CardHeader>
              <CardContent>
                {preferences.length > 0 ? (
                  <ul className="space-y-2">
                    {preferences.map((pref, index) => (
                      <li
                        key={index}
                        className="flex justify-between items-center p-2 bg-gray-100 rounded-md"
                      >
                        <span>{pref}</span>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deletePreferenceMutation.mutate(pref)}
                          disabled={deletePreferenceMutation.isLoading}
                        >
                          Delete
                        </Button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No preferences added yet.</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Side - News Feed */}
          <div className="space-y-6">
            <NewsFeed preferences={preferences} />
          </div>
        </div>
      </div>
    </div>
  );
}
