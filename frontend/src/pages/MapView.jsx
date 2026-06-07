import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { api } from "../lib/api";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});
const lostIcon = new L.DivIcon({ className:"", html:`<div style="background:#C85A40;border:2px solid white;border-radius:50%;width:18px;height:18px;box-shadow:0 0 0 2px #C85A40"></div>` });
const foundIcon = new L.DivIcon({ className:"", html:`<div style="background:#3B6954;border:2px solid white;border-radius:50%;width:18px;height:18px;box-shadow:0 0 0 2px #3B6954"></div>` });

export default function MapView() {
  const [markers, setMarkers] = useState([]);
  useEffect(()=>{ api.get("/map/markers").then(r=>setMarkers(r.data)); }, []);
  const center = markers[0] ? [markers[0].lat, markers[0].lon] : [54.5, -3];
  return (
    <div data-testid="map-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-24">
      <header className="grid md:grid-cols-12 gap-x-14 items-end mb-10">
        <div className="md:col-span-8">
          <div className="font-mono text-[11px] uppercase tracking-[0.25em] text-[var(--gpr-muted)] mb-6">The Recovery Map · Open Street Map</div>
          <h1 className="font-display font-extrabold text-5xl md:text-7xl text-[var(--gpr-primary)] leading-[0.98]">Where the network is <em className="accent text-[var(--gpr-alert)]">looking</em>.</h1>
          <p className="font-serif italic text-[var(--gpr-muted)] text-lg mt-7 max-w-xl leading-[1.6]">Approximate areas only — exact home addresses are never displayed.</p>
        </div>
        <div className="md:col-span-3 md:col-start-10 mt-6 md:mt-0 md:text-right">
          <div className="inline-flex flex-col gap-2 text-sm text-[var(--gpr-muted)]">
            <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#C85A40]"/> Lost</span>
            <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#3B6954]"/> Found</span>
          </div>
        </div>
      </header>
      <div className="overflow-hidden border-t border-b border-[var(--gpr-border)]" style={{height:"640px"}}>
        <MapContainer center={center} zoom={6} style={{height:"100%",width:"100%"}}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap'/>
          {markers.map(m => (
            <Marker key={`${m.type}-${m.id}`} position={[m.lat, m.lon]} icon={m.type==='lost'?lostIcon:foundIcon}>
              <Popup>
                <div style={{fontFamily:"'IBM Plex Sans',sans-serif"}}>
                  {m.photo && <img src={m.photo} alt="" style={{width:140,height:100,objectFit:"cover",marginBottom:8}}/>}
                  <div style={{fontWeight:700,color:"#1E3F32"}}>{m.title}</div>
                  <div style={{fontStyle:"italic",color:"#6B7570",fontSize:13}}>{m.breed}</div>
                  <div style={{fontSize:12,marginTop:6}}>{m.location} · {m.date}</div>
                  <span style={{display:"inline-block",marginTop:8,padding:"2px 8px",borderRadius:2,fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",background:m.type==='lost'?'#FDF2F0':'#F0F5F2',color:m.type==='lost'?'#C85A40':'#3B6954',border:`1px solid ${m.type==='lost'?'#FADCD5':'#D5E6DD'}`}}>{m.type}</span>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
