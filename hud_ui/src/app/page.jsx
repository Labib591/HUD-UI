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
import api from "../../lib/api";


export default function Home() {
  const { data: session, status } = useSession();
  const [preference, setPreference] = useState("");
  const queryClient = useQueryClient();

  // Fetch preferences
  const { data: preferences = [], isLoading: isPreferencesLoading } = useQuery({
    queryKey: ["preferences", session?.user?.id],
    queryFn: async () => {
      const { data } = await api.get("/preferences");
      return data.preferences || [];
    },
    enabled: !!session?.user?.id,
  });

  // Add preference
  const addPreferenceMutation = useMutation({
    mutationFn: async (newPreference) => {
      const { data } = await api.post("/preferences", { preference: newPreference });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["preferences", session?.user?.id]);
      queryClient.invalidateQueries(["newsFeed", session?.user?.id]);
      setPreference("");
    },
  });

  const deletePreferenceMutation = useMutation({
    mutationFn: async (preferenceToDelete) => {
      const { data } = await api.delete("/preferences", { data: { preference: preferenceToDelete } });
      return data;
    },
    onSuccess: () => {
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
      <div className="min-h-screen flex items-center justify-center bg-black">
        <p className="text-cyan-400 animate-pulse text-lg">
          ⚡ Initializing Dashboard...
        </p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-black to-gray-900">
        <div className="text-center p-8 rounded-xl border border-cyan-500/30 shadow-[0_0_25px_rgba(0,255,255,0.3)]">
          <h1 className="text-3xl font-bold text-cyan-400 drop-shadow-[0_0_8px_rgba(0,255,255,0.7)] mb-4">
            Welcome to HUD UI
          </h1>
          <p className="text-gray-400 mb-6">
            Please sign in to access your futuristic dashboard.
          </p>
          <div className="space-x-4">
            <Link href="/login">
              <Button className="bg-cyan-600 hover:bg-cyan-500 shadow-[0_0_15px_rgba(0,255,255,0.6)]">
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button
                variant="outline"
                className="border-cyan-500 text-cyan-400 hover:bg-cyan-500/10"
              >
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-black to-gray-900 text-gray-200">
      <div className="container mx-auto px-4 py-8">
        {session ? (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
              {/* Left Side */}
              <div className="space-y-8 col-span-1">
                <Card className="bg-gray-900/60 border border-cyan-500/30 shadow-[0_0_20px_rgba(0,255,255,0.15)]">
                  <CardHeader>
                    <CardTitle className="text-cyan-400">
                      ➕ Add Preference
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleAddPreference} className="space-y-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="preference"
                          className="text-gray-300 tracking-wide"
                        >
                          Preference
                        </Label>
                        <Input
                          id="preference"
                          type="text"
                          placeholder="Enter your preference..."
                          value={preference}
                          onChange={(e) => setPreference(e.target.value)}
                          disabled={addPreferenceMutation.isLoading}
                          className="bg-gray-800 border-cyan-500/40 text-cyan-300 placeholder:text-gray-500 focus:ring-2 focus:ring-cyan-500"
                        />
                      </div>
                      <Button
                        type="submit"
                        disabled={
                          addPreferenceMutation.isLoading || !preference.trim()
                        }
                        className="w-full bg-cyan-600 hover:bg-cyan-500 shadow-[0_0_15px_rgba(0,255,255,0.6)]"
                      >
                        {addPreferenceMutation.isLoading ? "Adding..." : "Add"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900/60 border border-cyan-500/30 shadow-[0_0_20px_rgba(0,255,255,0.15)]">
                  <CardHeader>
                    <CardTitle className="text-cyan-400">
                      ⚙️ Your Preferences
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {preferences.length > 0 ? (
                      <ul className="space-y-2">
                        {preferences.map((pref, index) => (
                          <li
                            key={index}
                            className="flex justify-between items-center px-3 py-2 bg-gray-800 rounded-md border border-cyan-500/20 hover:border-cyan-400/40 transition-colors"
                          >
                            <span className="text-gray-200">{pref}</span>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => deletePreferenceMutation.mutate(pref)}
                              disabled={deletePreferenceMutation.isLoading}
                              className="bg-red-600 hover:bg-red-500 text-white shadow-[0_0_10px_rgba(255,0,0,0.6)]"
                            >
                              ✖
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
              <div className="space-y-6 col-span-3">
                <div className="mt-8">
                  <NewsFeed preferences={preferences} session={session} />
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-4">Please sign in to view your personalized feed</p>
            <Link href="/login">
              <Button className="bg-cyan-600 hover:bg-cyan-500">
                Sign In
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
