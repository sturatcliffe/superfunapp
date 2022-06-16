import { Outlet } from "remix";
import Header from "~/components/Header";

export default function AppLayout() {
  return (
    <>
      <Header />
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </>
  );
}
