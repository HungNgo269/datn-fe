import AdminLayout from "./layout";

export default function Page() {
  return (
    <AdminLayout>
      <div className="space-y-4">
        <p className="text-muted-foreground">
          Welcome to the Admin Panel. Select a section from the sidebar to get
          started.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg border border-border bg-muted/50">
            <h3 className="font-semibold text-foreground">Total Users</h3>
            <p className="text-2xl font-bold text-primary">1,234</p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-muted/50">
            <h3 className="font-semibold text-foreground">Total Books</h3>
            <p className="text-2xl font-bold text-primary">567</p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-muted/50">
            <h3 className="font-semibold text-foreground">Active Sessions</h3>
            <p className="text-2xl font-bold text-primary">89</p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
