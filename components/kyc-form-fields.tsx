"use client";

import React, { useEffect, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { useFieldArray } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, MapPin, Plus, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { FileUpload } from "./file-upload";
import { toast } from "sonner";
import { Separator } from "./ui/separator";


interface KYCFormFieldsProps {
  form: UseFormReturn<any>;
  currentStep: number;
}

export function KYCFormFields({ form, currentStep }: KYCFormFieldsProps) {
  const hasOtherContracts = form.watch("otherContracts.hasOther");
  const otherContractNumbers = form.watch("otherContracts.numbers") || [];
  const phoneNumbers = form.watch("phoneNumbers") || [];
  const isMoralEntity = form.watch("isMoralEntity"); // Checkbox value

  useEffect(() => {
    if (isMoralEntity) {
      form.setValue("gender", "company");
      form.setValue("firstName", " ");
    } else {
      form.setValue("gender", "");
      form.setValue("firstName", "");
    }
  }, [isMoralEntity]);



  const addContractNumber = React.useCallback(() => {
    const currentNumbers = form.getValues("otherContracts.numbers") || [];
    form.setValue("otherContracts.numbers", [...currentNumbers, ""]);
  }, [form]);

  const removeContractNumber = React.useCallback((index: number) => {
    const currentNumbers = form.getValues("otherContracts.numbers") || [];
    const newNumbers = [...currentNumbers];
    newNumbers.splice(index, 1);
    form.setValue("otherContracts.numbers", newNumbers);
  }, [form]);

  // // Automatically add/remove fields based on "Have Other Contracts" switch
  // useEffect(() => {
  //   if (hasOtherContracts) {
  //     addContractNumber(); // Add the first field
  //   } else {
  //     otherContractNumbers.forEach((_: string, index: number) => removeContractNumber(index)); // Remove all fields
  //   }
  // }, [hasOtherContracts, addContractNumber, removeContractNumber, otherContractNumbers]);


  const addPhoneNumber = () => {
    const currentPhones = form.getValues("phoneNumbers") || [];
    form.setValue("phoneNumbers", [...currentPhones, { number: "", isWhatsapp: false }]);
  };

  const removePhoneNumber = (index: number) => {
    const currentPhones = form.getValues("phoneNumbers") || [];
    if (currentPhones.length <= 1) {
      toast.error("At least one phone number is required");
      return;
    }
    const newPhones = [...currentPhones];
    newPhones.splice(index, 1);
    form.setValue("phoneNumbers", newPhones);
  };

  const PersonalInfoFields = () => (
    <>
      <div className="col-span-full space-y-6">
        <h2 className="text-lg font-semibold">Personal Information</h2>
      </div>

      {/* Checkbox for Physical Being or Moral Entity */}
      <FormField
        control={form.control}
        name="isMoralEntity"
        render={({ field }) => (
          <FormItem className="col-span-2 flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel>Are you a Moral Entity?</FormLabel>
            </div>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
          </FormItem>
        )}
      />

      {/* First Name (only for Physical Being) */}
      {!isMoralEntity && (
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter your first name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {/* Last Name or Company Name */}
      <FormField
        control={form.control}
        name="lastName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{isMoralEntity ? "Company Name" : "Last Name"}</FormLabel>
            <FormControl>
              <Input
                placeholder={isMoralEntity ? "Enter company name" : "Enter your last name"}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Birthday */}
      <FormField
        control={form.control}
        name="dateOfBirth"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Date of Birth</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full pl-3 text-left font-normal",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    {field.value ? (
                      format(field.value, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={field.onChange}
                  disabled={(date) =>
                    date > new Date() || date < new Date("1900-01-01")
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Gender (only for Physical Being) */}
      {!isMoralEntity && (
        <FormField
          control={form.control}
          name="gender"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Gender</FormLabel>
              <div style={{ marginTop: "1px" }}>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

    </>
  );

  const IdentityFields = () => (
    <>
      <div className="col-span-full space-y-6">
        <h2 className="text-lg font-semibold">Identity Card (CNI, Passport, Others)  </h2>
      </div>

      <FormField
        control={form.control}
        name="identityDocument.type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Identity Document Type</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="CNI">National Identity Card (CNI)</SelectItem>
                <SelectItem value="CS">Residence Permit (CS)</SelectItem>
                <SelectItem value="RECP_CS">Receipt CS</SelectItem>
                <SelectItem value="RECP_CNI">Receipt CNI</SelectItem>
                <SelectItem value="TRADE_REGISTER">Trade Register</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="flex items-start justify-between space-x-2">
        <FormField
          control={form.control}
          name="identityDocument.postfix"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Document postfix</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="AD">Adamawa</SelectItem>
                  <SelectItem value="CE">Centre</SelectItem>
                  <SelectItem value="ES">East</SelectItem>
                  <SelectItem value="EN">Extreme-North</SelectItem>
                  <SelectItem value="LT">Littoral</SelectItem>
                  <SelectItem value="NO">North</SelectItem>
                  <SelectItem value="OU">West</SelectItem>
                  <SelectItem value="SU">South</SelectItem>
                  <SelectItem value="NW">Northwest</SelectItem>
                  <SelectItem value="SW">Southwest</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="identityDocument.number"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Document Number</FormLabel>
              <FormControl>
                <Input placeholder="Enter document number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="identityDocument.validityDate"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Document Validity Date</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full pl-3 text-left font-normal",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    {field.value ? (
                      format(field.value, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={field.onChange}
                  disabled={(date) =>
                    date > new Date() || date < new Date("1900-01-01")
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="identityDocument.frontImage"
          render={({ field: { onChange, value, ...field } }) => (
            <FormItem>
              <FormLabel>ID Front Image</FormLabel>
              <FormControl>
                <FileUpload
                  onFileSelect={onChange}
                  accept={{ 'image/*': ['.png', '.jpg', '.jpeg'] }}
                  label="Upload ID front image"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="identityDocument.backImage"
          render={({ field: { onChange, value, ...field } }) => (
            <FormItem>
              <FormLabel>ID Back Image</FormLabel>
              <FormControl>
                <FileUpload
                  onFileSelect={onChange}
                  accept={{ 'image/*': ['.png', '.jpg', '.jpeg'] }}
                  label="Upload ID back image"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <Separator className=" col-span-2 w-full" />
      <div className="col-span-full space-y-6">
        <h2 className="text-lg font-semibold">Unique Identity Number (NIU) </h2>
      </div>

      <FormField
        control={form.control}
        name="nuiDocument.number"
        render={({ field }) => (
          <FormItem>
            <FormLabel>NUI Document Number</FormLabel>
            <FormControl>
              <Input placeholder="Enter NUI document number" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="nuiDocument.file"
        render={({ field: { onChange, value, ...field } }) => (
          <FormItem>
            <FormLabel>ID Front Image</FormLabel>
            <FormControl>
              <FileUpload
                onFileSelect={onChange}
                accept={{ 'image/*': ['.png', '.jpg', '.jpeg'], 'application/pdf': ['.pdf'] }}
                label="Upload ID front image or PDF"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />



    </>
  );

  const ContactFields = () => (
    <>
      <div className="col-span-full space-y-6">
        <h2 className="text-lg font-semibold">Contact Information</h2>
      </div>

      <div className="col-span-2 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-700">Phone Numbers</h3>
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={addPhoneNumber}
            className="flex items-center gap-2 bg-[#14689E] hover:bg-[#11567E] text-white"
          >
            <Plus className="h-4 w-4" /> Add Phone Number
          </Button>
        </div>

        {phoneNumbers.map((_: any, index: number) => (
          <div key={index} className="flex flex-col justify-between gap-2 pt-4 px-4 pb-8 border rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <FormLabel className="text-sm text-gray-600">Phone Number {index + 1}</FormLabel>

            <div className="flex">
              <div className="flex flex-col md:flex-row items-center gap-4 w-full">
                <FormField
                  control={form.control}
                  name={`phoneNumbers.${index}.number`}
                  render={({ field }: { field: any }) => (
                    <FormItem className="w-full">
                      {/* <FormLabel className="text-sm text-gray-600">Phone Number {index + 1}</FormLabel> */}
                      <FormControl>
                        <Input placeholder="6XXXXXXXX" {...field} className="w-full" />
                      </FormControl>
                      {/* <FormMessage /> */}
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`phoneNumbers.${index}.isWhatsapp`}
                  render={({ field }: { field: any }) => (
                    <FormItem className="w-full flex items-center gap-2">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="data-[state=checked]:bg-[#14689E]"
                        />
                      </FormControl>
                      <FormLabel className="text-sm text-gray-600">
                        This is a WhatsApp number
                      </FormLabel>
                    </FormItem>
                  )}
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removePhoneNumber(index)}
                className="text-red-500 hover:text-red-700 hover:bg-red-50 self-center md:self-start"
              >
                <Trash2 className="h-6 w-6" />
              </Button>
            </div>
            {/* Afficher les messages de validation ici */}
            <FormField
              key={index}
              control={form.control}
              name={`phoneNumbers.${index}.number`}
              render={({ field }: { field: any }) => (
                <FormMessage className="text-red-500 text-sm">
                  {(form.formState.errors.phoneNumbers as any)?.[index]?.number?.message}
                </FormMessage>
              )}
            />


          </div>
        ))}
      </div>

      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email Address</FormLabel>
            <FormControl>
              <Input type="email" placeholder="your@email.com" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="location.reference"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Location Reference</FormLabel>
            <FormControl>
              <Input placeholder="Enter location reference" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="location.gpsCoordinates"
        render={({ field }) => (
          <FormItem>
            <FormLabel>GPS Coordinates</FormLabel>
            <FormControl>
              <div className="relative">
                <Input
                  placeholder="GPS coordinates"
                  {...field}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full"
                  onClick={() => {
                    if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition(
                        (position) => {
                          const coords = `${position.coords.latitude},${position.coords.longitude}`;
                          field.onChange(coords);
                        },
                        (error) => {
                          toast.error("Failed to get location. Please enter manually.");
                        }
                      );
                    }
                  }}
                >
                  <MapPin className="h-4 w-4" />
                </Button>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );

  const MeterFields = () => {

    return (
      <>
        <div className="col-span-full space-y-6">
          <h2 className="text-lg font-semibold">Contract Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="contract.number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contract Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter 10-digit contract number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contract.status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contract.customerStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="landlord">Landlord</SelectItem>
                      <SelectItem value="tenant">Tenant</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contract.usageType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type of Usage</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select usage type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="residential">Residential</SelectItem>
                      <SelectItem value="commercial">Commercial</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>


          <FormField
            control={form.control}
            name="contract.activity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Activity</FormLabel>
                <FormControl>
                  <Input placeholder="Enter activity" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <h2 className="text-lg font-semibold pt-6">Meter Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="contract.meterDetails.number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meter Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter meter number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="contract.meterDetails.status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contract.meterDetails.characteristics"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meter Characteristics</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter meter characteristics" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contract.meterDetails.type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meter Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select meter type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="prepaid">Prepaid</SelectItem>
                      <SelectItem value="postpaid">Postpaid</SelectItem>
                      <SelectItem value="smart">Smart Meter</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contract.meterDetails.itineraryNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Itinerary Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter itinerary number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contract.meterDetails.transformerPower"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Transformer Power</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter transformer power" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contract.meterDetails.voltage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Voltage</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter voltage" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />


          </div>


          <FormField
            control={form.control}
            name="otherContracts.hasOther"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel>Have Other Contracts?</FormLabel>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {hasOtherContracts && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Other Contract Numbers</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addContractNumber}
                  className="flex items-center gap-1 text-[#14689E] border-[#14689E] hover:bg-[#14689E] hover:text-white"
                >
                  <Plus className="h-4 w-4" /> Add Contract
                </Button>
              </div>

              {otherContractNumbers.length === 0 && (
                <p className="text-sm text-muted-foreground">No other contracts added yet.</p>
              )}

              {otherContractNumbers.map((_: string, index: number) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    {/* Champ pour le numéro de contrat */}
                    <FormField
                      control={form.control}
                      name={`otherContracts.numbers.${index}`}
                      render={({ field }: { field: any }) => (
                        <FormItem className="w-full">
                          <FormLabel className="text-sm text-gray-600">Contract Number {index + 1}</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter 10-digit contract number"
                              {...field}
                              className="w-full"
                            />
                          </FormControl>
                          <FormMessage className="text-red-500 text-sm" />
                        </FormItem>
                      )}
                    />

                    {/* Bouton de suppression */}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeContractNumber(index)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 mt-2 md:mt-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Champs liés pour "Type of Usage" et "Meter Details" */}
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Type of Usage */}
                    <FormField
                      control={form.control}
                      name={`otherContracts.usageType.${index}`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm text-gray-600">Type of Usage {index + 1}</FormLabel>
                          <Select onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select usage type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="residential">Residential</SelectItem>
                              <SelectItem value="commercial">Commercial</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-red-500 text-sm" />
                        </FormItem>
                      )}
                    />

                    {/* Meter Number */}
                    <FormField
                      control={form.control}
                      name={`otherContracts.meterDetails.${index}.number`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm text-gray-600">Meter Number {index + 1}</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter meter number"
                              {...field}
                              className="w-full"
                            />
                          </FormControl>
                          <FormMessage className="text-red-500 text-sm" />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Autres champs liés (optionnels) */}
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Itinerary Number */}
                    <FormField
                      control={form.control}
                      name={`otherContracts.meterDetails.${index}.itineraryNumber`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm text-gray-600">Itinerary Number {index + 1}</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter itinerary number"
                              {...field}
                              className="w-full"
                            />
                          </FormControl>
                          <FormMessage className="text-red-500 text-sm" />
                        </FormItem>
                      )}
                    />

                    {/* Transformer Power */}
                    <FormField
                      control={form.control}
                      name={`otherContracts.meterDetails.${index}.transformerPower`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm text-gray-600">Transformer Power {index + 1}</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter transformer power"
                              {...field}
                              className="w-full"
                            />
                          </FormControl>
                          <FormMessage className="text-red-500 text-sm" />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              ))}

            </div>
          )}

        </div>
      </>
    )
  };

  const stepComponents = [
    PersonalInfoFields,
    IdentityFields,
    ContactFields,
    MeterFields,
  ];

  const CurrentStep = stepComponents[currentStep];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <CurrentStep />
    </div>
  );
}