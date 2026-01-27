import React from 'react';
import { WatermarkSettings, Position, DEFAULT_SETTINGS, WatermarkType } from '../types';
import { IconType, IconImage, IconRefresh } from './Icons';

interface SidebarProps {
  settings: WatermarkSettings;
  updateSettings: (partial: Partial<WatermarkSettings>) => void;
  resetSettings: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ settings, updateSettings, resetSettings }) => {
  
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      updateSettings({ logoFile: file, logoUrl: url });
    }
  };

  const PositionGrid = () => (
    <div className="grid grid-cols-3 gap-2 w-32 mx-auto mb-4">
      {['top-left', 'top-center', 'top-right', 
        'center-left', 'center', 'center-right', 
        'bottom-left', 'bottom-center', 'bottom-right'].map((pos) => (
        <button
          key={pos}
          title={pos}
          onClick={() => updateSettings({ position: pos as Position })}
          className={`w-8 h-8 border rounded-sm flex items-center justify-center transition-colors
            ${settings.position === pos 
              ? 'bg-blue-600 border-blue-500 text-white' 
              : 'bg-gray-800 border-gray-600 hover:bg-gray-700'}`}
        >
          <div className="w-1.5 h-1.5 bg-current rounded-full" />
        </button>
      ))}
    </div>
  );

  return (
    <aside className="w-80 bg-gray-900 border-r border-gray-700 flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-gray-700 flex justify-between items-center">
        <h2 className="text-lg font-bold text-white">Settings</h2>
        <button 
          onClick={resetSettings} 
          title="Reset Defaults"
          className="text-gray-400 hover:text-white transition-colors"
        >
          <IconRefresh size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        {/* Type Selector */}
        <div className="flex bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => updateSettings({ type: 'text' })}
            className={`flex-1 flex items-center justify-center py-2 text-sm font-medium rounded-md transition-all
              ${settings.type === 'text' ? 'bg-gray-700 text-white shadow' : 'text-gray-400 hover:text-white'}`}
          >
            <IconType size={16} className="mr-2" /> Text
          </button>
          <button
            onClick={() => updateSettings({ type: 'logo' })}
            className={`flex-1 flex items-center justify-center py-2 text-sm font-medium rounded-md transition-all
              ${settings.type === 'logo' ? 'bg-gray-700 text-white shadow' : 'text-gray-400 hover:text-white'}`}
          >
            <IconImage size={16} className="mr-2" /> Logo
          </button>
        </div>

        {/* Content Settings */}
        <div className="space-y-4">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Content</h3>
          
          {settings.type === 'text' ? (
            <>
              <div>
                <label className="block text-sm mb-1 text-gray-300">Text</label>
                <input
                  type="text"
                  value={settings.text}
                  onChange={(e) => updateSettings({ text: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                   <label className="block text-xs mb-1 text-gray-400">Color</label>
                   <input 
                    type="color" 
                    value={settings.color}
                    onChange={(e) => updateSettings({ color: e.target.value })}
                    className="w-full h-8 bg-gray-800 rounded cursor-pointer"
                   />
                </div>
                <div>
                  <label className="block text-xs mb-1 text-gray-400">Font Size ({settings.fontSize}%)</label>
                  <div className="text-[10px] text-gray-500 mb-1">Scale based on image height</div>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={settings.fontSize}
                    onChange={(e) => updateSettings({ fontSize: Number(e.target.value) })}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  id="stroke"
                  checked={settings.stroke}
                  onChange={(e) => updateSettings({ stroke: e.target.checked })}
                  className="rounded bg-gray-700 border-gray-600 text-blue-600"
                />
                <label htmlFor="stroke" className="text-sm text-gray-300">Add Outline/Stroke</label>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm mb-1 text-gray-300">Upload Logo</label>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/svg+xml"
                  onChange={handleLogoUpload}
                  className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-gray-800 file:text-blue-400 hover:file:bg-gray-700"
                />
              </div>
              <div>
                <label className="block text-xs mb-1 text-gray-400">Scale ({settings.logoScale}%)</label>
                <input
                  type="range"
                  min="5"
                  max="80"
                  value={settings.logoScale}
                  onChange={(e) => updateSettings({ logoScale: Number(e.target.value) })}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              <div className="flex items-center space-x-2 mt-2">
                <input 
                  type="checkbox" 
                  id="logoShadow"
                  checked={settings.logoShadow}
                  onChange={(e) => updateSettings({ logoShadow: e.target.checked })}
                  className="rounded bg-gray-700 border-gray-600 text-blue-600"
                />
                <label htmlFor="logoShadow" className="text-sm text-gray-300">Add Shadow Border</label>
              </div>

              {settings.logoShadow && (
                <div className="mt-2">
                   <label className="block text-xs mb-1 text-gray-400">Shadow Color</label>
                   <input 
                    type="color" 
                    value={settings.logoShadowColor}
                    onChange={(e) => updateSettings({ logoShadowColor: e.target.value })}
                    className="w-full h-8 bg-gray-800 rounded cursor-pointer"
                   />
                </div>
              )}
            </>
          )}
        </div>

        {/* Appearance */}
        <div className="space-y-4">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Appearance</h3>
          
          <div>
            <label className="block text-xs mb-1 text-gray-400">Opacity ({settings.opacity}%)</label>
            <input
              type="range"
              min="1"
              max="100"
              value={settings.opacity}
              onChange={(e) => updateSettings({ opacity: Number(e.target.value) })}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs mb-1 text-gray-400">Rotation ({settings.rotation}°)</label>
            <input
              type="range"
              min="-180"
              max="180"
              value={settings.rotation}
              onChange={(e) => updateSettings({ rotation: Number(e.target.value) })}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>

        {/* Placement */}
        <div className="space-y-4">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Placement</h3>
          
          <div className="flex items-center space-x-2 mb-4">
            <input 
              type="checkbox" 
              id="tiled"
              checked={settings.tiled}
              onChange={(e) => updateSettings({ tiled: e.target.checked })}
              className="rounded bg-gray-700 border-gray-600 text-blue-600"
            />
            <label htmlFor="tiled" className="text-sm text-gray-300">Tile Pattern</label>
          </div>

          {settings.tiled ? (
            <div>
              <label className="block text-xs mb-1 text-gray-400">Spacing ({settings.tileSpacing}%)</label>
               <input
                type="range"
                min="5"
                max="50"
                value={settings.tileSpacing}
                onChange={(e) => updateSettings({ tileSpacing: Number(e.target.value) })}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          ) : (
            <>
              <PositionGrid />
              <div>
                <label className="block text-xs mb-1 text-gray-400">Margin ({settings.margin}%)</label>
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={settings.margin}
                  onChange={(e) => updateSettings({ margin: Number(e.target.value) })}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </>
          )}
        </div>

        {/* Export */}
        <div className="space-y-4 pb-12">
           <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Export</h3>
           <div className="grid grid-cols-2 gap-2">
             <select 
              value={settings.format}
              onChange={(e) => updateSettings({ format: e.target.value as any })}
              className="bg-gray-800 border border-gray-700 text-sm rounded p-2 focus:outline-none"
             >
               <option value="image/jpeg">JPG</option>
               <option value="image/png">PNG</option>
               <option value="image/webp">WebP</option>
             </select>
             
             {settings.format !== 'image/png' && (
               <select 
                value={settings.quality}
                onChange={(e) => updateSettings({ quality: Number(e.target.value) })}
                className="bg-gray-800 border border-gray-700 text-sm rounded p-2 focus:outline-none"
               >
                 <option value="1.0">100% Quality</option>
                 <option value="0.92">92% Quality</option>
                 <option value="0.8">80% Quality</option>
                 <option value="0.6">60% Quality</option>
               </select>
             )}
           </div>
           <p className="text-xs text-gray-500 italic">
             Note: EXIF metadata is stripped during client-side processing for privacy and performance.
           </p>
        </div>

      </div>
    </aside>
  );
};

export default Sidebar;