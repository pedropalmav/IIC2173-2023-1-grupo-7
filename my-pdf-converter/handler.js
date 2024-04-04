const AWS = require('aws-sdk');
const PDFDocument = require('pdfkit');

// Create a new instance of the AWS SDK
const s3 = new AWS.S3();

// Lambda function handler
module.exports.convertToPdf = async (event) => {
  try {
    console.log("inside function");
    // Parse the JSON body from the API Gateway event
    const body = JSON.parse(event.body);
    console.log(body);

    const doc = new PDFDocument();

    doc.fontSize(14).text('Event Information:', { underline: true, bold: true });
    doc.fontSize(12).text(`Email: ${body.email}`);
    console.log("1");
    doc.fontSize(12).text(`Date: ${body.date}`);
    console.log("2");
    doc.fontSize(12).text(`Name: ${body.name}`);
    console.log("3");
    doc.fontSize(12).text(`Price: ${body.price}`);
    console.log("4");
    doc.fontSize(12).text(`Quantity: ${body.quantity}`);
    console.log("5");
    doc.fontSize(12).text(`Location: ${body.location}`);
    console.log("6");
    doc.fontSize(12).text(`Latitude: ${body.latitude}`);
    console.log("7");
    doc.fontSize(12).text(`Longitude: ${body.longitude}`);
    console.log("8");
    doc.fontSize(12).text(`Grupo: ${body.grupo}`);
    console.log("9");
    console.log(`Grupo: ${body.grupo}`);

    // Generate a unique filename for the PDF
    const fileName = `document_${Date.now()}.pdf`;
    console.log("10");
    // Create a buffer to store the PDF content
    const buffer = await new Promise((resolve, reject) => {
      console.log("11");
      const chunks = [];
      console.log("12");
      doc.on('data', (chunk) => chunks.push(chunk));
      console.log("13");
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      console.log("14");
      doc.end();
      console.log("15");
    });

    // Upload the PDF to the S3 bucket
    await s3
      .upload({
        Bucket: 'pdf-test-1234',
        Key: fileName,
        Body: buffer,
        ContentType: 'application/pdf',
      })
      .promise();
      console.log("16");

    // Generate the public link of the PDF stored in the S3 bucket
    const pdfLink = `https://pdf-test-1234.s3.us-east-2.amazonaws.com/${fileName}`;
    console.log("17");

    // Return the public link in the API Gateway response
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*', // Set the appropriate allowed origin
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({ pdfLink }),
    };

  } catch (error) {
    // Return an error response if any error occurs
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to convert JSON to PDF' }),
    };
  }
};