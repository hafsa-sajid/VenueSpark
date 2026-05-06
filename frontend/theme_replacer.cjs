const fs = require('fs');

const filesToUpdate = [
  'c:/Users/PAKISTAN/Desktop/FYP/frontend/src/pages/ViewCard.jsx',
  'c:/Users/PAKISTAN/Desktop/FYP/frontend/src/pages/Checkout.jsx',
  'c:/Users/PAKISTAN/Desktop/FYP/frontend/src/pages/Booked.jsx',
  'c:/Users/PAKISTAN/Desktop/FYP/frontend/src/pages/MyBooking.jsx',
  'c:/Users/PAKISTAN/Desktop/FYP/frontend/src/pages/MyListing.jsx',
  'c:/Users/PAKISTAN/Desktop/FYP/frontend/src/pages/Receipt.jsx'
];

filesToUpdate.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');

  // Change primary color
  content = content.replace(/#00B4D8/g, '#8B5CF6');
  
  // Hover effects removal
  content = content.replace(/hover:scale-110/g, '');
  content = content.replace(/hover:scale-\[1.03\]/g, '');
  content = content.replace(/hover:scale-105/g, '');
  content = content.replace(/active:scale-95/g, '');
  
  // Specific Backgrounds
  content = content.replace(/bg-\[#f8fafc\]/g, 'bg-[#FAF5FF]');
  content = content.replace(/bg-blue-50/g, 'bg-violet-50');

  // ViewCard primary button upgrade to 3D Violet
  const viewCardBtnOld = "bg-[#8B5CF6] text-white rounded-[24px] font-black text-xl transition-all shadow-lg shadow-[#8B5CF6]/30";
  const viewCardBtnNew = "bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] text-white rounded-[24px] font-black text-xl border-b-[4px] border-[#5B21B6] active:border-b-[0px] active:translate-y-[4px] shadow-[0px_6px_20px_rgba(139,92,246,0.3)] transition-all";
  content = content.replace(viewCardBtnOld, viewCardBtnNew);

  // MyListing and Receipt typical button upgrade
  content = content.replace(
      /bg-\[#8B5CF6\] text-\[white\](.*?)rounded-lg/g, 
      "bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] text-[white] $1 rounded-lg border-b-[4px] border-[#5B21B6] active:border-b-[0px] active:translate-y-[4px] shadow-sm transition-all"
  );
  
  // Also change black buttons to have deep violet 3D or deep slate 3D
  content = content.replace(
      /bg-slate-900 text-white(.*?)rounded-\[28px\]/g,
      "bg-slate-900 text-white $1 rounded-[28px] border-b-[4px] border-slate-700 active:border-b-[0px] active:translate-y-[4px] transition-all"
  );
  content = content.replace(
      /bg-slate-900 text-white(.*?)rounded-\[24px\]/g,
      "bg-slate-900 text-white $1 rounded-[24px] border-b-[4px] border-slate-700 active:border-b-[0px] active:translate-y-[4px] transition-all"
  );
  content = content.replace(
      /bg-\[black\] text-\[white\](.*?)rounded-lg/g,
      "bg-[#111827] text-white $1 rounded-lg border-b-[4px] border-black active:border-b-[0px] active:translate-y-[4px] shadow-sm transition-all"
  );

  fs.writeFileSync(file, content, 'utf8');
  console.log('Processed:', file);
});
