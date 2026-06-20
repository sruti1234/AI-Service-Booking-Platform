import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Sparkles, Mail, Lock, ArrowRight, User, Phone, Briefcase } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/auth-store";
import { useProviders, createProviderRecord } from "@/lib/provider-store";
import { CATEGORIES, type Category } from "@/lib/data";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — ServiceAI" },
      { name: "description", content: "Sign in or create an account on ServiceAI." },
    ],
  }),
  component: Auth,
});

function Auth() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [role, setRole] = useState<"customer" | "provider">("customer");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("alex@demo.app");
  const [password, setPassword] = useState("demo1234");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("Mumbai");
  const [category, setCategory] = useState<Category>("Electrician");
  const [rate, setRate] = useState(400);
  const [exp, setExp] = useState(3);
  const [bio, setBio] = useState("");
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const { addProvider } = useProviders();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const userId = "u_" + Date.now();
    const safeName = name || (mode === "login" ? "Demo User" : "New User");
    const avatar = `https://i.pravatar.cc/200?u=${encodeURIComponent(email)}`;

    if (role === "provider" && mode === "register") {
      const provider = createProviderRecord({
        ownerUserId: userId,
        name: safeName,
        category,
        city,
        phone,
        hourlyRate: rate,
        experience: exp,
        bio: bio || `${category} with ${exp} years of experience in ${city}.`,
        avatar,
      });
      addProvider(provider);
      signIn({
        id: userId,
        role: "provider",
        name: safeName,
        email,
        phone,
        avatar,
        city,
        providerId: provider.id,
      });
      navigate({ to: "/provider-portal" });
      return;
    }

    signIn({
      id: userId,
      role,
      name: safeName,
      email,
      phone,
      avatar,
      city,
      providerId: role === "provider" ? "prov_1" : undefined,
    });
    navigate({ to: role === "provider" ? "/provider-portal" : "/dashboard" });
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="relative hidden lg:block bg-gradient-hero">
        <div className="absolute inset-0 p-12 flex flex-col justify-between text-white">
          <Link to="/" className="flex items-center gap-2">
            <div className="size-9 rounded-xl bg-gradient-primary grid place-items-center shadow-glow">
              <Sparkles className="size-5" />
            </div>
            <span className="font-display font-bold text-lg">ServiceAI</span>
          </Link>
          <div>
            <h2 className="text-4xl font-display font-bold leading-tight">
              The smartest way to book home services.
            </h2>
            <p className="mt-4 text-white/70 max-w-md">
              Customers find trusted pros with AI matching. Providers grow their business with
              fewer empty days.
            </p>
          </div>
          <div className="text-xs text-white/50">© 2026 ServiceAI</div>
        </div>
      </div>

      <div className="flex items-center justify-center p-6 overflow-y-auto">
        <div className="w-full max-w-sm py-8">
          <h1 className="text-2xl font-display font-bold">
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {mode === "login"
              ? "Sign in to continue."
              : "Pick how you want to use ServiceAI."}
          </p>

          {/* Role tabs */}
          <div className="mt-6 grid grid-cols-2 rounded-xl border bg-muted/40 p-1 text-sm">
            <button
              type="button"
              onClick={() => setRole("customer")}
              className={`rounded-lg py-2 font-medium transition ${
                role === "customer" ? "bg-background shadow-sm" : "text-muted-foreground"
              }`}
            >
              <User className="size-4 inline mr-1.5" />
              Customer
            </button>
            <button
              type="button"
              onClick={() => setRole("provider")}
              className={`rounded-lg py-2 font-medium transition ${
                role === "provider" ? "bg-background shadow-sm" : "text-muted-foreground"
              }`}
            >
              <Briefcase className="size-4 inline mr-1.5" />
              Service Provider
            </button>
          </div>

          <form className="mt-5 space-y-3" onSubmit={submit}>
            {mode === "register" && (
              <Field label="Full name" icon={User}>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputCls}
                  placeholder={role === "provider" ? "e.g. Ramesh Kumar" : "e.g. Alex Carter"}
                />
              </Field>
            )}
            <Field label="Email" icon={Mail}>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="Password" icon={Lock}>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputCls}
              />
            </Field>
            {mode === "register" && (
              <Field label="Phone" icon={Phone}>
                <input
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 9XXXX XXXXX"
                  className={inputCls}
                />
              </Field>
            )}

            {mode === "register" && role === "provider" && (
              <div className="rounded-xl border bg-muted/30 p-3 space-y-3">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Service details
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Category)}
                    className="rounded-lg border bg-background px-3 py-2 text-sm"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.name}>{c.name}</option>
                    ))}
                  </select>
                  <input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City"
                    className="rounded-lg border bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={rate}
                    onChange={(e) => setRate(+e.target.value)}
                    placeholder="₹/hour"
                    className="rounded-lg border bg-background px-3 py-2 text-sm"
                  />
                  <input
                    type="number"
                    value={exp}
                    onChange={(e) => setExp(+e.target.value)}
                    placeholder="Years experience"
                    className="rounded-lg border bg-background px-3 py-2 text-sm"
                  />
                </div>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={2}
                  placeholder="Short bio shown to customers"
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm resize-none"
                />
              </div>
            )}

            <button className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-primary py-2.5 text-sm font-medium text-white shadow-glow">
              {mode === "login" ? "Sign in" : "Create account"} <ArrowRight className="size-4" />
            </button>
          </form>

          <div className="mt-5 text-center text-sm text-muted-foreground">
            {mode === "login" ? "New here?" : "Already have an account?"}{" "}
            <button
              onClick={() => setMode(mode === "login" ? "register" : "login")}
              className="text-primary font-medium hover:underline"
            >
              {mode === "login" ? "Create an account" : "Sign in"}
            </button>
          </div>
          <p className="mt-6 text-[11px] text-center text-muted-foreground">
            Demo — credentials are not validated. Pick a role and continue.
          </p>
        </div>
      </div>
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border bg-background pl-9 pr-3 py-2.5 text-sm outline-none focus:ring-2 ring-primary";

function Field({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium">{label}</label>
      <div className="relative">
        <Icon className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
        {children}
      </div>
    </div>
  );
}
