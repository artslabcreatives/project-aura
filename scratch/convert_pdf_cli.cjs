const { PDFDocument } = require('pdf-lib');
const fs = require('fs');

async function run() {
    try {
        const args = process.argv.slice(2);
        if (args.length < 2) {
            console.error("Usage: node convert_pdf_cli.cjs <input_path> <output_path>");
            process.exit(1);
        }
        
        const inputPath = args[0];
        const outputPath = args[1];
        
        if (!fs.existsSync(inputPath)) {
            console.error(`Input file does not exist: ${inputPath}`);
            process.exit(1);
        }
        
        const pdfBytes = fs.readFileSync(inputPath);
        const pdfDoc = await PDFDocument.load(pdfBytes);
        
        // Save the PDF without object streams to ensure FPDI compatibility
        const savedBytes = await pdfDoc.save({ useObjectStreams: false });
        
        fs.writeFileSync(outputPath, savedBytes);
        console.log(`Success`);
    } catch (err) {
        console.error("PDF conversion failed:", err);
        process.exit(1);
    }
}

run();
