"use client";
import { useEffect, useState } from "react";
import { toast } from "@/components/ui/Toast";

interface Ad {
  id: string;
  position: string;
  device_target: string;
  is_active: boolean;
  script_html: string | null;
  network_id?: string | null;
  network?: { name: string } | null;
}

interface Network {
  id: string;
  name: string;
}

const POSITIONS = [
  "global_header",
  "global_body",
  "homepage_top",
  "homepage_middle",
  "homepage_footer",
  "below_player",
  "sidebar"
];

export default function AdsAdmin() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [networks, setNetworks] = useState<Network[]>([]);
  const [form, setForm] = useState({
    position: "global_header",
    network_id: "",
    device_target: "all",
    script_html: "",
    is_active: true
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [presetType, setPresetType] = useState("");
  const [presetKey, setPresetKey] = useState("");

  async function load() {
    const r = await fetch("/api/advertisements").then((r) => r.json());
    setAds(r.ads || []);
    setNetworks(r.networks || []);
  }

  useEffect(() => {
    load();
  }, []);

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.position) return toast("Position is required", "error");

    if (editingId) {
      const r = await fetch(`/api/advertisements/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if (r.ok) {
        toast("Updated successfully", "success");
        cancelEdit();
        load();
      } else {
        toast("Failed to update", "error");
      }
    } else {
      const r = await fetch("/api/advertisements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if (r.ok) {
        toast("Added successfully", "success");
        setForm({
          position: "global_header",
          network_id: "",
          device_target: "all",
          script_html: "",
          is_active: true
        });
        setPresetKey("");
        load();
      } else {
        toast("Failed to add", "error");
      }
    }
  }

  function startEdit(ad: Ad) {
    setEditingId(ad.id);
    setForm({
      position: ad.position,
      network_id: ad.network_id || "",
      device_target: ad.device_target,
      script_html: ad.script_html || "",
      is_active: ad.is_active
    });
    setPresetKey("");
    setPresetType("");
  }

  function cancelEdit() {
    setEditingId(null);
    setForm({
      position: "global_header",
      network_id: "",
      device_target: "all",
      script_html: "",
      is_active: true
    });
    setPresetKey("");
    setPresetType("");
  }

  async function remove(id: string) {
    if (!confirm("Delete?")) return;
    await fetch(`/api/advertisements/${id}`, { method: "DELETE" });
    load();
  }

  async function toggle(id: string, v: boolean) {
    await fetch(`/api/advertisements/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: v })
    });
    load();
  }

  const input = "w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm";
  return (
    <div className="p-8 space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">Advertisements</h1>
          <p className="text-text-muted text-sm mt-1">
            Configure custom scripts or ad networks. Popunder, Social Bar, and overlay units can be placed globally.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 grid md:grid-cols-2 gap-4">
        <h2 className="md:col-span-2 text-lg font-semibold text-primary">
          {editingId ? "✏️ Edit Advertisement Unit" : "➕ Add New Advertisement Unit"}
        </h2>

        <label className="block">
          <span className="block text-xs uppercase text-text-dim mb-1.5">Position / Target Slot</span>
          <select
            className={input}
            value={form.position}
            onChange={(e) => setForm({ ...form, position: e.target.value })}
          >
            {POSITIONS.map((p) => (
              <option key={p} value={p}>
                {p.startsWith("global_") ? `🌍 ${p} (Overlay/Popunder)` : `📺 ${p} (Layout Banner)`}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="block text-xs uppercase text-text-dim mb-1.5">Network Helper</span>
          <select className={input} value={form.network_id} onChange={(e) => handleNetworkChange(e.target.value)}>
            <option value="">— custom script / none —</option>
            {networks.map((n) => (
              <option key={n.id} value={n.id}>
                {n.name}
              </option>
            ))}
          </select>
        </label>

        {["Adsterra", "PropellerAds", "Monetag"].includes(networkName) && (
          <div className="md:col-span-2 grid md:grid-cols-2 gap-4 border border-border bg-bg/50 p-4 rounded-xl">
            <h3 className="md:col-span-2 text-sm font-semibold text-primary">Preset Auto-Generator Helper</h3>
            <label className="block">
              <span className="block text-xs uppercase text-text-dim mb-1.5">Preset Type</span>
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
                  networkName === "Adsterra" ? "Script Path (e.g. pl12345.js)" : "Zone ID"
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

        <label className="block md:col-span-2">
          <span className="block text-xs uppercase text-text-dim mb-1.5">Script HTML / Ad Script Code</span>
          <textarea
            className={`${input} font-mono text-xs h-40`}
            value={form.script_html}
            onChange={(e) => setForm({ ...form, script_html: e.target.value })}
            placeholder="Paste raw script HTML tags here, e.g. <script src='...'></script>"
          />
        </label>
        <label className="block">
          <span className="block text-xs uppercase text-text-dim mb-1.5">Device Target</span>
          <select
            className={input}
            value={form.device_target}
            onChange={(e) => setForm({ ...form, device_target: e.target.value })}
          >
            <option value="all">all devices</option>
            <option value="mobile">mobile only</option>
            <option value="desktop">desktop only</option>
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm self-end">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
          />{" "}
          Active
        </label>

        <div className="md:col-span-2 flex gap-3 mt-2">
          <button type="submit" className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-lg font-semibold flex-1">
            {editingId ? "Update Advertisement" : "Add Advertisement"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={cancelEdit}
              className="bg-card border border-border hover:bg-card-hover px-6 py-2 rounded-lg font-semibold"
            >
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      <div className="bg-card border border-border rounded-xl divide-y divide-border">
        <div className="p-4 bg-card-hover/30 font-semibold text-sm">Configured Ad Units</div>
        {ads.length === 0 ? (
          <div className="p-8 text-center text-text-dim text-sm">No advertisements added yet.</div>
        ) : (
          ads.map((a) => (
            <div key={a.id} className="p-4 flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="font-medium flex items-center gap-2">
                  <span>{a.position.startsWith("global_") ? "🌍" : "📺"} {a.position}</span>
                  <span className="text-[10px] bg-border text-text px-2 py-0.5 rounded uppercase tracking-wider">
                    {a.device_target}
                  </span>
                </div>
                <div className="text-xs text-text-muted mt-1 truncate">
                  {a.network?.name || "Custom Code"} · {a.script_html?.slice(0, 80)}…
                </div>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-1.5 text-sm">
                  <input
                    type="checkbox"
                    checked={a.is_active}
                    onChange={(e) => toggle(a.id, e.target.checked)}
                  />
                  active
                </label>
                <button onClick={() => startEdit(a)} className="text-primary text-sm hover:underline">
                  Edit
                </button>
                <button onClick={() => remove(a.id)} className="text-error text-sm hover:underline">
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
