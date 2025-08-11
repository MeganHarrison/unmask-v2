import { Metadata } from 'next';
import PageBreadCrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import MessagesTable from '@/components/tables/MessagesTable';

export const metadata: Metadata = {
  title: 'Text Messages | Admin Dashboard',
  description: 'View and manage text messages from the database',
};

export default function MessagesPage() {
  return (
    <>
      <PageBreadCrumb pageTitle="Text Messages" />
      
      <ComponentCard
        title="Text Messages"
        desc="View and search through imported text messages from the database"
      >
        <MessagesTable />
      </ComponentCard>
    </>
  );
}