import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST(request: Request) {
  try {
    const data = await request.json();

    const firstName = data.firstName.trim();
    const lastName = data.lastName.trim();
    const fullname = firstName + " " + lastName

    // Create the main KYC form record
    const kycForm = await prisma.kYCForm.create({
      data: {
        fullName: fullname.trim()  ,
        firstName: firstName,
        lastName: lastName,
        gender: data.gender,
        dateOfBirth: data.dateOfBirth,
        
        // Identity document
        idType: data.identityDocument.type,
        idNumber: data.identityDocument.number.trim(),
        idValidityDate: data.identityDocument.validityDate,
        
        // NIU
        niuNumber: data.nuiDocument.number.trim(),
        
        // Contact information
        email: data.email,
        customerStatus: data.customerStatus,
        
        // Location
        locationReference: data.location.reference.trim(),
        gpsCoordinates: data.location.gpsCoordinates,
        

        contractNumber: data.contract.number,
        usageType: data.contract.usageType,
        // Meter details
        meterNumber: data.contract.meterDetails.number.trim(),
        meterCharacteristics: data.contract.meterDetails.characteristics.trim(),
        meterType: data.contract.meterDetails.type,
        itineraryNumber: data.contract.meterDetails.itineraryNumber.trim(),
        transformerPower: data.contract.meterDetails.transformerPower.trim(),
        voltage: data.contract.meterDetails.voltage.trim(),
        meterStatus: data.contract.meterDetails.status,
        activity: data.contract.activity.trim(),
      }
    });
    
    // Create other contracts if they exist
    if (data.otherContracts?.hasOther && data.otherContracts.numbers?.length > 0) {
      await Promise.all(
        data.otherContracts.numbers.map((number: string) => 
          prisma.otherContract.create({
            data: {
              number,
              kycFormId: kycForm.id
            }
          })
        )
      );
    }
    
    // Create phone numbers
    if (data.phoneNumbers && data.phoneNumbers.length > 0) {
      await Promise.all(
        data.phoneNumbers.map((phone: { number: string, isWhatsapp: boolean }) => 
          prisma.phoneNumber.create({
            data: {
              number: `237${phone.number}`,
              isWhatsapp: phone.isWhatsapp,
              kycFormId: kycForm.id
            }
          })
        )
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      message: "KYC form submitted successfully",
      id: kycForm.id
    });
  } catch (error) {
    console.error("Error submitting KYC form:", error);
    return NextResponse.json(
      { success: false, message: "Failed to submit KYC form" },
      { status: 500 }
    );
  }
}