import AdminLayout from "@/components/admin/AdminLayout";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { AdminProvider } from "@/context/AdminContext";

export const metadata = {
    title: "glamour. - Admin",
    description: "glamour. - Admin",
};

export default function RootAdminLayout({ children }) {

    return (
        <html>
            <body>
                 <>
            <AdminLayout>
                <AdminProvider>
                <Toaster/>
                {children}
                </AdminProvider>
            </AdminLayout>
        </>
                
            </body>
        </html>

    );
}
