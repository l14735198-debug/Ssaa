import SignPage from "./sign-page";

export default async function Page({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <SignPage token={token} />;
}
