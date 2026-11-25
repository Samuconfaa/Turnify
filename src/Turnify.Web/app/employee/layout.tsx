import EmployeeSidebar from '@/components/EmployeeSidebar';

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app">
      <EmployeeSidebar />
      <div className="main">
        {children}
      </div>
    </div>
  );
}
