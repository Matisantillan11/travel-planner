import { signIn } from "@/auth";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await auth();

  if (session) {
    redirect("/dashboard");
  }

  const { callbackUrl } = await searchParams;
  const redirectTo =
    typeof callbackUrl === "string" ? callbackUrl : "/dashboard";

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col gap-6 w-full max-w-sm p-8">
        <h1 className="text-2xl font-semibold text-center">Sign in</h1>
        <p className="text-sm text-center text-gray-500">
          Use your Google or GitHub account to continue
        </p>

        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo });
          }}
        >
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2"
          >
            Continue with Google
          </button>
        </form>

        <form
          action={async () => {
            "use server";
            await signIn("github", { redirectTo });
          }}
        >
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2"
          >
            Continue with GitHub
          </button>
        </form>
      </div>
    </main>
  );
}
