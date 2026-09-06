import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "react-hot-toast";

export const metadata = { title: "Mini Kanban", description: "Collaborative Kanban board" };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
          <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        </AuthProvider>
      </body>
    </html>
  );
}
