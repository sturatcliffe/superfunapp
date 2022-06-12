import { Link, Form } from "remix";

import { useUser } from "~/utils";

export default function Header() {
  const user = useUser();
  return (
    <header className="flex items-center justify-between bg-slate-800 p-4 text-white">
      <h1 className="text-3xl font-bold">
        <Link to="/users">SuperFunApp</Link>
      </h1>
      <Link to="/profile">{user.email}</Link>
      <div className="flex items-center">
        <span className="mr-2 rounded-full bg-teal-500 px-3 py-1 text-sm">
          New! {"-->"}
        </span>
        <Link to="/chat">Chat</Link>
        <Form action="/logout" method="post" className="ml-4">
          <button
            type="submit"
            className="rounded bg-slate-600 py-2 px-4 text-blue-100 hover:bg-blue-500 active:bg-blue-600"
          >
            Logout
          </button>
        </Form>
      </div>
    </header>
  );
}
