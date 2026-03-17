import DashboardLayout from "@/components/DashboardLayout";

export default function Settings() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 max-w-4xl mx-auto pb-10">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p>Settings page content goes here.</p>
      </div>
    </DashboardLayout>
  );
}