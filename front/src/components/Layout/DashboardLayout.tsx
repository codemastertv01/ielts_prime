import AppLayout from '@/components/Layout/AppLayout';

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <AppLayout menuItems="dashboard" title="EnglishMaster" subtitle="IELTS Prep" homePath="/dashboard" roleLabel="Learner">
            {children}
        </AppLayout>
    );
};

export default DashboardLayout;
