import { Outlet } from "remix";
import Header from "~/components/Header";

export default function AppLayout() {
  return (
    <div className="flex h-screen flex-col">
      <Header />
      <div className="flex-grow">
        <Outlet />
      </div>
    </div>
  );
}
