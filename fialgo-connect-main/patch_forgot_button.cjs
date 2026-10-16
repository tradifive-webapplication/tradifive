const fs = require('fs');

const path = 'src/pages/ForgotPassword.tsx';
let code = fs.readFileSync(path, 'utf8');

// Replace the first PushableButton (Send instructions)
const targetButton1 = `              <PushableButton 
                type="submit" 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? "Processing..." : (
                  <span className="flex items-center justify-center font-bold uppercase tracking-widest text-[11px] py-0.5">
                    Send instructions
                    <IconlyArrowRight set="curved" primaryColor="currentColor" size={18} stroke="bold" strokeWidth={2} className="ml-2" />
                  </span>
                )}
              </PushableButton>`;

const replacementButton1 = `              <button
                type="submit"
                disabled={isLoading}
                className="w-full text-white font-bold uppercase tracking-wide text-xs lg:text-sm py-3.5 rounded-xl flex items-center justify-center disabled:opacity-50"
                style={{
                  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 50%, #3b82f6 100%)',
                  boxShadow: '0 4px 14px rgba(37,99,235,0.35), 0 1px 3px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.2)',
                  transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
                  transformStyle: 'preserve-3d',
                }}
                onMouseEnter={e => { if (!isLoading) { e.currentTarget.style.transform = 'translateY(-4px) rotateX(6deg) scale(1.02)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(37,99,235,0.4), 0 4px 10px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.25)'; } }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0) rotateX(0deg) scale(1)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(37,99,235,0.35), 0 1px 3px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.2)'; }}
                onMouseDown={e => { e.currentTarget.style.transform = 'translateY(-1px) rotateX(2deg) scale(0.98)'; }}
                onMouseUp={e => { e.currentTarget.style.transform = 'translateY(-4px) rotateX(6deg) scale(1.02)'; }}
              >
                {isLoading ? "Processing..." : (
                  <span className="flex items-center justify-center font-bold uppercase tracking-widest text-[11px] py-0.5">
                    Send instructions
                    <IconlyArrowRight set="curved" primaryColor="currentColor" size={18} stroke="bold" strokeWidth={2} className="ml-2" />
                  </span>
                )}
              </button>`;

code = code.replace(targetButton1, replacementButton1);

// Replace the second PushableButton (Try another email)
const targetButton2 = `              <PushableButton onClick={() => setIsSent(false)} className="w-full">
                <span className="font-bold uppercase tracking-widest text-[11px] py-0.5">Try another email</span>
              </PushableButton>`;

const replacementButton2 = `              <button 
                onClick={() => setIsSent(false)} 
                className="w-full text-white font-bold uppercase tracking-wide text-xs lg:text-sm py-3.5 rounded-xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 50%, #3b82f6 100%)',
                  boxShadow: '0 4px 14px rgba(37,99,235,0.35), 0 1px 3px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.2)',
                  transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
                  transformStyle: 'preserve-3d',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px) rotateX(6deg) scale(1.02)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(37,99,235,0.4), 0 4px 10px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.25)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0) rotateX(0deg) scale(1)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(37,99,235,0.35), 0 1px 3px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.2)'; }}
                onMouseDown={e => { e.currentTarget.style.transform = 'translateY(-1px) rotateX(2deg) scale(0.98)'; }}
                onMouseUp={e => { e.currentTarget.style.transform = 'translateY(-4px) rotateX(6deg) scale(1.02)'; }}
              >
                <span className="font-bold uppercase tracking-widest text-[11px] py-0.5">Try another email</span>
              </button>`;

code = code.replace(targetButton2, replacementButton2);

fs.writeFileSync(path, code);
console.log('Successfully patched ForgotPassword.tsx button to match Login.tsx styled blue 3D hover button!');
