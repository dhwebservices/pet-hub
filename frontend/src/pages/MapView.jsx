import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { api } from "../lib/api";

// Fix default marker
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" data-testid="map-page">
      <h1 className="font-display font-extrabold text-3xl text-[var(--gpr-primary)]">Recovery map</h1>
      <p className="text-[var(--gpr-muted)] mt-2">Approximate areas only — exact home addresses are never displayed.</p>
      <div className="mt-6 rounded-md overflow-hidden border border-[var(--gpr-border)]">
        <div style={{height:"560px"}}>
          <MapContainer center={center} zoom={6} style={{height:"100%",width:"100%"}}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap contributors'/>
            {markers.map(m => (
              <Marker key={`${m.type}-${m.id}`} position={[m.lat, m.lon]} icon={m.type==='lost'?lostIcon:foundIcon}>
                <Popup>
                  <div className="text-sm">
                    {m.photo && <img src={m.photo} alt="" style={{width:120,height:90,objectFit:"cover",borderRadius:6,marginBottom:6}}/>}
                    <div className="font-semibold">{m.title}</div>
                    <div style={{color:"#5F736A",fontSize:12}}>{m.breed}</div>
                    <div style={{fontSize:12}}>{m.location} · {m.date}</div>
                    <span style={{display:"inline-block",marginTop:6,padding:"2px 8px",borderRadius:9999,fontSize:11,fontWeight:600,background:m.type==='lost'?'#FDF2F0':'#F0F5F2',color:m.type==='lost'?'#C85A40':'#3B6954',border:`1px solid ${m.type==='lost'?'#FADCD5':'#D5E6DD'}`}}>{m.type.toUpperCase()}</span>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
      <div className="mt-4 flex gap-6 text-sm text-[var(--gpr-muted)]">
        <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#C85A40]"/> Lost</span>
        <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#3B6954]"/> Found</span>
      </div>
    </div>
  );
}
