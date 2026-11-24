import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { WelcomeTour } from "@/pages/agent/hub/WelcomeTour";

export const Route = createFileRoute("/welcome")({
  ssr: false,
  component: WelcomePage,
  head: () => ({
    meta: [
      { title: "Welcome to Ceyo" },
      { name: "description", content: "A quick tour of what Ceyo can do for you: tasks, daily routines and app integrations." },
      { property: "og:title", content: "Welcome to Ceyo" },
      { property: "og:description", content: "A quick tour of Ceyo: tasks, routines and integrations." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function WelcomePage() {
  const nav = useNavigate();
  const [ar, setAr] = useState(false);
  useEffect(() => { setAr(/^ar/i.test(document.documentElement.lang || navigator.language)); }, []);
  return <WelcomeTour ar={ar} force onDone={() => nav({ to: "/" })} />;
}
