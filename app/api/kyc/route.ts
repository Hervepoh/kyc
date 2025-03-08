
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import path from 'path';
import fs from 'fs';
import { writeFile } from 'fs/promises';

export async function POST(request: NextRequest) {
  try {
    // Parse the incoming form data
    const formData = await request.formData();
    console.log("formData",formData)
    console.log("formData.get('formData')",formData.get('formData'))
     // Get the form data as JSON string and parse it
     const formDataJson = formData.get('formData') as string;
     const parsedData = JSON.parse(formDataJson);
     
     // Extract basic form fields from parsed JSON
     const firstName = parsedData.firstName?.trim();
     const lastName = parsedData.lastName.trim();
     const fullName = [firstName, lastName].filter(Boolean).join(' ') || '';
     const gender = parsedData.gender;
     const dateOfBirth = new Date(parsedData.dateOfBirth);
     const idType = parsedData.identityDocument.type;
     const idNumber = parsedData.identityDocument.number;
     const idValidityDate = new Date(parsedData.identityDocument.validityDate);
     const niuNumber = parsedData.nuiDocument.number;
     const locationReference = parsedData.location.reference?.trim();
     const gpsCoordinates = parsedData.location.gpsCoordinates?.trim();
     const email = parsedData.email?.trim();
     const customerStatus = parsedData.contract.customerStatus;
     const contractNumber = parsedData.contract.number?.trim();
     const usageType = parsedData.contract.usageType;
     const meterNumber = parsedData.contract.meterDetails.number?.trim();
     const meterCharacteristics = parsedData.contract.meterDetails?.characteristics?.trim();
     const meterType = parsedData.contract.meterDetails.type;
     const meterStatus = parsedData.contract.meterDetails.status;
     const itineraryNumber = parsedData.contract.meterDetails?.itineraryNumber?.trim();
     const transformerPower = parsedData.contract.meterDetails?.transformerPower?.trim();
     const  voltage = parsedData.contract.meterDetails?.voltage?.trim();
     const activity = parsedData.contract?.activity?.trim();
    
    // Handle file uploads
    const idFrontImage = formData.get('idFrontImage') as File;
    const idBackImage = formData.get('idBackImage') as File;
    const niuFile = formData.get('niuFile') as File;
    
    // Create directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    // Process file uploads
    let idFrontImagePath: string | null = null;
    let idBackImagePath: string | null = null;
    let niuFilePath: string | null = null;
    
    if (idFrontImage && idFrontImage.size > 0) {
      const bytes = await idFrontImage.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const fileName = `id_front_${Date.now()}_${idFrontImage.name}`;
      const filePath = path.join(uploadDir, fileName);
      await writeFile(filePath, new Uint8Array(buffer));
      idFrontImagePath = `/uploads/${fileName}`;
    }
    
    if (idBackImage && idBackImage.size > 0) {
      const bytes = await idBackImage.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const fileName = `id_back_${Date.now()}_${idBackImage.name}`;
      const filePath = path.join(uploadDir, fileName);
      await writeFile(filePath, new Uint8Array(buffer));
      idBackImagePath = `/uploads/${fileName}`;
    }
    
    if (niuFile && niuFile.size > 0) {
      const bytes = await niuFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const fileName = `niu_${Date.now()}_${niuFile.name}`;
      const filePath = path.join(uploadDir, fileName);
      await writeFile(filePath, new Uint8Array(buffer));
      niuFilePath = `/uploads/${fileName}`;
    }
    
    // Extract phone numbers
    const phoneNumbers = [];
    const phoneNumbersData = formData.getAll('phoneNumbers[]') as string[];
    const isWhatsappData = formData.getAll('isWhatsapp[]').map(val => val === 'true');
    
    for (let i = 0; i < phoneNumbersData.length; i++) {
      if (phoneNumbersData[i]) {
        phoneNumbers.push({
          number: phoneNumbersData[i],
          isWhatsapp: isWhatsappData[i] || false
        });
      }
    }
    
    // Extract other contracts
    const otherContracts = [];
    const otherContractsData = formData.getAll('otherContracts[]') as string[];
    
    for (const contractNum of otherContractsData) {
      if (contractNum) {
        otherContracts.push({
          number: contractNum
        });
      }
    }
    
    // Create the KYC form entry with related data
    const kycForm = await prisma.kYCForm.create({
      data: {
        fullName,
        firstName,
        lastName,
        gender,
        dateOfBirth,
        idType,
        idNumber,
        idValidityDate,
        idFrontImagePath,
        idBackImagePath,
        niuNumber,
        niuFilePath,
        locationReference,
        gpsCoordinates,
        email,
        customerStatus,
        contractNumber,
        usageType,
        meterNumber,
        meterCharacteristics,
        meterType,
        itineraryNumber,
        transformerPower,
        voltage,
        meterStatus,
        activity,
        phoneNumbers: {
          create: phoneNumbers
        },
        otherContracts: {
          create: otherContracts
        }
      }
    });
    
    return NextResponse.json({ success: true, data: kycForm }, { status: 201 });
  } catch (error) {
    console.error('Error processing KYC form:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process KYC form' },
      { status: 500 }
    );
  }
}



// import { NextResponse } from 'next/server';
// import prisma from '@/lib/db';

// export async function POST(request: Request) {
//   try {
//     const data = await request.json();

//     const firstName = data.firstName.trim();
//     const lastName = data.lastName.trim();
//     const fullname = firstName + " " + lastName

//     // Create the main KYC form record
//     const kycForm = await prisma.kYCForm.create({
//       data: {
//         fullName: fullname.trim()  ,
//         firstName: firstName,
//         lastName: lastName,
//         gender: data.gender,
//         dateOfBirth: data.dateOfBirth,
        
//         // Identity document
//         idType: data.identityDocument.type,
//         idNumber: data.identityDocument.number.trim(),
//         idValidityDate: data.identityDocument.validityDate,
        
//         // NIU
//         niuNumber: data.nuiDocument.number.trim(),
        
//         // Contact information
//         email: data.email,
//         customerStatus: data.customerStatus,
        
//         // Location
//         locationReference: data.location.reference.trim(),
//         gpsCoordinates: data.location.gpsCoordinates,
        

//         contractNumber: data.contract.number,
//         usageType: data.contract.usageType,
//         // Meter details
//         meterNumber: data.contract.meterDetails.number.trim(),
//         meterCharacteristics: data.contract.meterDetails.characteristics.trim(),
//         meterType: data.contract.meterDetails.type,
//         itineraryNumber: data.contract.meterDetails.itineraryNumber.trim(),
//         transformerPower: data.contract.meterDetails.transformerPower.trim(),
//         voltage: data.contract.meterDetails.voltage.trim(),
//         meterStatus: data.contract.meterDetails.status,
//         activity: data.contract.activity.trim(),
//       }
//     });
    
//     // Create other contracts if they exist
//     if (data.otherContracts?.hasOther && data.otherContracts.numbers?.length > 0) {
//       await Promise.all(
//         data.otherContracts.numbers.map((number: string) => 
//           prisma.otherContract.create({
//             data: {
//               number,
//               kycFormId: kycForm.id
//             }
//           })
//         )
//       );
//     }
    
//     // Create phone numbers
//     if (data.phoneNumbers && data.phoneNumbers.length > 0) {
//       await Promise.all(
//         data.phoneNumbers.map((phone: { number: string, isWhatsapp: boolean }) => 
//           prisma.phoneNumber.create({
//             data: {
//               number: `237${phone.number}`,
//               isWhatsapp: phone.isWhatsapp,
//               kycFormId: kycForm.id
//             }
//           })
//         )
//       );
//     }
    
//     return NextResponse.json({ 
//       success: true, 
//       message: "KYC form submitted successfully",
//       id: kycForm.id
//     });
//   } catch (error) {
//     console.error("Error submitting KYC form:", error);
//     return NextResponse.json(
//       { success: false, message: "Failed to submit KYC form" },
//       { status: 500 }
//     );
//   }
// }