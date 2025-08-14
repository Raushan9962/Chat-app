// src/pages/SettingsPage.jsx
import { THEMES } from "../constants/themes.js";
import { useThemeStore } from "../store/useThemeStore"; 
import { Send } from "lucide-react";

const PREVIEW_MESSAGES = [
  { id: 1, content: "Hey! How's it going?", isSent: false },
  { id: 2, content: "I'm doing great! Just working on some new features.", isSent: true },
];

const SettingsPage = () => {
  const { theme, setTheme } = useThemeStore();

  return (
    <div className="h-screen container mx-auto px-4 pt-20 max-w-5xl">
      <div className="space-y-6">
        {/* Theme Selection */}
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold">Theme</h2>
          <p className="text-sm text-base-content/70">
            Choose a theme for your chat interface. Current: <span className="font-semibold text-primary">{theme}</span>
          </p>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
          {THEMES.map((themeName) => (
            <button
              key={themeName}
              onClick={() => setTheme(themeName)}
              className={`p-3 rounded-lg border-2 transition-all duration-200 hover:scale-105 cursor-pointer ${
                theme === themeName 
                  ? "border-primary bg-primary/20 text-primary font-bold shadow-lg transform scale-105" 
                  : "border-base-300 hover:border-primary/50 hover:bg-base-200"
              }`}
            >
              <div className="text-xs capitalize font-medium">{themeName}</div>
            </button>
          ))}
        </div>

        {/* Live Preview */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">Live Preview</h3>
          <div className="rounded-xl border border-base-300 overflow-hidden bg-base-100 shadow-lg">
            <div className="p-6 bg-base-200">
              <div className="max-w-lg mx-auto">
                {/* Mock Chat UI - DaisyUI classes automatically use theme colors */}
                <div className="bg-base-100 rounded-xl shadow-sm overflow-hidden">
                  {/* Chat Header */}
                  <div className="px-4 py-3 border-b border-base-300 bg-base-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-content font-bold text-lg">
                        J
                      </div>
                      <div>
                        <h3 className="font-semibold text-base text-base-content">John Doe</h3>
                        <p className="text-sm text-base-content/70 flex items-center gap-1">
                          <div className="w-2 h-2 bg-success rounded-full"></div>
                          Online
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Chat Messages */}
                  <div className="p-4 space-y-4 min-h-[250px] max-h-[250px] overflow-y-auto bg-base-100">
                    {PREVIEW_MESSAGES.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.isSent ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[80%] rounded-xl p-3 shadow-sm transition-all duration-200 ${
                            message.isSent
                              ? "bg-primary text-primary-content rounded-br-sm"
                              : "bg-base-200 text-base-content rounded-bl-sm"
                          }`}
                        >
                          <p className="text-sm leading-relaxed">{message.content}</p>
                          <p className="text-[11px] mt-2 opacity-70">
                            12:00 PM ✓✓
                          </p>
                        </div>
                      </div>
                    ))}
                    
                    {/* Typing indicator */}
                    <div className="flex justify-start">
                      <div className="bg-base-200 rounded-xl rounded-bl-sm p-3 shadow-sm">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-base-content/30 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-base-content/30 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2 h-2 bg-base-content/30 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Chat Input */}
                  <div className="p-4 border-t border-base-300 bg-base-100">
                    <div className="flex gap-3">
                      <input
                        type="text"
                        className="input input-bordered flex-1 text-sm h-12"
                        placeholder="Type a message..."
                        value="Check out this new theme! 🎨"
                        readOnly
                      />
                      <button className="btn btn-primary h-12 min-h-0 px-4 hover:scale-105 transition-transform">
                        <Send size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Theme Colors Info */}
        <div className="bg-base-100 p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold mb-3 text-base-content">Current Theme Colors</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-primary rounded-full shadow-sm"></div>
              <span className="text-sm text-base-content">Primary</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-secondary rounded-full shadow-sm"></div>
              <span className="text-sm text-base-content">Secondary</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-accent rounded-full shadow-sm"></div>
              <span className="text-sm text-base-content">Accent</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-neutral rounded-full shadow-sm"></div>
              <span className="text-sm text-base-content">Neutral</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;