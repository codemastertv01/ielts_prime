import AppLayout from '@/components/Layout/AppLayout';

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <AppLayout menuItems='admin' title="IELTS Admin" subtitle="Admin Panel" homePath="/admin" roleLabel="Administrator">
            {children}
        </AppLayout>
    );
};

export default AdminLayout;
