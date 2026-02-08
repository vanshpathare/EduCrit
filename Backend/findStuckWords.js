const fs = require("fs");
const readline = require("readline");

// Config
const FILE_PATH = "College.csv";

// 🧠 "Right-Side" Words: Words that usually appear AFTER a comma
// If these words appear without a space before them, it's a crash!
const TRIGGER_WORDS = [
  "SCIENCE",
  "COMMERCE",
  "ARTS",
  "MANAGEMENT",
  "TECHNOLOGY",
  "ENGINEERING", // Streams
  "MAHARASHTRA",
  "GUJARAT",
  "KARNATAKA",
  "DELHI",
  "TAMILNADU",
  "UTTAR", // States
  "MUMBAI",
  "PUNE",
  "THANE",
  "NAGPUR",
  "KOLKATA",
  "CHENNAI",
  "BANGALORE", // Major Cities
  "DIST",
  "ROAD",
  "MARG",
  "SOCIETY",
  "TRUST",
  "CAMPUS", // Address markers
];

const fileStream = fs.createReadStream(FILE_PATH);
const rl = readline.createInterface({
  input: fileStream,
  crlfDelay: Infinity,
});

console.log("🔎 Hunting for 'Invisible Commas'...");
console.log("------------------------------------------------");

let rowNumber = 0;
let issuesFound = 0;

rl.on("line", (line) => {
  rowNumber++;
  if (!line) return;

  const cleanLine = line.toUpperCase().trim();
  let detected = false;

  // 🛡️ THE LOGIC:
  // Iterate through every trigger word.
  // If we find the word, check the character *immediately before* it.
  // If that char is a LETTER (not a space, not a dash), it's stuck!

  for (const word of TRIGGER_WORDS) {
    const index = cleanLine.indexOf(word);

    // If word exists, AND it's not at the very start of the line
    if (index > 0) {
      const charBefore = cleanLine.charAt(index - 1);

      // Check if the character before is a LETTER (A-Z)
      // This means "COLLEGEMUMBAI" (E is before M) -> CAUGHT!
      if (/[A-Z]/.test(charBefore)) {
        console.log(`🚩 Row ${rowNumber}: [Stuck at "${word}"]`);
        console.log(`   📝 ${cleanLine}`);
        // Highlight the split suggestion
        const suggestion =
          cleanLine.slice(0, index) + " , " + cleanLine.slice(index);
        console.log(`   💡 Fix: ${suggestion}\n`);

        detected = true;
        issuesFound++;
        break; // Stop checking other words for this line
      }
    }
  }
});

rl.on("close", () => {
  console.log("------------------------------------------------");
  console.log(`✅ Scan Complete. Found ${issuesFound} suspicious rows.`);
});
