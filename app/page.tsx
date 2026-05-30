import HelloMessage from "./HelloMessage";
import { fetchFromBackend } from "@/lib/backend";

export default async function Home() {
  const res = await fetchFromBackend("/api/hello");
  const message = await res.text();

  return <HelloMessage message={message} />;
}
