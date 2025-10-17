import AdminLayout from "@/components/admin/AdminLayout";
import "./globals.css";

export const metadata = {
    title: "GoCart. - Admin",
    description: "GoCart. - Admin",
};

export default function RootAdminLayout({ children }) {

    return (
        <html>
            <body>
                 <>
            <AdminLayout>
                {children}
            </AdminLayout>
        </>
                
            </body>
        </html>

    );
}
