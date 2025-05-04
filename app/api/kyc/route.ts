
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import path from 'path';
import fs from 'fs';
import { writeFile } from 'fs/promises';

export async function POST(request: NextRequest) {
  try {
    // Parse the incoming form data
    const formData = await request.formData();

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
    const voltage = parsedData.contract.meterDetails?.voltage?.trim();
    const activity = parsedData.contract?.activity?.trim();
    const phoneNumbers = parsedData.phoneNumbers;

    // Handle file uploads
    const idFrontImage = formData.get('idFrontImage') as File;
    const idBackImage = formData.get('idBackImage') as File;
    const niuFile = formData.get('niuFile') as File;

    // Create directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'writable', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Extract phone numbers
    interface PhoneNumber {
      number: string;
      isWhatsapp: boolean;
    }

    // Extract other contracts
    interface OtherContract {
      number: string;
    }
    const otherContracts: OtherContract[] = [];
    const otherContractsData = formData.getAll('otherContracts[]') as string[];

    for (const contractNum of otherContractsData) {
      if (contractNum) {
        otherContracts.push({
          number: contractNum
        });
      }
    }

    const createdForm = await prisma.$transaction(async (tx) => {
      // 1. Créer le formulaire sans fichiers
      const kycForm = await tx.kYCForm.create({
        data: {
          fullName,
          firstName,
          lastName,
          gender,
          dateOfBirth,
          idType,
          idNumber,
          idValidityDate,
          niuNumber,
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
          phoneNumbers: { create: phoneNumbers },
          otherContracts: { create: otherContracts },
        },
      });

      const kycFormId = kycForm.id;

      // 2. Uploader les fichiers
      let idFrontImagePath: string | null = null;
      let idBackImagePath: string | null = null;
      let niuFilePath: string | null = null;

      const uploadFile = async (file: File, label: string) => {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const fileName = `${kycFormId}_${label}_${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
        const filePath = path.join(uploadDir, fileName);
        await writeFile(filePath, new Uint8Array(buffer));
        return `/uploads/${fileName}`;
      };

      if (idFrontImage && idFrontImage.size > 0) {
        idFrontImagePath = await uploadFile(idFrontImage, 'id_front');
      }

      if (idBackImage && idBackImage.size > 0) {
        idBackImagePath = await uploadFile(idBackImage, 'id_back');
      }

      if (niuFile && niuFile.size > 0) {
        niuFilePath = await uploadFile(niuFile, 'niu');
      }

      // 3. Mise à jour du formulaire avec les fichiers et relations
      const updatedForm = await tx.kYCForm.update({
        where: { id: kycFormId },
        data: {
          idFrontImagePath,
          idBackImagePath,
          niuFilePath,
        },
      });

      return updatedForm;
    });


    return NextResponse.json({ success: true, data: createdForm }, { status: 201 });
  } catch (error) {
    console.error('Error processing KYC form:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process KYC form' },
      { status: 500 }
    );
  }
}
