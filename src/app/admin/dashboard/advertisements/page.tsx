"use client";
import { useEffect, useState } from "react";
import { toast } from "@/components/ui/Toast";

interface Ad { id: string; position: string; device_target: string; is_active: boolean; script_html: string | null; network?: { name: string } | null }
interface Network { id: string; name: string }

const POSITIONS = ["homepage_top", "homepage_middle", "homepage_footer", "below_player", "sidebar"];

export default function AdsAdmin() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [networks, setNetworks] = useState<Network[]>([]);
  const [form, setForm] = useState({ position: "homepage_top", network_id: "", device_target: "all", script_html: "", is_active: true });
  const [presetType, setPresetType] = useState("");
  const [presetKey, setPresetKey] = useState("");

  async function load() { const r = await fetch("/api/advertisements").then((r) => r.json()); setAds(r.ads || []); setNetworks(r.networks || []); }
  useEffect(() => { load(); }, []);

  const selectedNetwork = networks.find((n) => n.id === form.network_id);
  const networkName = selectedNetwork ? selectedNetwork.name : "";

  function generateScriptHTML(network: string, type: string, key: string): string {
    if (!key.trim()) return "";
    const cleanKey = key.trim();

    if (network === "Adsterra") {
      if (type === "popunder" || type === "social_bar") {
        return `<script type='text/javascript' src='//${cleanKey}'></script>`;
      }
      if (type === "banner_728x90") {
        return `<script type="text/javascript">\n\tatOptions = {\n\t\t'key' : '${cleanKey}',\n\t\t'format' : 'iframe',\n\t\t'height' : 90,\n\t\t'width' : 728,\n\t\t'params' : {}\n\t};\n</script>\n<script type="text/javascript" src="//www.highperformanceformat.com/${cleanKey}/invoke.js"></script>`;
      }
      if (type === "banner_300x250") {
        return `<script type="text/javascript">\n\tatOptions = {\n\t\t'key' : '${cleanKey}',\n\t\t'format' : 'iframe',\n\t\t'height' : 250,\n\t\t'width' : 300,\n\t\t'params' : {}\n\t};\n</script>\n<script type="text/javascript" src="//www.highperformanceformat.com/${cleanKey}/invoke.js"></script>`;
      }
    }

    if (network === "PropellerAds") {
      if (type === "popunder") {
        return `<script>(function(s,u,z,p){s.src=u,s.setAttribute('data-zone',p),p=z,s.id='propeller-popunder',z.onload=function(){},document.body.appendChild(s)})(document.createElement('script'),'https://grosoegr.com/sdk.js',${cleanKey},window)</script>`;
      }
      if (type === "in_page_push") {
        return `<script src="https://grosoegr.com/pfe/current/tag.min.js?z=${cleanKey}" data-zone="${cleanKey}" async></script>`;
      }
      if (type === "vignette") {
        return `<script>(function(d,z,s){s.src='https://grosoegr.com/tag.min.js?z='+z;s.dataset.zone=z;d.body.appendChild(s)})(document,${cleanKey},document.createElement('script'))</script>`;
      }
    }

    if (network === "Monetag") {
      if (type === "popunder") {
        return `<script>(function(s,u,z,p){s.src=u,s.setAttribute('data-zone',p),p=z,s.id='monetag-popunder',z.onload=function(){},document.body.appendChild(s)})(document.createElement('script'),'https://onclickalgo.com/sdk.js',${cleanKey},window)</script>`;
      }
      if (type === "in_page_push") {
        return `<script src="https://onclickalgo.com/pfe/current/tag.min.js?z=${cleanKey}" data-zone="${cleanKey}" async></script>`;
      }
      if (type === "vignette") {
        return `<script>(function(d,z,s){s.src='https://onclickalgo.com/tag.min.js?z='+z;s.dataset.zone=z;d.body.appendChild(s)})(document,${cleanKey},document.createElement('script'))</script>`;
      }
    }

    return "";
  }

  useEffect(() => {
    if (!networkName || !presetType) return;
    const generated = generateScriptHTML(networkName, presetType, presetKey);
    if (generated) {
      setForm((prev) => ({ ...prev, script_html: generated }));
    }
  }, [networkName, presetType, presetKey]);

  function handleNetworkChange(networkId: string) {
    const net = networks.find((n) => n.id === networkId);
    const name = net ? net.name : "";
    setForm((prev) => ({ ...prev, network_id: networkId }));
    if (name === "Adsterra") {
      setPresetType("banner_728x90");
      setPresetKey("");
    } else if (name === "PropellerAds" || name === "Monetag") {
      setPresetType("popunder");
      setPresetKey("");
    } else {
      setPresetType("");
      setPresetKey("");
    }
  }

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const r = await fetch("/api/advertisements", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (r.ok) { toast("Added", "success"); setForm({ ...form, script_html: "" }); setPresetKey(""); load(); } else toast("Failed", "error");
  }
  async function remove(id: string) { if (!confirm("Delete?")) return; await fetch(`/api/advertisements/${id}`, { method: "DELETE" }); load(); }
  async function toggle(id: string, v: boolean) { await fetch(`/api/advertisements/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ is_active: v }) }); load(); }

  const input = "w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm";
  return (
    <div className="p-8 space-y-6 max-w-5xl">
      <h1 className="text-3xl font-display font-bold">Advertisements</h1>
      <p className="text-text-muted text-sm">Paste raw HTML/JS from Adsterra, PropellerAds, Monetag or any custom script. They render at the chosen position.</p>

      <form onSubmit={add} className="bg-card border border-border rounded-xl p-6 grid md:grid-cols-2 gap-4">
        <label className="block"><span className="block text-xs uppercase text-text-dim mb-1.5">Position</span>
          <select className={input} value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })}>
            {POSITIONS.map((p) => <option key={p}>{p}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="block text-xs uppercase text-text-dim mb-1.5">Network</span>
          <select className={input} value={form.network_id} onChange={(e) => handleNetworkChange(e.target.value)}>
            <option value="">— none —</option>
            {networks.map((n) => <option key={n.id} value={n.id}>{n.name}</option>)}
          </select>
        </label>

        {["Adsterra", "PropellerAds", "Monetag"].includes(networkName) && (
          <div className="md:col-span-2 grid md:grid-cols-2 gap-4 border border-border bg-bg/50 p-4 rounded-xl">
            <h3 className="md:col-span-2 text-sm font-semibold text-primary">Preset Configuration Helper</h3>
            <label className="block"><span className="block text-xs uppercase text-text-dim mb-1.5">Preset Type</span>
              <select className={input} value={presetType} onChange={(e) => setPresetType(e.target.value)}>
                {networkName === "Adsterra" && (
                  <>
                    <option value="banner_728x90">Banner (728x90)</option>
                    <option value="banner_300x250">Banner (300x250)</option>
                    <option value="popunder">Popunder</option>
                    <option value="social_bar">Social Bar (Alert-like)</option>
                  </>
                )}
                {(networkName === "PropellerAds" || networkName === "Monetag") && (
                  <>
                    <option value="popunder">Popunder</option>
                    <option value="in_page_push">In-Page Push (Alert-like)</option>
                    <option value="vignette">Vignette Interstitial (Popup-like)</option>
                  </>
                )}
              </select>
            </label>
            <label className="block">
              <span className="block text-xs uppercase text-text-dim mb-1.5">
                {presetType === "popunder" || presetType === "social_bar" ? (
                  networkName === "Adsterra" ? "Script Path (e.g. pl1234.highcpm.js)" : "Zone ID"
                ) : "Zone ID / Key"}
              </span>
              <input
                type="text"
                className={input}
                value={presetKey}
                onChange={(e) => setPresetKey(e.target.value)}
                placeholder={
                  networkName === "Adsterra" && (presetType === "popunder" || presetType === "social_bar")
                    ? "pl123456.highratecpm.com/ab/cd/ef/abcdef.js"
                    : "e.g. 1234567"
                }
              />
            </label>
          </div>
        )}

        <label className="block md:col-span-2"><span className="block text-xs uppercase text-text-dim mb-1.5">Script HTML (Generates automatically from Helper above)</span>
          <textarea className={`${input} font-mono text-xs h-40`} value={form.script_html} onChange={(e) => setForm({ ...form, script_html: e.target.value })} placeholder="<script src='...'></script>" />
        </label>
        <label className="block"><span className="block text-xs uppercase text-text-dim mb-1.5">Device target</span>
          <select className={input} value={form.device_target} onChange={(e) => setForm({ ...form, device_target: e.target.value })}>
            <option>all</option><option>mobile</option><option>desktop</option>
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm self-end"><input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} /> Active</label>
        <button className="bg-primary hover:bg-primary-dark px-5 py-2 rounded-lg font-semibold md:col-span-2">Add advertisement</button>
      </form>

      <div className="bg-card border border-border rounded-xl divide-y divide-border">
        {ads.map((a) => (
          <div key={a.id} className="p-4 flex items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="font-medium">{a.position} <span className="text-text-dim text-xs ml-2">{a.device_target}</span></div>
              <div className="text-xs text-text-muted truncate">{a.network?.name || "—"} · {a.script_html?.slice(0, 80)}…</div>
            </div>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={a.is_active} onChange={(e) => toggle(a.id, e.target.checked)} /> active</label>
            <button onClick={() => remove(a.id)} className="text-error text-sm">Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
