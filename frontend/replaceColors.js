const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    if (fs.statSync(dirFile).isDirectory()) {
      if (!dirFile.includes('node_modules')) {
        filelist = walkSync(dirFile, filelist);
      }
    } else if (dirFile.endsWith('.jsx')) {
      filelist.push(dirFile);
    }
  });
  return filelist;
};

const files = walkSync('c:/Users/PAKISTAN/Desktop/FYP/frontend/src');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let newContent = content
    .replace(/bg-\[#F4F7FB\]/g, 'bg-[#FAF5FF]')
    .replace(/#00B4D8/g, '#8B5CF6')
    .replace(/#00A1C1/g, '#7C3AED')
    .replace(/rgba\(0,180,216,/g, 'rgba(139,92,246,')
    
    .replace(/shadow-\[0px_10px_30px_rgba\(0,0,0,0.06\)\] border border-gray-50/g, 'shadow-[0px_8px_30px_rgba(139,92,246,0.12)] border border-[#EDE9FE]')
    .replace(/shadow-\[0px_8px_24px_rgba\(0,0,0,0.04\)\] border-\[1.5px\] border-\[#E5E7EB\]/g, 'shadow-[0px_8px_24px_rgba(139,92,246,0.08)] border-[1.5px] border-[#EDE9FE]')
    
    .replace(
      /className='w-\[100%\] h-\[50px\] bg-\[#8B5CF6\] text-white font-bold text-\[16px\] rounded-xl mt-\[10px\] shadow-\[0px_4px_12px_rgba\(139,92,246,0.3\)\] hover:bg-\[#7C3AED\] disabled:opacity-60 disabled:cursor-not-allowed'/g, 
      "className='w-[100%] h-[50px] bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] text-white font-extrabold text-[16px] rounded-xl mt-[10px] shadow-[0px_6px_20px_rgba(139,92,246,0.3)] border-b-[4px] border-[#5B21B6] active:border-b-[0px] active:translate-y-[4px] transition-all disabled:opacity-60 disabled:cursor-not-allowed'"
    )
    
    .replace(
      /bg-\[#8B5CF6\] right-\[6px\] top-\[6px\] shadow-\[0_2px_8px_rgba\(139,92,246,0.3\)\] hover:bg-\[#7C3AED\]/g,
      "bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] right-[6px] top-[4px] shadow-[0_4px_10px_rgba(139,92,246,0.3)] border-b-[3px] border-[#5B21B6] active:border-b-[0px] active:translate-y-[3px]"
    );

  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    console.log('Updated:', file);
  }
});
