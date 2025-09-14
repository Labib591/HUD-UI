"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Navbar() {
  const { data: session, status } = useSession();

  return (
    <nav className="bg-gradient-to-r from-gray-950 via-black to-gray-900 border-b border-cyan-500/30 shadow-[0_0_15px_rgba(0,255,255,0.2)]">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <Link
              href="/"
              className="text-2xl font-extrabold tracking-wide text-cyan-400 drop-shadow-[0_0_8px_rgba(0,255,255,0.7)] hover:text-cyan-300 transition-colors"
            >
              HUD<span className="text-gray-300">UI</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            {session && (
              <>
                <Link
                  href="/"
                  className="text-gray-400 hover:text-cyan-300 transition-colors tracking-wide"
                >
                  Dashboard
                </Link>
                <Link
                  href="/bookmark"
                  className="flex items-center text-gray-400 hover:text-cyan-300 transition-colors tracking-wide"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-1"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                  </svg>
                  Bookmarks
                </Link>
              </>
            )}
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {status === "loading" ? (
              <div className="text-sm text-gray-400 animate-pulse">
                Initializing...
              </div>
            ) : session ? (
              <div className="flex items-center space-x-4">
                <div className="hidden sm:block text-sm text-gray-300">
                  Welcome,{" "}
                  <span className="text-cyan-400">{session.user.name}</span>
                </div>
                <Button
                  onClick={() => signOut()}
                  size="sm"
                  className="bg-red-600 hover:bg-red-500 text-white shadow-[0_0_12px_rgba(255,0,0,0.6)]"
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/login">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-cyan-500 text-cyan-400 hover:bg-cyan-500/10"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button
                    size="sm"
                    className="bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_12px_rgba(0,255,255,0.6)]"
                  >
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
