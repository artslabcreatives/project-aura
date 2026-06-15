const { PDFDocument } = require('pdf-lib');
const fs = require('fs');

async function run() {
    try {
        const inputPath = '/var/www/aura-staging/storage/app/invoice-templates/tax-vat-invoice-template.pdf';
        const outputPath = '/var/www/aura-staging/storage/app/invoice-templates/tax-vat-invoice-template-pdf-lib.pdf';
        
        console.log(`Loading PDF from ${inputPath}...`);
        const pdfBytes = fs.readFileSync(inputPath);
        const pdfDoc = await PDFDocument.load(pdfBytes);
        
        console.log("Saving PDF with useObjectStreams: false...");
        const savedBytes = await pdfDoc.save({ useObjectStreams: false });
        
        fs.writeFileSync(outputPath, savedBytes);
        console.log(`Success! Saved converted PDF to ${outputPath}. File size: ${savedBytes.length} bytes.`);
    } catch (err) {
        console.error("Error during PDF conversion:", err);
        process.exit(1);
    }
}

run();
