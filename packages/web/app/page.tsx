import Link from "next/link";

export default function Home() {
  return (
    <main>
      <h1>Welcome to Dolt SQL Workbench</h1>
      <Link href="/workbench">Launch Workbench</Link>
    </main>
  );
}
