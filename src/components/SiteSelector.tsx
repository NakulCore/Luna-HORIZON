import React, { useState } from 'react';
import { LandingSite, SiteCategory } from '../types/mission';
import { CANDIDATE_LANDING_SITES, createCustomLandingSite } from '../data/candidateSites';
import { Search, MapPin, Plus, Check, Shield, Flame, Droplets, Mountain, Compass, Sparkles } from 'lucide-react';

interface SiteSelectorProps {
  selectedSite: LandingSite;
  onSelectSite: (site: LandingSite) => void;
  customSites: LandingSite[];
  onAddCustomSite: (site: LandingSite) => void;
}

export const SiteSelector: React.FC<SiteSelectorProps> = ({
  selectedSite,
  onSelectSite,
  customSites,
  onAddCustomSite
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<SiteCategory | 'all'>('all');
  const [isCreatingCustom, setIsCreatingCustom] = useState(false);

  // Custom site form state
  const [customName, setCustomName] = useState('');
  const [customLat, setCustomLat] = useState(-89.5);
  const [customLon, setCustomLon] = useState(0.0);
  const [customElev, setCustomElev] = useState(1.5);

  const allSites = [...CANDIDATE_LANDING_SITES, ...customSites];

  const filteredSites = allSites.filter((site) => {
    const matchesSearch =
      site.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      site.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
      site.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'all' || site.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleCreateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const newSite = createCustomLandingSite(
      customName || `Custom Site (${customLat.toFixed(2)}°, ${customLon.toFixed(2)}°)`,
      customLat,
      customLon,
      customElev
    );
    onAddCustomSite(newSite);
    onSelectSite(newSite);
    setIsCreatingCustom(false);
    setCustomName('');
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-xs font-semibold tracking-wider uppercase text-slate-200 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-cyan-400" />
            <span>CANDIDATE LANDING SITE DIRECTORY</span>
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Evaluate Artemis III zones, CLPS commercial targets, and lunar landmarks
          </p>
        </div>

        <button
          onClick={() => setIsCreatingCustom(!isCreatingCustom)}
          className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 px-3 py-1.5 rounded-lg transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Custom Coordinates</span>
        </button>
      </div>

      {/* Custom Site Modal Form */}
      {isCreatingCustom && (
        <form
          onSubmit={handleCreateCustom}
          className="my-3 p-3.5 bg-slate-950 border border-cyan-500/30 rounded-xl space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-cyan-300 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Configure Custom Selenographic Target
            </span>
            <button
              type="button"
              onClick={() => setIsCreatingCustom(false)}
              className="text-xs text-slate-400 hover:text-slate-200"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Target Name</label>
              <input
                type="text"
                placeholder="e.g. Shackleton Base 1"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 px-2.5 py-1.5 rounded text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Latitude (° [-90 to +90])</label>
              <input
                type="number"
                step="0.01"
                min="-90"
                max="90"
                value={customLat}
                onChange={(e) => setCustomLat(parseFloat(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 px-2.5 py-1.5 rounded font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Longitude (° [-180 to +180])</label>
              <input
                type="number"
                step="0.01"
                min="-180"
                max="180"
                value={customLon}
                onChange={(e) => setCustomLon(parseFloat(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 px-2.5 py-1.5 rounded font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Elevation (km)</label>
              <input
                type="number"
                step="0.1"
                min="-9"
                max="10"
                value={customElev}
                onChange={(e) => setCustomElev(parseFloat(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 px-2.5 py-1.5 rounded font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs px-4 py-1.5 rounded-lg transition-all"
            >
              Add Target Site & Simulate
            </button>
          </div>
        </form>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 my-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search craters, ridges, massifs, or coordinates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-sans"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Sites' },
            { id: 'artemis', label: 'Artemis III' },
            { id: 'clps', label: 'CLPS Landers' },
            { id: 'historical', label: 'Historical' },
            { id: 'custom', label: 'Custom' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id as any)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-transparent'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Site Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-[360px] overflow-y-auto pr-1">
        {filteredSites.map((site) => {
          const isSelected = selectedSite.id === site.id;

          return (
            <div
              key={site.id}
              onClick={() => onSelectSite(site)}
              className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between relative overflow-hidden group ${
                isSelected
                  ? 'bg-cyan-950/30 border-cyan-500 shadow-md shadow-cyan-500/10'
                  : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/60'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <span className="font-bold text-xs text-slate-100 group-hover:text-cyan-300 transition-colors">
                    {site.name}
                  </span>
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.5 rounded border uppercase shrink-0 ${
                      site.priorityTier === 'Primary'
                        ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 font-bold'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {site.priorityTier}
                  </span>
                </div>

                <div className="text-[11px] text-slate-400 mb-2 truncate">
                  {site.region}
                </div>

                {/* Metrics Badges */}
                <div className="grid grid-cols-3 gap-1.5 py-1.5 border-y border-slate-800/60 text-[10px] font-mono">
                  <div title="Coordinates">
                    <span className="text-slate-500 block">Coord</span>
                    <span className="text-slate-200">
                      {site.latitude.toFixed(1)}°, {site.longitude.toFixed(1)}°
                    </span>
                  </div>
                  <div title="Annual Illumination Fraction">
                    <span className="text-slate-500 block">Solar Avg</span>
                    <span className="text-amber-300 font-semibold">{site.averageIlluminationPct}%</span>
                  </div>
                  <div title="Proximity to Permanently Shadowed Water Ice Trap">
                    <span className="text-slate-500 block">PSR Ice</span>
                    <span className="text-cyan-300 font-semibold">{site.distanceToPsrKm.toFixed(1)} km</span>
                  </div>
                </div>
              </div>

              <div className="mt-2 flex items-center justify-between text-[11px]">
                <span className="text-slate-400 font-mono text-[10px]">
                  Slope: <strong className="text-slate-300">{site.slopeDegrees}°</strong> | Elev: <strong className="text-slate-300">{site.elevationKm > 0 ? `+${site.elevationKm.toFixed(1)}` : site.elevationKm.toFixed(1)} km</strong>
                </span>

                {isSelected && (
                  <span className="flex items-center gap-1 text-cyan-400 font-bold text-[10px]">
                    <Check className="w-3 h-3" /> ACTIVE
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
