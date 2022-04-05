import { Form, Link, Outlet } from "remix";
import { useUser } from "~/utils";

export default function AppLayout() {
  const user = useUser();
  return (
    <div className="flex h-full min-h-screen flex-col">
      <header className="flex items-center justify-between bg-slate-800 p-4 text-white">
        <h1 className="text-3xl font-bold">
          <Link to="users">SuperFunApp</Link>
        </h1>
        <Link to="profile">{user.email}</Link>
        <Form action="/logout" method="post">
          <button
            type="submit"
            className="rounded bg-slate-600 py-2 px-4 text-blue-100 hover:bg-blue-500 active:bg-blue-600"
          >
            Logout
          </button>
        </Form>
      </header>

      <Outlet />
    </div>
  );
}
