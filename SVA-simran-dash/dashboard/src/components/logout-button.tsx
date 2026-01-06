"use client";

import { useRouter } from "next/navigation";

export function LogoutButton() {
    const router = useRouter();

    const handleLogout = async () => {
        await fetch("/api/logout", { method: "POST" });
        router.push("/login");
        router.refresh();
    };

    return (
        <button
            onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-gray-900 font-medium transition-colors"
        >
            Logout
        </button>
    );
}
